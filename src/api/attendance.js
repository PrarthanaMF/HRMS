// Attendance screens <-> HRMS backend.
// The screens were built around one data shape (context / report / day / requests / approvals);
// this file fetches the real endpoints and turns their responses into that shape, so the rules
// stay in the backend and the screens only display what it decides.
import { api, ApiError } from "./client";
import { HR_ROLES, ROLES } from "../Utils/roles";

const SALARY_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER];
const UNLOCK_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const MAX_BACKDATE_DAYS = 60; // backend: requests and corrections at most 60 days back
const MAX_REPORT_DAYS = 62; // backend: longest range one report call accepts
const REQUEST_PAGE = 100;

// ---------------------------------------------------------------------------
// Dates and times
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (date) => date.toISOString().slice(0, 10);
const parseDay = (key) => new Date(`${key}T00:00:00.000Z`);
const addDays = (key, days) => dayKey(new Date(parseDay(key).getTime() + days * DAY_MS));
const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");

// Today in the office time zone (from the backend's settings)
const officeToday = (offsetMinutes = 330) => dayKey(new Date(Date.now() + offsetMinutes * 60000));

// Punch times are office wall-clock times in UTC fields: read the HH:mm part as is
const clock = (iso) => {
  if (!iso) return "--";
  const [hours, minutes] = String(iso).slice(11, 16).split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const hhmmTo12 = (value) => (value ? clock(`2000-01-01T${value}:00.000Z`) : "");

const personName = (person) =>
  person ? person.name || [person.firstName, person.lastName].filter(Boolean).join(" ") : "";

// ---------------------------------------------------------------------------
// Context: who can be viewed, rules for the forms, month locks
// ---------------------------------------------------------------------------

const toEmployee = (employee) => ({
  _id: employee._id,
  empId: employee.employeeId,
  name: employee.name,
  department: employee.department || "",
  designation: employee.designation || "",
  branch: employee.branch?.name || "",
  branchId: employee.branch?._id || null,
  reportingManager: employee.reportingManager?.name || "",
  joiningDate: employee.joiningDate,
  shift: employee.shift ? `${hhmmTo12(employee.shift.start)} – ${hhmmTo12(employee.shift.end)}` : undefined,
  status: "Active",
  relation: employee.relation,
});

const LEAVE_ICON = "fa-regular fa-calendar-check";

// Leave types HR has set up, with the employee's balance, plus comp-off when they have credits to use
const leaveTypeOptions = ({ types, balances, compOff, today }) => {
  const balanceByCode = new Map((balances || []).map((row) => [row.leaveType.code, row]));
  const backdated = addDays(today, -MAX_BACKDATE_DAYS);

  const options = types.map((type) => {
    const balance = balanceByCode.get(type.code);
    const available = balance?.limited ? `${balance.available} day(s) available` : "No balance limit";
    return {
      value: type.code,
      label: type.name,
      description: balance?.notAvailableReason || [available, type.description].filter(Boolean).join(" · "),
      icon: LEAVE_ICON,
      minDate: type.allowPastDates ? backdated : today,
      allowHalfDay: type.allowHalfDay,
    };
  });

  // No leave types yet: leave can still be applied for, without a type
  if (options.length === 0) {
    options.push({ value: "", label: "Leave", description: "HR has not set up leave types yet", icon: LEAVE_ICON, minDate: backdated });
  }

  options.push({
    value: "COMP_OFF",
    label: "Comp Off",
    description: compOff === null ? "Uses comp-off credits earned on holidays / week offs" : `${compOff} comp-off credit(s) available`,
    icon: "fa-solid fa-arrow-rotate-left",
    minDate: backdated,
    allowHalfDay: false,
  });

  return options;
};

// Month lock button per month: shown to payroll roles; locking needs a finished month
const monthControlsFor = ({ role, locks, today }) => {
  const controls = {};
  const lockedMonths = new Set(locks.filter((lock) => lock.status === "LOCKED").map((lock) => lock.month));
  const canLock = SALARY_ROLES.includes(role);
  const canUnlock = UNLOCK_ROLES.includes(role);
  const current = today.slice(0, 7);
  const cursor = parseDay(`${current}-01`);

  for (let back = 0; back <= 24; back += 1) {
    const month = dayKey(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - back, 1))).slice(0, 7);
    const locked = lockedMonths.has(month);
    controls[month] = {
      visible: canLock,
      locked,
      salaryReleased: locked,
      canChange: locked ? canUnlock : canLock && month < current,
    };
  }
  return controls;
};

