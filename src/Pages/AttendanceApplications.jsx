import React, { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAttendanceAccess, useAttendanceApprovals, useAttendanceRequests } from "../Hooks/useAttendance";
import { RequestModal } from "../Components/Pages/Attendance/AttendanceForms";

/*
 * AttendanceApplications.jsx — place in src/Pages/.
 * In App.jsx change only the import source from ./Pages/AttendanceWorkflow
 * to ./Pages/AttendanceApplications. Existing named exports/routes still work.
 * Change the Attendance page's visible Approvals button label/title to Applications.
 *
 * EDIT GUIDE
 * 1. LABELS / TONES: wording and colors.
 * 2. Tracking / RequestDetails: displayed fields and tracking layout.
 * 3. ApplicationBrowser: compact views, filters and the application popup.
 * 4. Page exports: existing hooks and approval submission.
 *
 * DATA CONTRACT (existing fields continue to work):
 * request: id, type, status, employeeId, employeeName, submittedAt, payload,
 * approverName, approverEmpId, decisionAt, decisionByName, decisionByEmpId,
 * decisionRemark, attendanceRecord.
 * Optional backend fields for multi-stage tracking:
 * currentStage: string; pendingWith: string (current person/team);
 * history: [{id, label, status, actorName, at, remark}].
 * history is the complete ordered audit trail, including submission when present.
 * Optional GET /approvals response: allApplications (complete authorized list).
 * Without it, All applications uses the existing pending + processed records.
 * Return all records in these arrays; server pagination requires hook integration.
 * The frontend never calculates attendance, payroll, approvers or workflow stages.
 * Backend must enforce access, record eligibility, month locks and decisions.
 */

const LABELS = { requests: "My Requests", applications: "Applications", inbox: "Awaiting my approval", all: "All applications" };
// Display names only; backend leave codes remain unchanged. Extend for company-specific types.
const LEAVE_NAMES = { CL: "Casual Leave", SL: "Sick Leave", EL: "Earned Leave", CO: "Compensatory Leave" };
const leaveName = (payload) => {
  // The backend sends the leave type's name as HR set it up; codes are the fallback
  if (payload.leaveTypeName) return String(payload.leaveTypeName).trim();
  const value = String(payload.leaveType || "").trim();
  return LEAVE_NAMES[value.toUpperCase()] || value || "Leave name not provided";
};
const TYPES = { LEAVE: "Leave", WFH: "Work From Home", MISSED_PUNCH: "Missed Punch", COMP_OFF: "Comp-off Day", COMP_OFF_CLAIM: "Comp-off Claim" };
const TONES = {
  PENDING: { label: "Pending", icon: "fa-regular fa-clock", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", icon: "fa-solid fa-check", badge: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", icon: "fa-solid fa-xmark", badge: "border-red-200 bg-red-50 text-red-800", dot: "bg-red-500" },
  CANCELLED: { label: "Cancelled", icon: "fa-solid fa-ban", badge: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" },
};
const UNKNOWN = { label: "Not provided", icon: "fa-regular fa-circle", badge: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" };
const buttonClass = "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold sm:min-h-9 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "min-h-11 min-w-0 w-full max-w-full rounded-lg border border-slate-200 bg-white px-2.5 text-base sm:min-h-9 sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
const cn = (...values) => values.filter(Boolean).join(" ");
const typeLabel = (request) => TYPES[request.type] || request.type || "Attendance application";
const toneFor = (status) => TONES[status] || { ...UNKNOWN, label: status || UNKNOWN.label };
const pendingWith = (request) => request.pendingWith || request.approverName || request.approverEmpId || "Approver not provided";
const dateLabel = (value, withTime = false) => {
  if (!value) return "Not provided";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  });
};
const periodLabel = (request) => {
  const { date, from, to } = request.payload || {};
  return date ? dateLabel(date) : from && to && from !== to ? `${dateLabel(from)} – ${dateLabel(to)}` : dateLabel(from || to);
};

function StatusBadge({ status }) {
  const tone = toneFor(status);
  return <span className={cn("inline-flex max-w-full flex-wrap items-center gap-1.5 [overflow-wrap:anywhere] rounded-full border px-2 py-0.5 text-[10px] font-semibold", tone.badge)}><i aria-hidden="true" className={tone.icon} />{tone.label}</span>;
}
function Field({ label, children }) {
  return <div className="min-w-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm font-medium text-slate-800">{children || "Not provided"}</dd></div>;
}

