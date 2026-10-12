import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { invalidateAttendance } from '../Store/Redux/Attendance/AttendanceSlice';
import { toDateKey } from '../Utils/attendance';
import { ROLES } from '../Utils/roles';

// BEGIN ATTENDANCE TRANSPORT
import attendanceFixture from '../Mocks/attendanceFixture.json' with { type: 'json' };

// Transport boundary: components consume response values, never attendance rules.
// Set VITE_ATTENDANCE_API_BASE_URL to use the backend contract in ATTENDANCE-INTEGRATION.md.
const baseUrl = (import.meta.env?.VITE_ATTENDANCE_API_BASE_URL || '').replace(/\/$/, '');

async function backend(path, { signal, method = 'GET', body } = {}) {
  const isUpload = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${baseUrl}${path}`, {
    method, signal, credentials: 'include',
    ...(body ? isUpload ? { body } : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to load attendance.');
  return data;
}

async function contextFor(viewerId) {
  const data = attendanceFixture;
  const context = data.contexts[String(viewerId)];
  if (!context) throw new Error('No attendance demo profile exists for this account.');
  return { data, context };
}

export const attendanceService = {
  async context({ viewerId }, signal) {
    if (baseUrl) return backend('/context', { signal });
    const { data, context } = await contextFor(viewerId);
    return { ...context, serverToday: data.serverToday, defaultRange: data.defaultRange,
      defaultSelectedDate: data.defaultSelectedDate, formOptions: data.formOptions, notice: data.notice, demo: true };
  },
  async report({ viewerId, employeeId, from, to }, signal) {
    if (baseUrl) return backend(`/report?${new URLSearchParams({ employeeId, from, to })}`, { signal });
    const { data, context } = await contextFor(viewerId);
    if (!context.accessibleEmployees.some(employee => String(employee.empId) === String(employeeId))) {
      throw new Error('This employee is not included in your demo profile.');
    }
    const summary = data.summaries[`${from}|${to}`];
    return {
      isAuthorized: true, actionsAllowed: context.selfServiceEmployeeIds.includes(String(employeeId)),
      records: summary ? data.records.filter(record => record.date >= from && record.date <= to)
        .map(record => ({ ...record, empId: employeeId })) : [],
      summary: summary || data.emptySummary,
      notice: summary ? '' : 'No prepared demo report exists for this range. Choose dates within September–October 2026.',
    };
  },
  async day({ viewerId, date }, signal) {
    if (baseUrl) return backend(`/day?${new URLSearchParams({ date })}`, { signal });
    const { data, context } = await contextFor(viewerId);
    const record = data.records.find(item => item.date === date);
    return { record: record ? { ...record, empId: context.employee.empId } : null,
      actions: record?.actions || data.blockedActions };
  },
  async requests({ viewerId }, signal) {
    if (baseUrl) return backend('/requests', { signal });
    const { context } = await contextFor(viewerId);
    return { items: context.myRequests, pendingCount: context.pendingRequestCount };
  },
  async approvals({ viewerId }, signal) {
    if (baseUrl) return backend('/approvals', { signal });
    const { context } = await contextFor(viewerId);
    return { pending: context.pendingApprovals, processed: context.processedApprovals,
      pendingCount: context.pendingApprovalCount, processedCount: context.processedApprovalCount,
      canAccessApprovals: context.canAccessApprovals, isGlobalApprover: context.isGlobalApprover };
  },
  async submit(action, payload) {
    if (action === 'importAttendance') {
      if (!baseUrl) return { ok: false, message: 'The sheet is ready to upload. Attendance import is not connected yet; no attendance was changed.' };
      const body = new FormData();
      body.append('file', payload.file);
      return backend('/imports', { method: 'POST', body });
    }
    if (!baseUrl) return { ok: false, message: 'Demo preview only. Nothing was saved. Connect the attendance backend to submit requests, record punches, approve requests, or change month locks.' };
    const paths = { leave: '/requests/leave', wfh: '/requests/wfh', missedPunch: '/requests/missed-punch', punch: '/punches', decision: '/requests/decision', monthLock: '/month-lock' };
    if (!paths[action]) throw new Error('Unknown attendance action.');
    return backend(paths[action], { method: 'POST', body: payload });
  },
};
// END ATTENDANCE TRANSPORT

const EMPTY = [];

function useAttendanceResource(method, parameters, enabled = true) {
  const revision = useSelector(state => state.attendance.revision);
  const [refresh, setRefresh] = useState(0);
  const key = JSON.stringify(parameters);
  const identityKey = `${method}|${key}`;
  const requestKey = `${identityKey}|${revision}|${refresh}`;
  const scheduledRefresh = useRef(null);
  const [state, setState] = useState({ key: '', data: null, error: null, loading: true });
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState(previous => ({ key: identityKey, data: previous.key === identityKey ? previous.data : null, error: null, loading: true }));
    let active = true;
    attendanceService[method](JSON.parse(key), controller.signal).then(
      data => { if (active) setState({ key: identityKey, data, error: null, loading: false }); },
      error => { if (active && error.name !== 'AbortError') setState({ key: identityKey, data: null, error, loading: false }); },
    );
    return () => { active = false; controller.abort(); };
  }, [method, key, identityKey, requestKey, enabled]);
  useEffect(() => {
    if (!enabled) return;
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') setRefresh(value => value + 1); };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    // The backend can supply when eligibility may change. This schedules a refetch,
    // and does not grant an action using the client clock.
    const refreshAt = state.data?.refreshAt;
    const refreshKey = `${identityKey}|${refreshAt}`;
    const delay = refreshAt ? new Date(refreshAt).getTime() - Date.now() : NaN;
    const timer = Number.isFinite(delay) && scheduledRefresh.current !== refreshKey
      ? window.setTimeout(() => {
          scheduledRefresh.current = refreshKey;
          setRefresh(value => value + 1);
        }, Math.min(2147483647, Math.max(1000, delay))) : null;
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [enabled, identityKey, state.data]);
  // Never show the previous employee/date response while a new request is in flight.
  const current = enabled && state.key === identityKey ? state : { data: null, error: null, loading: enabled };
  return { data: current.data, error: current.error, isLoading: current.loading && !current.data, isFetching: current.loading, isError: Boolean(current.error) };
}

function useAttendanceMutation() {
  const dispatch = useDispatch();
  const pending = useRef(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const submit = async (action, payload) => {
    if (pending.current) return { ok: false, message: 'Please wait for the current request.' };
    pending.current = true;
    setSubmitting(true);
    try {
      const result = await attendanceService.submit(action, payload);
      if (result.ok) dispatch(invalidateAttendance());
      return result;
    } catch (error) {
      return { ok: false, message: error.message || 'Unable to submit attendance request.' };
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  };
  return { submit, isSubmitting };
}

export function useAttendanceAccess() {
  const user = useSelector(state => state.auth.value);
  const resource = useAttendanceResource('context', { viewerId: user?.empId }, Boolean(user?.empId));
  return { ...resource, ...(resource.data || {}), user,
    allEmployees: resource.data?.accessibleEmployees || EMPTY,
    accessibleEmployees: resource.data?.accessibleEmployees || EMPTY,
    canSwitchEmployee: resource.data?.canSwitchEmployee || false };
}

export function useAttendanceReport({ viewer, employeeId, startDate, endDate }) {
  const resource = useAttendanceResource('report', {
    viewerId: viewer?.empId, employeeId, from: toDateKey(startDate), to: toDateKey(endDate),
  }, Boolean(viewer?.empId && employeeId && startDate && endDate));
  return { ...resource, records: resource.data?.records || EMPTY, summary: resource.data?.summary || {},
    isAuthorized: resource.data?.isAuthorized ?? true, actionsAllowed: resource.data?.actionsAllowed ?? false,
    notice: resource.data?.notice || '', isFetching: resource.isFetching };
}

export function useAttendanceDay(date, enabled = true) {
  const user = useSelector(state => state.auth.value);
  return useAttendanceResource('day', { viewerId: user?.empId, date }, Boolean(enabled && user?.empId && date));
}

export function useAttendanceRequests() {
  const access = useAttendanceAccess();
  const resource = useAttendanceResource('requests', { viewerId: access.user?.empId }, Boolean(access.user?.empId));
  const mutation = useAttendanceMutation();
  return { ...resource, employee: access.employee, myRequests: resource.data?.items || EMPTY,
    pendingRequestCount: resource.data?.pendingCount ?? 0, isSubmitting: mutation.isSubmitting,
    submitLeave: payload => mutation.submit('leave', payload),
    submitWFH: payload => mutation.submit('wfh', payload),
    submitMissedPunch: payload => mutation.submit('missedPunch', payload),
    submitPunch: payload => mutation.submit('punch', payload),
    setMonthLocked: payload => mutation.submit('monthLock', payload),
    importAttendance: file => access.user?.role === ROLES.SUPER_ADMIN
      ? mutation.submit('importAttendance', { file })
      : Promise.resolve({ ok: false, message: 'Only Super Admin can import attendance.' }) };
}

export function useAttendanceApprovals() {
  const user = useSelector(state => state.auth.value);
  const resource = useAttendanceResource('approvals', { viewerId: user?.empId }, Boolean(user?.empId));
  const mutation = useAttendanceMutation();
  return { ...resource, pendingApprovals: resource.data?.pending || EMPTY,
    processedApprovals: resource.data?.processed || EMPTY,
    pendingApprovalCount: resource.data?.pendingCount ?? 0,
    processedApprovalCount: resource.data?.processedCount ?? 0,
    canAccessApprovals: resource.data?.canAccessApprovals || false,
    isGlobalApprover: resource.data?.isGlobalApprover || false,
    isSubmitting: mutation.isSubmitting,
    decideRequest: (requestId, decision, remark) => mutation.submit('decision', { requestId, decision, remark }),
    getAttendanceRecordForRequest: request => request?.attendanceRecord || null };
}