const optional = (promise, fallback) => promise.catch(() => fallback);

const loadContext = async (user) => {
  const isHr = HR_ROLES.includes(user.role);
  const hasEmployee = Boolean(user.employeeId);

  const [people, settings, types, locks, balances, compOff] = await Promise.all([
    api.get("/attendance/employees"),
    api.get("/attendance/settings"),
    optional(api.get("/leave-types"), []),
    isHr ? optional(api.get("/attendance/locks"), []) : [],
    hasEmployee ? optional(api.get("/leave-balances"), null) : null,
    hasEmployee ? optional(api.get("/attendance/requests/comp-off/balance"), null) : null,
  ]);

  const today = officeToday(settings.timezoneOffsetMinutes);
  const backdated = addDays(today, -MAX_BACKDATE_DAYS);
  const employees = people.employees.map(toEmployee);
  const self = employees.find((employee) => employee.relation === "SELF") || null;
  const leaveTypes = leaveTypeOptions({ types, balances: balances?.balances, compOff: compOff?.balance ?? null, today });

  return {
    demo: false,
    notice: "",
    serverToday: today,
    timezoneOffsetMinutes: settings.timezoneOffsetMinutes,
    rules: settings,
    employee: self,
    accessibleEmployees: employees,
    canSwitchEmployee: employees.length > 1,
    scope: people.scope,
    canManageHolidays: isHr,
    canAccessApprovals: isHr || people.scope !== "self",
    isGlobalApprover: isHr,
    selfServiceEmployeeIds: self ? [self.empId] : [],
    monthControls: monthControlsFor({ role: user.role, locks, today }),
    formOptions: {
      reasonMin: 10,
      reasonMax: 500,
      remarkMax: 500,
      // Leave: per leave type (HR decides whether it can be backdated); this is the widest window
      leaveMinDate: leaveTypes.some((type) => type.minDate === backdated) ? backdated : today,
      wfhMinDate: backdated,
      missedPunchMinDate: backdated,
      missedPunchMaxDate: addDays(today, -1),
      halfDaySingleDate: true,
      wfhDescription: `Approved WFH days with at least ${Math.round(settings.wfhFullDayMinutes / 60)} hours worked are shown as Present and paid as a half day.`,
      leaveTypes,
      durations: [
        { value: "FULL_DAY", label: "Full Day", icon: "fa-solid fa-calendar-day" },
        { value: "FIRST_HALF", label: "First Half", icon: "fa-regular fa-sun" },
        { value: "SECOND_HALF", label: "Second Half", icon: "fa-regular fa-moon" },
      ],
    },
  };
};

// Several screens ask for the context at once; share one load for a short while.
// Cleared after every change (forgetContext) so balances and locks are fresh.
const CONTEXT_TTL_MS = 30000;
let cachedContext = null;

export const forgetContext = () => {
  cachedContext = null;
};

export const context = ({ viewer }) => {
  if (cachedContext?.userId === viewer._id && Date.now() - cachedContext.at < CONTEXT_TTL_MS) return cachedContext.promise;
  const promise = loadContext(viewer);
  cachedContext = { userId: viewer._id, at: Date.now(), promise };
  promise.catch(() => { if (cachedContext?.promise === promise) cachedContext = null; });
  return promise;
};

// ---------------------------------------------------------------------------
// Report and day: the backend's evaluated days as calendar records
// ---------------------------------------------------------------------------

const BLOCKED_PUNCH = { ok: false, type: null, message: "No web punch action is available for this date." };
const NO_CORRECTION = {
  canRegularize: false, canRequestPunchIn: false, canRequestPunchOut: false, canRequestBoth: false,
  hasPunchIn: false, hasPunchOut: false, message: "No missed-punch action is available for this date.",
};
const BLOCKED_ACTIONS = {
  canApplyLeave: false, canApplyWFH: false, canPunchToday: false, canRequestMissedPunch: false,
  showMissedPunchUnavailable: false, mode: "MISSED_PUNCH", webPunch: BLOCKED_PUNCH, missedPunch: NO_CORRECTION,
};