// Uses recorded events only. No made-up HR/manager stages or completion dates.
function Tracking({ request }) {
  const events = Array.isArray(request.history) && request.history.length ? request.history : [
    { label: "Application submitted", hideActor: true, at: request.submittedAt },
    ...(request.status === "APPROVED" || request.status === "REJECTED" ? [{ label: toneFor(request.status).label, status: request.status, actorName: request.decisionByName || request.decisionByEmpId, at: request.decisionAt, remark: request.decisionRemark }] : []),
  ];
  return <section aria-label="Application tracking" className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
    <h4 className="mb-4 text-sm font-bold text-slate-800">Application tracking</h4>
    <ol className="space-y-4">
      {events.map((event, index) => <li key={event.id || index} className="relative flex gap-3">
        <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", toneFor(event.status).dot)} />
        <div className="min-w-0 flex-1">
          <p className="[overflow-wrap:anywhere] text-sm font-semibold text-slate-800">{event.label || toneFor(event.status).label}</p>
          <p className="mt-0.5 [overflow-wrap:anywhere] text-xs leading-5 text-slate-500">{!event.hideActor && <>{event.actorName || "Actor not provided"} · </>}{dateLabel(event.at, true)}</p>
          {event.remark && <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm text-slate-600">{event.remark}</p>}
        </div>
      </li>)}
      {request.status === "PENDING" && <li className="flex gap-3"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 ring-4 ring-amber-100" /><div className="min-w-0"><p className="[overflow-wrap:anywhere] text-sm font-semibold text-amber-900">{request.currentStage || "Awaiting review"}</p><p className="mt-1 [overflow-wrap:anywhere] text-sm text-amber-800">Pending with {pendingWith(request)}</p></div></li>}
    </ol>
    {request.decisionRemark && !events.some(event => event.remark === request.decisionRemark) && <dl className="mt-3"><Field label="Decision remark">{request.decisionRemark}</Field></dl>}
  </section>;
}

function RequestDetails({ request }) {
  const payload = request.payload || {};
  const record = request.attendanceRecord;
  const missedPunch = request.type === "MISSED_PUNCH";
  return <div className="space-y-4">
    <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
      <Field label="Employee">{[request.employeeName, request.employeeId].filter(Boolean).join(" · ")}</Field>
      <Field label={missedPunch ? "Attendance date" : "Application period"}>{periodLabel(request)}</Field>
      {payload.leaveType && <Field label="Leave type">{leaveName(payload)}</Field>}
      {payload.duration && <Field label="Duration">{({ FULL_DAY: "Full Day", FIRST_HALF: "First Half", SECOND_HALF: "Second Half" })[payload.duration] || payload.duration}</Field>}
    </dl>
    {(missedPunch || record) && <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3 py-2 text-xs">
        <h4 className="font-semibold text-slate-700">{missedPunch ? "Punch correction" : "Attendance record"}</h4>
        {record && <span className="text-slate-500">Status: {record.displayStatusCode || record.statusCode || "Not provided"}</span>}
      </div>
      {record?.date && record.date !== (payload.date || payload.from) && <p className="px-3 pt-2 text-xs text-slate-500">Record date: {dateLabel(record.date)}</p>}
      <table className="w-full table-fixed text-left text-xs">
        <thead><tr className="text-slate-500"><th scope="col" className="px-3 py-2 font-medium">Punch</th><th scope="col" className="px-3 py-2 font-medium">Recorded</th>{missedPunch && <th scope="col" className="px-3 py-2 font-medium">Requested</th>}</tr></thead>
        <tbody>{[["In", record?.punchIn, payload.requestedPunchIn], ["Out", record?.punchOut, payload.requestedPunchOut]].map(([label, recorded, requested]) => <tr key={label} className="border-t border-slate-100 text-slate-700"><th scope="row" className="px-3 py-2 font-medium">{label}</th><td className="px-3 py-2 [overflow-wrap:anywhere]">{recorded || "—"}</td>{missedPunch && <td className="px-3 py-2 font-semibold [overflow-wrap:anywhere]">{requested || "—"}</td>}</tr>)}</tbody>
      </table>
    </section>}
    <dl><Field label="Reason / work plan">{payload.reason}</Field></dl>
    <Tracking request={request} />
  </div>;
}

function ApplicationCard({ request, view, onView }) {
  const row = view === "content";
  return <article className={cn("min-w-0 rounded-xl border border-slate-200 bg-white p-3", row && "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center")}>
    <div className={cn("min-w-0", row && "md:mt-0")}>
      <div className="flex flex-wrap items-center gap-2"><h3 className="min-w-0 [overflow-wrap:anywhere] text-xs font-bold text-slate-900">{typeLabel(request)}</h3><StatusBadge status={request.status} /></div>
      <p className="mt-1 [overflow-wrap:anywhere] text-[11px] text-slate-500" title={String(request.id)}>#{request.id}</p>
    </div>
    <div className={cn("mt-2 min-w-0", row && "md:mt-0")}>
      <p className="[overflow-wrap:anywhere] text-xs font-semibold text-slate-700" title={request.employeeName || request.employeeId}>{request.employeeName || request.employeeId || "Employee not provided"}</p>
      <p className="mt-1 text-[11px] text-slate-500">{periodLabel(request)}</p>
    </div>
    <div className={cn("mt-2 min-w-0", row && "md:mt-0")}>
      <p className="[overflow-wrap:anywhere] text-[11px] text-slate-500" title={request.status === "PENDING" ? pendingWith(request) : request.decisionByName || request.decisionByEmpId}>
        {request.status === "PENDING" ? `Pending with: ${pendingWith(request)}` : `Reviewed by: ${request.decisionByName || request.decisionByEmpId || "Not provided"}`}
      </p>
    </div>
    <button type="button" onClick={() => onView(String(request.id))} className={cn(buttonClass, "mt-3 border-slate-200 bg-slate-50 text-[#1B4A7B] hover:bg-blue-50", row ? "w-full md:mt-0 lg:w-auto" : "w-full")}>
      View application
    </button>
  </article>;
}

// Native radio controls retain keyboard navigation inside the styled dropdown.
function FilterDropdown({ label, value, options, onChange }) {
  const id = useId();
  const dropdown = useRef(null);
  useEffect(() => {
    const closeOutside = event => {
      if (dropdown.current && !dropdown.current.contains(event.target)) dropdown.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return <div className="min-w-0">
    <p id={`${id}-label`} className="mb-1 text-xs font-medium text-slate-600">{label}</p>
    <details ref={dropdown} className="relative min-w-0" onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dropdown.current.open = false; dropdown.current.querySelector("summary").focus(); }
    }}>
      <summary aria-labelledby={`${id}-label ${id}-value`} className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#1B4A7B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] sm:min-h-9 [&::-webkit-details-marker]:hidden">
        <span id={`${id}-value`} className="min-w-0 break-words">{options.find(option => option.value === value)?.label}</span>
        <i aria-hidden="true" className="fa-solid fa-chevron-down shrink-0 text-[10px]" />
      </summary>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-[#D8E7F2] bg-white p-1.5 shadow-lg">
        {options.map(option => <label key={option.value} className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs sm:min-h-9", option.value === value ? "bg-[#F0F6FA] font-semibold text-[#1B4A7B]" : "text-slate-600 hover:bg-slate-50")}>
          <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="h-4 w-4 shrink-0 accent-[#1B4A7B]" />
          <span className="min-w-0 flex-1 break-words">{option.label}</span>
          {option.count != null && <span className="text-[11px] tabular-nums text-slate-500">{option.count}</span>}
        </label>)}
        <button type="button" onClick={() => { dropdown.current.open = false; dropdown.current.querySelector("summary").focus(); }} className="mt-1 min-h-9 w-full rounded-lg border-t border-slate-100 text-xs font-semibold text-[#1B4A7B]">Done</button>
      </div>
    </details>
  </div>;
}

function ApplicationBrowser({ requests, pendingIds = new Set(), onDecision, onCancel, busy = false }) {
  const [view, setView] = useState("tiles");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterId = useId();
  const filterButton = useRef(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [selectedId, setSelectedId] = useState("");
  // Resolve the current record on every render so refreshed decisions stay current.
  const selected = requests.find(request => String(request.id) === selectedId);
  const canDecide = Boolean(selected && onDecision && selected.status === "PENDING" && pendingIds.has(String(selected.id)) && selected.canDecide !== false);
  // Withdraw your own application (the backend decides what may still be cancelled)
  const canCancel = Boolean(selected && onCancel && selected.canCancel);
  const startDecision = (status) => {
    setSelectedId(""); // Close details before opening the confirmation dialog.
    onDecision(selected, status);
  };
  const activeFilterCount = Number(Boolean(query.trim())) + Number(type !== "ALL") + Number(status !== "ALL");
  const closeFilters = () => { setFiltersOpen(false); filterButton.current?.focus(); };
  const search = query.trim().toLowerCase();
  const filtered = requests.filter(request => (status === "ALL" || request.status === status) && (type === "ALL" || request.type === type) && [request.id, request.employeeName, request.employeeId, typeLabel(request), request.payload?.reason, pendingWith(request), request.currentStage].filter(Boolean).join(" ").toLowerCase().includes(search))
    .sort((a, b) => (Date.parse(b.submittedAt) || 0) - (Date.parse(a.submittedAt) || 0));
  return <>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <button ref={filterButton} type="button" aria-expanded={filtersOpen} aria-controls={filterId} onClick={() => setFiltersOpen(open => !open)} className={cn(buttonClass, activeFilterCount || filtersOpen ? "border-[#A4C8E1] bg-[#F0F6FA] text-[#1B4A7B]" : "border-slate-200 bg-white text-slate-600")}>
        <i aria-hidden="true" className="fa-solid fa-sliders" />Filter
        {activeFilterCount > 0 && <span aria-label={`${activeFilterCount} active filters`} className="rounded-full bg-[#1B4A7B] px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
      </button>
      <div role="group" aria-label="Application view" className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5">{["tiles", "content"].map(value => <button type="button" key={value} onClick={() => setView(value)} aria-pressed={view === value} className={cn(buttonClass, "gap-1.5 px-2", view === value ? "border-transparent bg-[#F0F6FA] text-[#1B4A7B]" : "border-transparent text-slate-500 hover:bg-slate-50")}><i aria-hidden="true" className={`fa-solid ${value === "tiles" ? "fa-grip" : "fa-list"}`} />{value === "tiles" ? "Tiles" : "Content"}</button>)}</div>
    </div>
    <section id={filterId} hidden={!filtersOpen} aria-label="Application filters" className="mb-3 rounded-xl border border-[#D8E7F2] bg-white p-3" onKeyDown={event => { if (event.key === "Escape") closeFilters(); }}>
      {filtersOpen && <>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="min-w-0 text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-1">Search applications<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="ID, employee, approver or reason" className={cn(inputClass, "mt-1")} /></label>
          <FilterDropdown label="Status" value={status} onChange={setStatus} options={["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(value => ({ value, label: value === "ALL" ? "All statuses" : toneFor(value).label, count: value === "ALL" ? requests.length : requests.filter(item => item.status === value).length }))} />
          <FilterDropdown label="Application type" value={type} onChange={setType} options={[{ value: "ALL", label: "All types" }, ...Object.entries(TYPES).map(([value, label]) => ({ value, label }))]} />
        </div>
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button type="button" onClick={() => { setQuery(""); setStatus("ALL"); setType("ALL"); }} className={cn(buttonClass, "border-slate-200 text-slate-600")}>Reset</button>
          <button type="button" onClick={closeFilters} className={cn(buttonClass, "border-[#1B4A7B] bg-[#1B4A7B] text-white")}>Show results</button>
        </div>
      </>}
    </section>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-xs text-slate-500">Showing {filtered.length} of {requests.length} applications · newest first</p>{(query || type !== "ALL" || status !== "ALL") && <button type="button" onClick={() => { setQuery(""); setType("ALL"); setStatus("ALL"); }} className="rounded px-2 py-1 text-xs font-semibold text-[#1B4A7B] underline focus-visible:ring-2 focus-visible:ring-blue-500">Clear filters</button>}</div>
    {filtered.length ? <div className={view === "tiles" ? "grid min-w-0 grid-cols-1 items-start gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid min-w-0 grid-cols-1 gap-2"}>{filtered.map(request => <ApplicationCard key={request.id} request={request} view={view} onView={setSelectedId} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-semibold text-slate-800">{requests.length ? "No matching applications" : "No applications here yet"}</h3><p className="mt-2 text-sm text-slate-500">{requests.length ? "Try another search or clear the filters." : "Applications will appear here when available."}</p></div>}
    <RequestModal open={Boolean(selected)} title={selected ? typeLabel(selected) : "Application"} subtitle={selected ? `Application #${selected.id}` : ""} icon="fa-regular fa-file-lines" onClose={() => setSelectedId("")}>
      {selected && <div className="space-y-4 p-3 sm:p-4">
        <StatusBadge status={selected.status} />
        <RequestDetails request={selected} />
        {canDecide && <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:flex sm:justify-end">
          <button type="button" disabled={busy} className={cn(buttonClass, "border-red-200 text-red-700 hover:bg-red-50")} onClick={() => startDecision("REJECTED")}>Reject</button>
          <button type="button" disabled={busy} className={cn(buttonClass, "border-[#1B4A7B] bg-[#1B4A7B] text-white")} onClick={() => startDecision("APPROVED")}>Approve</button>
        </div>}
        {canCancel && <div className="flex justify-end border-t border-slate-100 pt-3">
          <button type="button" disabled={busy} className={cn(buttonClass, "border-red-200 text-red-700 hover:bg-red-50")} onClick={() => onCancel(selected)}>Cancel application</button>
        </div>}
      </div>}
    </RequestModal>
  </>;
}

function PageShell({ title, subtitle, children }) {
  const navigate = useNavigate();
  return <main className="min-h-full min-w-0 w-full bg-[#f3f7fa] px-3 py-3 text-slate-900 sm:px-4"><div className="mx-auto min-w-0 w-full max-w-[1440px]"><header className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#52718c]">Attendance</p><h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{subtitle}</p></div><button type="button" onClick={() => navigate("/attendance")} className={cn(buttonClass, "shrink-0 border-slate-200 bg-white text-[#1B4A7B]")} aria-label="Back to attendance"><i aria-hidden="true" className="fa-solid fa-arrow-left" /></button></header>{children}</div></main>;
}
function LoadState({ loading, error }) {
  return loading ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading applications…</p> : <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error?.message || "Unable to load applications."}</p>;
}

export function AttendanceRequestsPage() {
  const { myRequests = [], isLoading, error, isSubmitting, cancelRequest } = useAttendanceRequests();
  const [cancelError, setCancelError] = useState("");
  const cancel = async (request) => {
    if (!window.confirm(`Cancel this ${typeLabel(request).toLowerCase()} application?`)) return;
    setCancelError("");
    const result = await cancelRequest(request.id);
    if (!result?.ok) setCancelError(result?.message || "Unable to cancel the application.");
  };
  return <PageShell title={LABELS.requests} subtitle="Track your applications and their current reviewer.">
    {cancelError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{cancelError}</p>}
    {isLoading || error ? <LoadState loading={isLoading} error={error} /> : <ApplicationBrowser requests={myRequests} onCancel={cancel} busy={isSubmitting} />}
  </PageShell>;
}

export function AttendanceApplicationsPage() {
  const { formOptions = {} } = useAttendanceAccess();
  const approvals = useAttendanceApprovals();
  const { pendingApprovals = [], processedApprovals = [], canAccessApprovals, isLoading, error: loadError, isSubmitting, decideRequest } = approvals;
  const [tab, setTab] = useState("inbox");
  const [decision, setDecision] = useState(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const busy = saving || isSubmitting;
  // pending is the backend-provided approval inbox, not a client role calculation.
  const pendingIds = new Set(pendingApprovals.map(request => String(request.id)));
  const all = Array.isArray(approvals.data?.allApplications) ? approvals.data.allApplications : [...new Map([...processedApprovals, ...pendingApprovals].map(request => [String(request.id), request])).values()];
  const openDecision = (request, status) => { setDecision({ request, status }); setRemark(""); setError(""); };
  const closeDecision = () => { if (!inFlight.current) { setDecision(null); setRemark(""); setError(""); } };
  const submitDecision = async (event) => {
    event.preventDefault();
    if (!decision || inFlight.current) return;
    if (!canAccessApprovals || !pendingIds.has(String(decision.request.id))) { setError("This application is no longer in your approval inbox. Close and check its current status."); return; }
    if (decision.status === "REJECTED" && !remark.trim()) { setError("Please enter a reason for rejection."); return; }
    inFlight.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await decideRequest(decision.request.id, decision.status, remark.trim());
      if (!result?.ok) setError(result?.message || "Unable to process the application.");
      else { setDecision(null); setRemark(""); }
    } catch (cause) { setError(cause?.message || "Unable to process the application."); }
    finally { inFlight.current = false; setSaving(false); }
  };
  return <PageShell title={LABELS.applications} subtitle="Review and track applications within your access.">
    {isLoading || loadError ? <LoadState loading={isLoading} error={loadError} /> : !canAccessApprovals ? <p role="alert" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">You do not have access to attendance applications for approval.</p> : <>
      <div role="tablist" aria-label="Applications" className="mb-2 grid min-w-0 grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:flex">
        {["inbox", "all"].map((value, index) => <button key={value} type="button" role="tab" aria-label={LABELS[value]} id={`applications-tab-${value}`} aria-selected={tab === value} aria-controls={`applications-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "inbox" : event.key === "End" ? "all" : index === 0 ? "all" : "inbox"; setTab(next); document.getElementById(`applications-tab-${next}`)?.focus(); } }} className={cn("inline-flex h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] sm:h-9 sm:px-4 sm:text-xs", tab === value ? "bg-[#1B4A7B] text-white" : "text-slate-600 hover:bg-slate-50")}><span className="sm:hidden">{value === "inbox" ? "For approval" : "All applications"}</span><span className="hidden sm:inline">{LABELS[value]}</span><span aria-hidden="true" className={cn("inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none tabular-nums", tab === value ? "bg-white/15" : "bg-slate-100")}>{(value === "inbox" ? pendingApprovals.length : all.length) > 99 ? "99+" : value === "inbox" ? pendingApprovals.length : all.length}</span></button>)}
      </div>
      <section className="min-w-0" role="tabpanel" id={`applications-panel-${tab}`} aria-labelledby={`applications-tab-${tab}`}><ApplicationBrowser key={tab} requests={tab === "inbox" ? pendingApprovals : all} pendingIds={pendingIds} onDecision={openDecision} busy={busy} /></section>
    </>}
    <RequestModal open={Boolean(decision) && canAccessApprovals && !loadError} title={decision?.status === "APPROVED" ? "Approve application" : "Reject application"} subtitle="Review the application before confirming your decision." icon="fa-solid fa-file-circle-check" onClose={closeDecision}>
      <form onSubmit={submitDecision} className="space-y-4 p-4 sm:p-5" aria-busy={busy}>
        {decision && <div className="rounded-xl bg-slate-50 p-3"><p className="[overflow-wrap:anywhere] text-sm font-bold">{typeLabel(decision.request)} · {decision.request.employeeName || decision.request.employeeId}</p><p className="mt-1 break-all text-xs text-slate-500">#{decision.request.id} · {periodLabel(decision.request)}</p><p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm text-slate-600">{decision.request.payload?.reason}</p></div>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-slate-700">{decision?.status === "REJECTED" ? "Reason for rejection (required)" : "Approval remark (optional)"}<textarea data-autofocus rows={4} disabled={busy} required={decision?.status === "REJECTED"} maxLength={formOptions.remarkMax} value={remark} onChange={event => setRemark(event.target.value)} className={cn(inputClass, "mt-2 resize-y py-3 font-normal")} /></label>
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:flex sm:justify-end"><button type="button" disabled={busy} onClick={closeDecision} className={cn(buttonClass, "border-slate-200 text-slate-600")}>Cancel</button><button type="submit" disabled={busy} className={cn(buttonClass, decision?.status === "APPROVED" ? "border-[#1B4A7B] bg-[#1B4A7B] text-white" : "border-red-700 bg-red-700 text-white")}>{busy ? "Saving…" : decision?.status === "APPROVED" ? "Confirm approval" : "Confirm rejection"}</button></div>
      </form>
    </RequestModal>
  </PageShell>;
}

// Keeps App.jsx's existing component names and /attendance/approvals URL working.
export const AttendanceApprovalsPage = AttendanceApplicationsPage;
export default AttendanceRequestsPage;
