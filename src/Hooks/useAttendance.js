import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { invalidateAttendance } from '../Store/Redux/Attendance/AttendanceSlice';
import { toDateKey } from '../Utils/attendance';

// BEGIN ATTENDANCE TRANSPORT
// The real backend, adapted to the shapes these screens use (src/api/attendance.js)
import * as attendanceService from '../api/attendance';
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
      if (result.ok) {
        attendanceService.forgetContext();
        dispatch(invalidateAttendance());
      }
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

// The signed-in user, as the attendance service needs it (small, so it can key the cache)
function useViewer() {
  const user = useSelector(state => state.auth.value);
  return { user, viewer: user?._id ? { _id: user._id, role: user.role, employeeId: user.employeeId || null } : null };
}

export function useAttendanceAccess() {
  const { user, viewer } = useViewer();
  const resource = useAttendanceResource('context', { viewer }, Boolean(viewer));
  return { ...resource, ...(resource.data || {}), user,
    allEmployees: resource.data?.accessibleEmployees || EMPTY,
    accessibleEmployees: resource.data?.accessibleEmployees || EMPTY,
    canSwitchEmployee: resource.data?.canSwitchEmployee || false };
}

export function useAttendanceReport({ employeeId, startDate, endDate }) {
  const { viewer } = useViewer();
  const resource = useAttendanceResource('report', {
    viewer, employeeId, from: toDateKey(startDate), to: toDateKey(endDate),
  }, Boolean(viewer && employeeId && startDate && endDate));
  return { ...resource, records: resource.data?.records || EMPTY, summary: resource.data?.summary || {},
    isAuthorized: resource.data?.isAuthorized ?? true, actionsAllowed: resource.data?.actionsAllowed ?? false,
    notice: resource.data?.notice || '', isFetching: resource.isFetching };
}

export function useAttendanceDay(date, enabled = true) {
  const { viewer } = useViewer();
  return useAttendanceResource('day', { viewer, date }, Boolean(enabled && viewer && date));
}

export function useAttendanceRequests() {
  const access = useAttendanceAccess();
  const { viewer } = useViewer();
  const resource = useAttendanceResource('requests', { viewer }, Boolean(viewer));
  const mutation = useAttendanceMutation();
  return { ...resource, employee: access.employee, myRequests: resource.data?.items || EMPTY,
    pendingRequestCount: resource.data?.pendingCount ?? 0, isSubmitting: mutation.isSubmitting,
    submitLeave: payload => mutation.submit('leave', payload),
    submitWFH: payload => mutation.submit('wfh', payload),
    submitMissedPunch: payload => mutation.submit('missedPunch', payload),
    submitPunch: payload => mutation.submit('punch', payload),
    setMonthLocked: payload => mutation.submit('monthLock', payload),
    cancelRequest: requestId => mutation.submit('cancel', { requestId }) };
}

export function useAttendanceApprovals() {
  const { viewer } = useViewer();
  const resource = useAttendanceResource('approvals', { viewer }, Boolean(viewer));
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