// What the employee may do on one of their own days. The backend still checks every request;
// this only decides which buttons to offer.
const actionsFor = (day, { today, pendingDates }) => {
  const date = day.date;
  if (day.locked || date < addDays(today, -MAX_BACKDATE_DAYS)) return BLOCKED_ACTIONS;

  const isToday = date === today;
  const isOffDay = day.isHoliday || day.isWeekOff;
  const hasPending = pendingDates.has(date);
  const hasPunchIn = Boolean(day.checkIn) && day.missingPunch !== "IN";
  const hasPunchOut = Boolean(day.checkOut) && day.missingPunch !== "OUT";
  const missing = !isToday && date < today && Boolean(day.missingPunch) && !hasPending;

  return {
    canApplyLeave: !isOffDay && !day.request && !hasPending,
    canApplyWFH: !isOffDay && !day.request && !hasPending && date <= today,
    canPunchToday: isToday,
    canRequestMissedPunch: missing,
    showMissedPunchUnavailable: false,
    missedPunchLabel: day.missingPunch === "IN" ? "Missed Punch In" : day.missingPunch === "OUT" ? "Missed Punch Out" : "Missed Punch In/Out",
    mode: isToday ? "WEB_PUNCH" : "MISSED_PUNCH",
    webPunch: isToday ? { ok: true, type: day.checkIn ? "PUNCH_OUT" : "PUNCH_IN", message: "" } : BLOCKED_PUNCH,
    missedPunch: missing
      ? {
          canRegularize: true,
          canRequestPunchIn: day.missingPunch === "IN",
          canRequestPunchOut: day.missingPunch === "OUT",
          canRequestBoth: false,
          hasPunchIn,
          hasPunchOut,
          message: "Enter the missing punch time. Recorded punches are kept.",
        }
      : NO_CORRECTION,
  };
};

const toRecord = (day, { empId, self, today, pendingDates }) => {
  const bothPunches = day.checkIn && day.checkOut && !day.missingPunch;
  return {
    date: day.date,
    empId,
    statusCode: day.code,
    displayStatusCode: day.code,
    status: day.status,
    payable: day.payable,
    punchIn: day.checkIn && day.missingPunch !== "IN" ? clock(day.checkIn) : "--",
    punchOut: day.checkOut && day.missingPunch !== "OUT" ? clock(day.checkOut) : "--",
    durationMinutes: bothPunches ? day.workingMinutes : null,
    workingMinutes: day.workingMinutes,
    lateMinutes: day.lateEntryMinutes || 0,
    isLate: Boolean(day.isLateEntry),
    isEarlyLeaving: Boolean(day.isEarlyLeaving),
    earlyLeavingMinutes: day.earlyLeavingMinutes || 0,
    application: pendingDates.has(day.date) ? "Pending" : day.request ? "Approved" : "--",
    holiday: day.holiday,
    sandwich: day.sandwich,
    missingPunch: day.missingPunch,
    locked: Boolean(day.locked),
    actions: self ? actionsFor(day, { today, pendingDates }) : BLOCKED_ACTIONS,
  };
};

// The summary tiles, worked out from the days exactly as the backend's summary does
const summarise = (days) => {
  const count = (codes) => days.filter((day) => codes.includes(day.code)).length;
  const pay = (codes) => days.filter((day) => codes.includes(day.code)).reduce((sum, day) => sum + (day.payable || 0), 0);
  const decided = days.filter((day) => !day.provisional);
  const decidedPay = decided.reduce((sum, day) => sum + (day.payable || 0), 0);
  const late = days.filter((day) => day.isLateEntry);
  const early = days.filter((day) => day.isEarlyLeaving);

  return {
    present: count(["P"]), presentPayable: pay(["P"]),
    halfDay: count(["HD"]), halfDayPayable: pay(["HD"]),
    wfh: count(["WFH"]), wfhPayable: pay(["WFH"]),
    presentWeekoff: count(["WOP"]), presentWeekoffPayable: pay(["WOP"]),
    presentOnHoliday: count(["HOP"]), presentOnHolidayPayable: pay(["HOP"]),
    holiday: count(["H"]), holidayPayable: pay(["H"]),
    weekoff: count(["WO"]), weekoffPayable: pay(["WO"]),
    leave: count(["AL", "CO"]), leavePayable: pay(["AL", "CO"]),
    unapprovedLeave: count(["UL"]), unapprovedLeavePayable: pay(["UL"]),
    lateIn: late.length, lateInPayable: 0, lateInMinutes: late.reduce((sum, day) => sum + day.lateEntryMinutes, 0),
    earlyLeaving: early.length, earlyLeavingPayable: 0,
    missingPunch: days.filter((day) => day.missingPunch).length,
    recordedDays: days.filter((day) => day.hasRecord).length,
    totalPayable: days.reduce((sum, day) => sum + (day.payable || 0), 0),
    attendancePercentage: decided.length ? Math.round((decidedPay / decided.length) * 1000) / 10 : 0,
  };
};

// One report call covers at most 62 days; longer ranges are fetched in pieces
const fetchDays = async ({ employee, from, to }, signal) => {
  const days = [];
  let start = from;
  while (start <= to) {
    const end = [addDays(start, MAX_REPORT_DAYS - 1), to].sort()[0];
    const part = await api.get("/attendance/report", { employee, from: start, to: end }, { signal });
    days.push(...part.days);
    start = addDays(end, 1);
  }
  return days;
};

// Dates with a request of the signed-in employee still waiting for approval
const pendingDatesOf = async (signal) => {
  const { requests } = await api.get("/attendance/requests/mine", { status: "PENDING", limit: REQUEST_PAGE }, { signal });
  const dates = new Set();
  for (const request of requests) {
    for (let date = dateOnly(request.fromDate); date <= dateOnly(request.toDate); date = addDays(date, 1)) dates.add(date);
  }
  return dates;
};

export const report = async ({ viewer, employeeId, from, to }, signal) => {
  const access = await context({ viewer });
  const self = access.employee?.empId === employeeId;
  const today = access.serverToday;

  try {
    const [days, pendingDates] = await Promise.all([
      fetchDays({ employee: employeeId, from, to }, signal),
      self ? pendingDatesOf(signal) : new Set(),
    ]);
    return {
      isAuthorized: true,
      actionsAllowed: self,
      records: days.map((day) => toRecord(day, { empId: employeeId, self, today, pendingDates })),
      summary: summarise(days),
      notice: "",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { isAuthorized: false, actionsAllowed: false, records: [], summary: {}, notice: error.message };
    }
    throw error;
  }
};

// One of the signed-in employee's own days, for the punch / missed-punch dialog
export const day = async ({ viewer, date }, signal) => {
  const access = await context({ viewer });
  if (!access.employee) return { record: null, actions: BLOCKED_ACTIONS };
  const [days, pendingDates] = await Promise.all([
    fetchDays({ employee: access.employee.empId, from: date, to: date }, signal),
    pendingDatesOf(signal),
  ]);
  const record = toRecord(days[0], { empId: access.employee.empId, self: true, today: access.serverToday, pendingDates });
  return { record, actions: record.actions };
};

// ---------------------------------------------------------------------------
// Requests and approvals
// ---------------------------------------------------------------------------

const UI_TYPE = { REGULARIZATION: "MISSED_PUNCH" };
const STAGE_LABEL = { REPORTING_MANAGER: "Reporting manager review", BRANCH_MANAGER: "Branch manager review", HR: "HR review" };
const DECISION_LABEL = {
  APPROVED: (stage, final) => (final ? "Application approved" : stage === "REPORTING_MANAGER" ? "Approved by reporting manager" : "Approved"),
  REJECTED: () => "Application rejected",
  SKIPPED: () => "Reporting manager step skipped (branch manager decided)",
  AUTO_APPROVED: () => "Approved automatically (branch manager's own request)",
};

const payloadOf = (request) => {
  const base = { reason: request.reason };
  if (request.type === "REGULARIZATION") {
    return {
      ...base,
      date: dateOnly(request.fromDate),
      requestedPunchIn: request.requestedCheckIn || undefined,
      requestedPunchOut: request.requestedCheckOut || undefined,
      missingType: request.requestedCheckIn && request.requestedCheckOut ? "BOTH" : request.requestedCheckIn ? "PUNCH_IN" : "PUNCH_OUT",
    };
  }
  if (request.type === "COMP_OFF_CLAIM") return { ...base, date: dateOnly(request.fromDate) };
  const range = { ...base, from: dateOnly(request.fromDate), to: dateOnly(request.toDate), days: request.days };
  if (request.type === "LEAVE") {
    return { ...range, leaveType: request.leaveType?.code || "", leaveTypeName: request.leaveType?.name || "Leave", duration: request.halfDay || "FULL_DAY" };
  }
  return range;
};

const history = (request) => {
  const approvers = [request.reportingManagerApprover, request.branchManagerApprover].filter(Boolean);
  const nameOf = (employeeId) => personName(approvers.find((person) => String(person._id) === String(employeeId)));
  const entries = [{
    id: `${request._id}-submitted`,
    label: "Application submitted",
    actorName: personName(request.requestedBy) || personName(request.employee),
    at: request.createdAt,
  }];

  request.approvals.forEach((step, index) => {
    const final = index === request.approvals.length - 1 && request.status !== "PENDING";
    entries.push({
      id: `${request._id}-${index}`,
      label: (DECISION_LABEL[step.decision] || (() => step.decision))(step.stage, final),
      status: step.decision === "REJECTED" ? "REJECTED" : step.decision === "SKIPPED" ? undefined : "APPROVED",
      actorName: nameOf(step.byEmployee) || (final ? personName(request.decidedBy) : ""),
      at: step.at,
      remark: step.note || undefined,
    });
  });

  if (request.status === "CANCELLED") {
    entries.push({ id: `${request._id}-cancelled`, label: "Application cancelled", status: "CANCELLED", at: request.updatedAt });
  }
  return entries;
};

const waitingWith = (request) => {
  if (request.status !== "PENDING") return "";
  if (request.stage === "HR") return "HR";
  const names = request.stage === "BRANCH_MANAGER"
    ? [request.branchManagerApprover]
    : [request.reportingManagerApprover, request.branchManagerApprover];
  return names.filter(Boolean).map(personName).filter((name, index, all) => all.indexOf(name) === index).join(" or ");
};

// Own requests the backend would still let the employee withdraw
const cancellable = (request, today) => {
  if (request.status === "PENDING") return request.type !== "COMP_OFF_CLAIM" || !request.consumedBy;
  if (request.status !== "APPROVED") return false;
  if (request.type === "COMP_OFF_CLAIM") return !request.consumedBy;
  return ["LEAVE", "WFH", "COMP_OFF"].includes(request.type) && dateOnly(request.fromDate) > today;
};

const toItem = (request, { canDecide = false, today = "" } = {}) => ({
  id: request._id,
  type: UI_TYPE[request.type] || request.type,
  status: request.status,
  employeeId: request.employee?.employeeId,
  employeeName: personName(request.employee),
  submittedAt: request.createdAt,
  payload: payloadOf(request),
  history: history(request),
  currentStage: request.status === "PENDING" ? STAGE_LABEL[request.stage] || "Awaiting review" : "",
  pendingWith: waitingWith(request),
  canDecide,
  canCancel: cancellable(request, today),
  decisionAt: request.decidedAt || undefined,
  decisionByName: personName(request.decidedBy) || undefined,
  decisionRemark: request.decisionNote || undefined,
  attendanceRecord: null,
});

export const requests = async ({ viewer }, signal) => {
  const access = await context({ viewer });
  if (!access.employee) return { items: [], pendingCount: 0 };
  const { requests: mine } = await api.get("/attendance/requests/mine", { limit: REQUEST_PAGE }, { signal });
  return {
    items: mine.map((request) => toItem(request, { today: access.serverToday })),
    pendingCount: mine.filter((request) => request.status === "PENDING").length,
  };
};

export const approvals = async ({ viewer }, signal) => {
  const access = await context({ viewer });
  const list = (status) => api.get("/attendance/requests/approvals", { status, limit: REQUEST_PAGE }, { signal }).then((data) => data.requests);
  const [pending, approved, rejected] = await Promise.all([list("PENDING"), list("APPROVED"), list("REJECTED")]);
  const processed = [...approved, ...rejected];
  return {
    // The backend's pending list holds exactly the requests waiting on you
    pending: pending.map((request) => toItem(request, { canDecide: true })),
    processed: processed.map((request) => toItem(request)),
    pendingCount: pending.length,
    processedCount: processed.length,
    canAccessApprovals: access.canAccessApprovals || pending.length > 0 || processed.length > 0,
    isGlobalApprover: access.isGlobalApprover,
  };
};

// ---------------------------------------------------------------------------
// Web punch: this browser is the employee's registered device, location sent with each punch
// ---------------------------------------------------------------------------

const DEVICE_KEY = "hrms_punch_device_id";

const deviceId = () => {
  let id = null;
  try {
    id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
  } catch {
    throw new Error("This browser blocks local storage, so it cannot be used for punching.");
  }
  return id;
};

const deviceLabel = () => {
  const agent = navigator.userAgent;
  const browser = /Edg\//.test(agent) ? "Edge" : /Chrome\//.test(agent) ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "Browser";
  const platform = /Android/.test(agent) ? "Android" : /iPhone|iPad/.test(agent) ? "iOS" : /Windows/.test(agent) ? "Windows" : /Mac OS/.test(agent) ? "Mac" : "device";
  return `${browser} on ${platform}`;
};

const position = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser cannot share its location, which punching requires."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) => resolve(result.coords),
      (error) => reject(new Error(
        error.code === error.PERMISSION_DENIED
          ? "Allow location access for this site to punch in or out."
          : "Could not get your location. Check that location is turned on and try again.",
      )),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });

const punch = async () => {
  const id = deviceId();
  // First punch from this browser registers it as the employee's punch device
  if (!(await api.get("/attendance/devices/mine"))) {
    await api.post("/attendance/devices/register", { deviceId: id, label: deviceLabel() });
  }
  const coords = await position();
  const result = await api.post("/attendance/punch", {
    deviceId: id,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : undefined,
  });
  if (result.ignored) return { ok: false, message: result.reason };
  return { ok: true, message: `Punched ${result.punchType === "IN" ? "in" : "out"} at ${clock(result.punches.at(-1)?.time)}` };
};

// ---------------------------------------------------------------------------
// Actions from the forms
// ---------------------------------------------------------------------------

const REQUESTS = "/attendance/requests";

const leave = (payload) => {
  if (payload.leaveType === "COMP_OFF") {
    return api.post(REQUESTS, { type: "COMP_OFF", from: payload.from, to: payload.to, reason: payload.reason });
  }
  return api.post(REQUESTS, {
    type: "LEAVE",
    leaveType: payload.leaveType || undefined,
    from: payload.from,
    to: payload.to,
    halfDay: payload.duration && payload.duration !== "FULL_DAY" ? payload.duration : undefined,
    reason: payload.reason,
  });
};

const ACTIONS = {
  leave: async (payload) => {
    const request = await leave(payload);
    return { ok: true, message: request.status === "APPROVED" ? "Approved automatically." : "Sent for approval." };
  },
  wfh: async (payload) => {
    await api.post(REQUESTS, { type: "WFH", from: payload.from, to: payload.to, reason: payload.reason });
    return { ok: true, message: "Sent for approval." };
  },
  missedPunch: async (payload) => {
    await api.post(REQUESTS, {
      type: "REGULARIZATION",
      date: payload.date,
      checkIn: payload.requestedPunchIn || undefined,
      checkOut: payload.requestedPunchOut || undefined,
      reason: String(payload.reason || "").trim(),
    });
    return { ok: true, message: "Sent to your reporting manager." };
  },
  punch,
  decision: async ({ requestId, decision, remark }) => {
    const path = `${REQUESTS}/${requestId}/${decision === "REJECTED" ? "reject" : "approve"}`;
    await api.patch(path, { note: remark || undefined });
    return { ok: true };
  },
  cancel: async ({ requestId }) => {
    await api.patch(`${REQUESTS}/${requestId}/cancel`);
    return { ok: true };
  },
  monthLock: async ({ month, locked, reason }) => {
    if (locked) await api.post("/attendance/locks", { month });
    else await api.post(`/attendance/locks/${month}/unlock`, { reason });
    return { ok: true };
  },
  importAttendance: async ({ file }) => {
    const form = new FormData();
    form.append("file", file);
    const batch = await api.post("/attendance/import", form);
    const unmatched = batch.unmatchedCodes?.length ? ` Device codes not matched to anyone: ${batch.unmatchedCodes.join(", ")}.` : "";
    return {
      ok: batch.status !== "FAILED",
      message: `${batch.format === "BIOMETRIC" ? "Biometric export" : "Attendance sheet"} imported: ${batch.createdCount} new and ${batch.updatedCount} updated day(s), ${batch.unchangedCount} unchanged.${unmatched}`,
      importedCount: batch.createdCount + batch.updatedCount,
      skippedCount: batch.skippedCount,
      failedCount: batch.failedCount,
    };
  },
};

export const submit = async (action, payload) => {
  if (!ACTIONS[action]) throw new Error("Unknown attendance action.");
  return ACTIONS[action](payload);
};
