import React, { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAttendanceAccess, useAttendanceApprovals, useAttendanceRequests } from "../Hooks/useAttendance";
import { RequestModal, WorkFromHomeModal } from "../Components/Pages/Attendance/AttendanceForms";
import { ApplyLeaveModal } from "../Components/Pages/Attendance/ApplyLeaveForm";
import { Pagination, usePagination } from "../Components/Common/Pagination";
import PageHeader, { primaryButton, secondaryButton, segClass, segItemClass } from "../Components/Common/PageHeader";

import Icon from "../Components/Common/Icon";
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
const buttonClass = "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold sm:min-h-9 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "min-h-11 min-w-0 w-full max-w-full rounded-lg border border-slate-200 bg-white px-2.5 text-base sm:min-h-9 sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2b6485]";
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
  return <span className={cn("inline-flex max-w-full flex-wrap items-center gap-1.5 [overflow-wrap:anywhere] rounded-md border px-1.5 py-0.5 text-[11px] font-medium", tone.badge)}><Icon aria-hidden="true" className={tone.icon} />{tone.label}</span>;
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
  return <section aria-label="Application tracking" className="rounded-xl border border-slate-200 bg-white p-4">
    <h4 className="mb-4 text-sm font-bold text-slate-800">Application tracking</h4>
    <ol className="space-y-4">
      {events.map((event, index) => <li key={event.id || index} className="relative flex gap-3">
        <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", toneFor(event.status).dot)} />
        <div className="min-w-0 flex-1">
          <p className="[overflow-wrap:anywhere] text-sm font-semibold text-slate-800">{event.label || toneFor(event.status).label}</p>
          <p className="mt-0.5 [overflow-wrap:anywhere] text-xs leading-5 text-slate-500">{!event.hideActor && <>{event.actorName || "Actor not provided"}, </>}{dateLabel(event.at, true)}</p>
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
      <Field label="Employee">{request.employeeName || "Not provided"}{request.employeeId && <span className="ml-1.5 font-normal text-slate-500">({request.employeeId})</span>}</Field>
      <Field label={missedPunch ? "Attendance date" : "Application period"}>{periodLabel(request)}</Field>
      {payload.leaveType && <Field label="Leave type">{leaveName(payload)}</Field>}
      {payload.duration && <Field label="Duration">{({ FULL_DAY: "Full Day", FIRST_HALF: "First Half", SECOND_HALF: "Second Half" })[payload.duration] || payload.duration}</Field>}
    </dl>
    {(missedPunch || record) && <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2 text-xs">
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

// Level 1 / Level 2 approval states, as derived in src/api/attendance.js (levelsOf)
const LEVEL_TONES = {
  APPROVED: { label: "Approved", icon: "fa-solid fa-check", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  AUTO_APPROVED: { label: "Auto-approved", icon: "fa-solid fa-bolt", badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  REJECTED: { label: "Rejected", icon: "fa-solid fa-xmark", badge: "border-red-200 bg-red-50 text-red-800" },
  PENDING: { label: "Pending", icon: "fa-regular fa-clock", badge: "border-amber-200 bg-amber-50 text-amber-800" },
  WAITING: { label: "Waiting", icon: "fa-regular fa-hourglass-half", badge: "border-slate-200 bg-slate-50 text-slate-600" },
  SKIPPED: { label: "Skipped", icon: "fa-solid fa-forward", badge: "border-slate-200 bg-slate-50 text-slate-500" },
  NOT_REACHED: { label: "Not reached", icon: "fa-solid fa-minus", badge: "border-slate-200 bg-white text-slate-400" },
  CANCELLED: { label: "Cancelled", icon: "fa-solid fa-ban", badge: "border-slate-200 bg-slate-50 text-slate-500" },
};

function LevelCell({ level, compact = false }) {
  if (!level || level.status === "NA") return <span className="text-xs text-slate-400" title="No approval at this level">—</span>;
  const tone = LEVEL_TONES[level.status] || { label: level.status, icon: "fa-regular fa-circle", badge: "border-slate-200 bg-slate-50 text-slate-600" };
  const detail = [level.by, level.at && dateLabel(level.at, true), level.note].filter(Boolean).join(", ");
  return <div className="min-w-0" title={detail || tone.label}>
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium", tone.badge)}><Icon aria-hidden="true" className={tone.icon} />{tone.label}</span>
    {!compact && level.by && <p className="mt-0.5 max-w-[11rem] truncate text-[11px] text-slate-500">{level.by}</p>}
  </div>;
}

const approveClass = cn(buttonClass, "min-h-8 border-emerald-600 bg-emerald-600 px-2.5 text-white hover:bg-emerald-700 sm:min-h-8");
const rejectClass = cn(buttonClass, "min-h-8 border-red-200 bg-white px-2.5 text-red-700 hover:bg-red-50 sm:min-h-8");
const detailsClass = cn(buttonClass, "min-h-8 border-slate-200 bg-white px-2.5 text-[#1f4e6b] hover:bg-[#f2f5f7] sm:min-h-8");

// Table cells: tighter on tablets so every column fits without sideways scrolling
const cellClass = "px-2 py-2.5 lg:px-3";

function RowActions({ request, decidable, onDecision, onView, busy }) {
  if (decidable) return <div className="flex flex-wrap items-center justify-end gap-1.5">
    <button type="button" disabled={busy} onClick={() => onDecision([request], "APPROVED")} className={approveClass} aria-label={`Approve ${typeLabel(request)} for ${request.employeeName || request.employeeId}`}><Icon aria-hidden="true" className="fa-solid fa-check" />Approve</button>
    <button type="button" disabled={busy} onClick={() => onDecision([request], "REJECTED")} className={rejectClass} aria-label={`Reject ${typeLabel(request)} for ${request.employeeName || request.employeeId}`}><Icon aria-hidden="true" className="fa-solid fa-xmark" />Reject</button>
  </div>;
  return <div className="flex justify-end"><button type="button" onClick={() => onView(String(request.id))} className={detailsClass}><Icon aria-hidden="true" className="fa-regular fa-file-lines" />Details</button></div>;
}

// The application's name doubles as the way into its details, so rows need no separate View button
function ApplicationTitle({ request, onView }) {
  return <button type="button" onClick={() => onView(String(request.id))} className="min-w-0 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]">
    <span className="block [overflow-wrap:anywhere] text-xs font-bold text-slate-900 hover:text-[#1f4e6b] hover:underline">{typeLabel(request)}</span>
    <span className="mt-0.5 block max-w-[9rem] truncate text-[10px] text-slate-400" title={String(request.id)}>#{String(request.id).slice(-8)}</span>
  </button>;
}

function SelectBox({ checked, indeterminate = false, onChange, label, disabled = false }) {
  return <input
    type="checkbox"
    checked={checked}
    disabled={disabled}
    ref={node => { if (node) node.indeterminate = indeterminate; }}
    onChange={event => onChange(event.target.checked)}
    aria-label={label}
    className="h-4 w-4 shrink-0 cursor-pointer accent-[#1f4e6b] disabled:cursor-not-allowed disabled:opacity-30"
  />;
}

function ApplicationTile({ request, decidable, selectable, selected, onSelect, onDecision, onView, busy }) {
  return <article className={cn("glass min-w-0 rounded-xl p-3", selected ? "border-[#2b6485] ring-2 ring-[#2b6485]/20" : "lift hover:border-[#cfdce5]")}>
    <div className="flex items-start gap-2">
      {selectable && <span className="pt-0.5"><SelectBox checked={selected} onChange={onSelect} label={`Select ${typeLabel(request)} for ${request.employeeName || request.employeeId}`} /></span>}
      <div className="min-w-0 flex-1"><ApplicationTitle request={request} onView={onView} /></div>
      <StatusBadge status={request.status} />
    </div>
    <p className="mt-2 [overflow-wrap:anywhere] text-xs font-semibold text-slate-700">{request.employeeName || request.employeeId || "Employee not provided"}</p>
    <p className="mt-0.5 text-[11px] text-slate-500">{periodLabel(request)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-200/80 bg-white p-2">
      <div className="min-w-0"><dt className="mb-1 text-[12px] font-medium text-slate-500">Level 1</dt><dd><LevelCell level={request.levels?.l1} compact /></dd></div>
      <div className="min-w-0"><dt className="mb-1 text-[12px] font-medium text-slate-500">Level 2</dt><dd><LevelCell level={request.levels?.l2} compact /></dd></div>
    </dl>
    <div className="mt-3 flex justify-end"><RowActions request={request} decidable={decidable} onDecision={onDecision} onView={onView} busy={busy} /></div>
  </article>;
}

function ApplicationTable({ rows, isDecidable, selectable, selectedIds, onSelect, onSelectPage, onDecision, onView, busy }) {
  const pageSelectable = selectable ? rows.filter(isDecidable) : [];
  const pageSelected = pageSelectable.filter(request => selectedIds.has(String(request.id)));
  const all = pageSelectable.length > 0 && pageSelected.length === pageSelectable.length;
  const some = pageSelected.length > 0 && !all;
  const label = request => `${typeLabel(request)} for ${request.employeeName || request.employeeId}`;
  return <>
  {/* Phones: each record is a collapsed row (type, employee, status); tap it to open the fields and actions */}
  <div className="space-y-2 md:hidden">
    {selectable && pageSelectable.length > 0 && <label className="glass flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600">
      <SelectBox checked={all} indeterminate={some} onChange={onSelectPage} label="Select every application on this page that you can decide" />
      Select all on this page
    </label>}
    {rows.map(request => {
      const decidable = isDecidable(request);
      const selected = selectedIds.has(String(request.id));
      return <div key={request.id} className={cn("flex items-start gap-2 rounded-xl glass-strong", selected && "ring-2 ring-[#2b6485]/30")}>
        {/* The checkbox sits outside the row so ticking it doesn't open or close the row */}
        {selectable && decidable && <span className="pl-3 pt-[15px]"><SelectBox checked={selected} onChange={checked => onSelect(request, checked)} label={`Select ${label(request)}`} /></span>}
        <details className="group min-w-0 flex-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-2.5 pr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-900">{typeLabel(request)}</span>
              <span className="block truncate text-[12px] text-slate-500">{request.employeeName || request.employeeId || "Employee not provided"}</span>
            </span>
            <StatusBadge status={request.status} />
            <Icon aria-hidden="true" className="fa-solid fa-chevron-down shrink-0 text-[12px] text-slate-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-slate-100 px-3 pb-3 pt-2.5">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Employee ID</dt><dd className="mt-0.5 text-slate-700">{request.employeeId || "—"}</dd></div>
              <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Period</dt><dd className="mt-0.5 text-slate-600">{periodLabel(request)}</dd></div>
              <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Level 1</dt><dd className="mt-0.5"><LevelCell level={request.levels?.l1} /></dd></div>
              <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Level 2</dt><dd className="mt-0.5"><LevelCell level={request.levels?.l2} /></dd></div>
              <div className="col-span-2 min-w-0"><dt className="text-[12px] font-medium text-slate-500">Submitted</dt><dd className="mt-0.5 text-slate-500">{dateLabel(request.submittedAt)}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
              {decidable && <button type="button" onClick={() => onView(String(request.id))} className={detailsClass}><Icon aria-hidden="true" className="fa-regular fa-file-lines" />Details</button>}
              <RowActions request={request} decidable={decidable} onDecision={onDecision} onView={onView} busy={busy} />
            </div>
          </div>
        </details>
      </div>;
    })}
  </div>
  {/* Tablets and up: the table fits its box — the period column joins from lg and the submitted date from xl
      (both are in each row's details), and a row's Approve / Reject wrap under each other when space is short */}
  <div className="hidden overflow-hidden glass-strong rounded-xl md:block">
    <table className="w-full text-left text-xs [overflow-wrap:anywhere]">
      <caption className="sr-only">Applications</caption>
      <thead className="bg-[#edf1f4] border-b border-[var(--line)] text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        <tr>
          {selectable && <th scope="col" className="w-10 px-2 py-2.5 lg:px-3"><SelectBox checked={all} indeterminate={some} disabled={!pageSelectable.length} onChange={onSelectPage} label="Select every application on this page that you can decide" /></th>}
          <th scope="col" className={cn(cellClass, "font-semibold")}>Application</th>
          <th scope="col" className={cn(cellClass, "font-semibold")}>Employee</th>
          <th scope="col" className={cn(cellClass, "hidden font-semibold lg:table-cell")}>Period</th>
          <th scope="col" className={cn(cellClass, "hidden font-semibold xl:table-cell")}>Submitted</th>
          <th scope="col" className={cn(cellClass, "font-semibold")}>Level 1</th>
          <th scope="col" className={cn(cellClass, "font-semibold")}>Level 2</th>
          <th scope="col" className={cn(cellClass, "font-semibold")}>Status</th>
          <th scope="col" className={cn(cellClass, "text-right font-semibold")}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(request => {
          const decidable = isDecidable(request);
          const selected = selectedIds.has(String(request.id));
          return <tr key={request.id} className={cn("border-b border-slate-100 align-top transition-colors last:border-0", selected ? "bg-[#f2f5f7]" : "hover:bg-slate-50/70")}>
            {selectable && <td className="px-2 py-2.5 lg:px-3">{decidable ? <SelectBox checked={selected} onChange={checked => onSelect(request, checked)} label={`Select ${typeLabel(request)} for ${request.employeeName || request.employeeId}`} /> : null}</td>}
            <td className={cellClass}><ApplicationTitle request={request} onView={onView} /></td>
            <td className={cellClass}><p className="max-w-[12rem] font-semibold text-slate-700">{request.employeeName || "Not provided"}</p>{request.employeeId && <p className="mt-0.5 text-[11px] text-slate-500">{request.employeeId}</p>}</td>
            <td className={cn(cellClass, "hidden text-slate-600 lg:table-cell")}>{periodLabel(request)}{request.payload?.days ? <span className="block text-[11px] text-slate-400">{request.payload.days} day{request.payload.days === 1 ? "" : "s"}</span> : null}</td>
            <td className={cn(cellClass, "hidden text-slate-500 xl:table-cell")}>{dateLabel(request.submittedAt)}</td>
            <td className={cellClass}><LevelCell level={request.levels?.l1} /></td>
            <td className={cellClass}><LevelCell level={request.levels?.l2} /></td>
            <td className={cellClass}><StatusBadge status={request.status} /></td>
            <td className={cellClass}><RowActions request={request} decidable={decidable} onDecision={onDecision} onView={onView} busy={busy} /></td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>
  </>;
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
      <summary aria-labelledby={`${id}-label ${id}-value`} className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#1f4e6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] sm:min-h-9 [&::-webkit-details-marker]:hidden">
        <span id={`${id}-value`} className="min-w-0 break-words">{options.find(option => option.value === value)?.label}</span>
        <Icon aria-hidden="true" className="fa-solid fa-chevron-down shrink-0 text-[10px]" />
      </summary>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="absolute inset-x-0 top-full z-30 mt-1 rounded-xl border border-[#dce6ed] bg-white p-1.5 shadow-lg">
        {options.map(option => <label key={option.value} className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs sm:min-h-9", option.value === value ? "bg-[#f2f5f7] font-semibold text-[#1f4e6b]" : "text-slate-600 hover:bg-slate-50")}>
          <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="h-4 w-4 shrink-0 accent-[#1f4e6b]" />
          <span className="min-w-0 flex-1 break-words">{option.label}</span>
          {option.count != null && <span className="text-[11px] tabular-nums text-slate-500">{option.count}</span>}
        </label>)}
        <button type="button" onClick={() => { dropdown.current.open = false; dropdown.current.querySelector("summary").focus(); }} className="mt-1 min-h-9 w-full rounded-lg border-t border-slate-100 text-xs font-semibold text-[#1f4e6b]">Done</button>
      </div>
    </details>
  </div>;
}

/*
 * onDecision(requests[], status) turns on the per-row Approve / Reject buttons and row selection
 * for bulk decisions; it is passed only on the Applications page. Without it rows show Details.
 */
/*
 * Links from the attendance calendar: ?request=<id> opens that application; ?date=YYYY-MM-DD opens
 * the one covering that day (pending first). The link is dropped when its details close.
 */
const coversDate = (request, date) => {
  const { date: single, from, to } = request.payload || {};
  return single ? single === date : Boolean(from && to && from <= date && date <= to);
};
function useLinkedApplication(requests) {
  const [params, setParams] = useSearchParams();
  const id = params.get("request");
  const date = params.get("date");
  const linked = !id && !date ? null
    : id ? requests.find(request => String(request.id) === id)
      : requests.filter(request => coversDate(request, date)).sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING"))[0];
  const clear = () => setParams(current => { current.delete("request"); current.delete("date"); return current; }, { replace: true });
  return { asked: Boolean(id || date), linkedId: linked ? String(linked.id) : "", missing: Boolean((id || date) && !linked), clear };
}

function ApplicationBrowser({ requests, pendingIds = new Set(), onDecision, onCancel, busy = false }) {
  const link = useLinkedApplication(requests);
  const [view, setView] = useState("content");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterId = useId();
  const filterButton = useRef(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [selectedId, setSelectedId] = useState(link.linkedId);
  const [picked, setPicked] = useState(() => new Set());
  // Resolve the current record on every render so refreshed decisions stay current.
  const selected = requests.find(request => String(request.id) === selectedId);
  const isDecidable = request => Boolean(onDecision && request.status === "PENDING" && pendingIds.has(String(request.id)) && request.canDecide !== false);
  const canDecide = Boolean(selected && isDecidable(selected));
  // Withdraw your own application (the backend decides what may still be cancelled)
  const canCancel = Boolean(selected && onCancel && selected.canCancel);
  const startDecision = (status) => {
    setSelectedId(""); // Close details before opening the confirmation dialog.
    onDecision([selected], status);
  };
  const activeFilterCount = Number(Boolean(query.trim())) + Number(type !== "ALL") + Number(status !== "ALL");
  const closeFilters = () => { setFiltersOpen(false); filterButton.current?.focus(); };
  const search = query.trim().toLowerCase();
  const filtered = requests.filter(request => (status === "ALL" || request.status === status) && (type === "ALL" || request.type === type) && [request.id, request.employeeName, request.employeeId, typeLabel(request), request.payload?.reason, pendingWith(request), request.currentStage].filter(Boolean).join(" ").toLowerCase().includes(search))
    .sort((a, b) => (Date.parse(b.submittedAt) || 0) - (Date.parse(a.submittedAt) || 0));
  const paging = usePagination(filtered, { resetKey: `${search}|${status}|${type}` });

  // Selection only ever holds rows still waiting on you; decided rows drop out by themselves
  const selectable = Boolean(onDecision);
  const decidableFiltered = selectable ? filtered.filter(isDecidable) : [];
  const pickedRequests = decidableFiltered.filter(request => picked.has(String(request.id)));
  const pickOne = (request, checked) => setPicked(current => {
    const next = new Set(current);
    if (checked) next.add(String(request.id)); else next.delete(String(request.id));
    return next;
  });
  const pickPage = (checked) => setPicked(current => {
    const next = new Set(current);
    paging.pageItems.filter(isDecidable).forEach(request => { if (checked) next.add(String(request.id)); else next.delete(String(request.id)); });
    return next;
  });
  const pickAll = () => setPicked(new Set(decidableFiltered.map(request => String(request.id))));
  const clearPicked = () => setPicked(new Set());
  const pickedIds = new Set(pickedRequests.map(request => String(request.id)));

  return <>
    {link.missing && <div role="status" className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
      <span>The application from the calendar isn't in this list. It may have been decided or cancelled since.</span>
      <button type="button" onClick={link.clear} className="shrink-0 rounded font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]">Dismiss</button>
    </div>}
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <button ref={filterButton} type="button" aria-expanded={filtersOpen} aria-controls={filterId} onClick={() => setFiltersOpen(open => !open)} className={cn(buttonClass, activeFilterCount || filtersOpen ? "border-[#cfdce5] bg-[#f2f5f7] text-[#1f4e6b]" : "border-white/80 bg-white/75 text-slate-600 backdrop-blur hover:bg-white")}>
        <Icon aria-hidden="true" className="fa-solid fa-sliders" />Filter
        {activeFilterCount > 0 && <span aria-label={`${activeFilterCount} active filters`} className="rounded-full bg-[#1f4e6b] px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
      </button>
      <div role="group" aria-label="Application view" className="glass flex gap-1 rounded-xl p-0.5">{["content", "tiles"].map(value => <button type="button" key={value} onClick={() => setView(value)} aria-pressed={view === value} className={cn(buttonClass, "gap-1.5 px-2", view === value ? "border-transparent bg-[#f2f5f7] text-[#1f4e6b]" : "border-transparent text-slate-500 hover:bg-slate-50")}><Icon aria-hidden="true" className={`fa-solid ${value === "tiles" ? "fa-grip" : "fa-list"}`} />{value === "tiles" ? "Tiles" : "Content"}</button>)}</div>
    </div>
    <section id={filterId} hidden={!filtersOpen} aria-label="Application filters" className="glass-strong mb-3 rounded-xl p-3" onKeyDown={event => { if (event.key === "Escape") closeFilters(); }}>
      {filtersOpen && <>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="min-w-0 text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-1">Search applications<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="ID, employee, approver or reason" className={cn(inputClass, "mt-1")} /></label>
          <FilterDropdown label="Status" value={status} onChange={setStatus} options={["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(value => ({ value, label: value === "ALL" ? "All statuses" : toneFor(value).label, count: value === "ALL" ? requests.length : requests.filter(item => item.status === value).length }))} />
          <FilterDropdown label="Application type" value={type} onChange={setType} options={[{ value: "ALL", label: "All types" }, ...Object.entries(TYPES).map(([value, label]) => ({ value, label }))]} />
        </div>
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button type="button" onClick={() => { setQuery(""); setStatus("ALL"); setType("ALL"); }} className={cn(buttonClass, "border-slate-200 text-slate-600")}>Reset</button>
          <button type="button" onClick={closeFilters} className={cn(buttonClass, "border-[#1f4e6b] bg-[#1f4e6b] text-white")}>Show results</button>
        </div>
      </>}
    </section>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-xs text-slate-500">{filtered.length} of {requests.length} applications · newest first</p>{(query || type !== "ALL" || status !== "ALL") && <button type="button" onClick={() => { setQuery(""); setType("ALL"); setStatus("ALL"); }} className="rounded px-2 py-1 text-xs font-semibold text-[#1f4e6b] underline focus-visible:ring-2 focus-visible:ring-[#2b6485]">Clear filters</button>}</div>

    {selectable && decidableFiltered.length > 0 && <div role="region" aria-label="Bulk decision" className={cn("sticky top-16 z-20 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2.5 shadow-sm backdrop-blur", pickedRequests.length ? "border-[#cfdce5] bg-[#f2f5f7]/85 shadow-[var(--shadow-lift)]" : "border-white/80 bg-white/70")}>
      <p className="text-xs text-slate-600" aria-live="polite">
        {pickedRequests.length
          ? <><span className="font-bold tabular-nums text-[#1f4e6b]">{pickedRequests.length}</span> selected</>
          : <>Select applications to approve or reject them together</>}
        {pickedRequests.length < decidableFiltered.length && <button type="button" onClick={pickAll} className="ml-2 inline-flex items-center rounded font-semibold text-[#1f4e6b] underline pointer-coarse:min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]">Select all {decidableFiltered.length} awaiting you</button>}
        {pickedRequests.length > 0 && <button type="button" onClick={clearPicked} className="ml-2 inline-flex items-center rounded font-semibold text-slate-500 underline pointer-coarse:min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]">Clear</button>}
      </p>
      <div className="ml-auto flex gap-2">
        <button type="button" disabled={!pickedRequests.length || busy} onClick={() => onDecision(pickedRequests, "APPROVED")} className={approveClass}><Icon aria-hidden="true" className="fa-solid fa-check" />Approve selected</button>
        <button type="button" disabled={!pickedRequests.length || busy} onClick={() => onDecision(pickedRequests, "REJECTED")} className={rejectClass}><Icon aria-hidden="true" className="fa-solid fa-xmark" />Reject selected</button>
      </div>
    </div>}

    {filtered.length ? <>
      {view === "content"
        ? <ApplicationTable rows={paging.pageItems} isDecidable={isDecidable} selectable={selectable} selectedIds={pickedIds} onSelect={pickOne} onSelectPage={pickPage} onDecision={onDecision} onView={setSelectedId} busy={busy} />
        : <div className="grid min-w-0 grid-cols-1 items-start gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{paging.pageItems.map(request => {
          const decidable = isDecidable(request);
          return <ApplicationTile key={request.id} request={request} decidable={decidable} selectable={selectable && decidable} selected={pickedIds.has(String(request.id))} onSelect={checked => pickOne(request, checked)} onDecision={onDecision} onView={setSelectedId} busy={busy} />;
        })}</div>}
      <Pagination className="mt-3" page={paging.page} pages={paging.pages} pageSize={paging.pageSize} total={paging.total} onPage={paging.setPage} onPageSize={paging.setPageSize} label="applications" />
    </> : <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/60 p-10 text-center backdrop-blur"><h3 className="font-semibold text-slate-800">{requests.length ? "No matching applications" : "No applications here yet"}</h3><p className="mt-2 text-sm text-slate-500">{requests.length ? "Try another search or clear the filters." : "Applications will appear here when available."}</p></div>}

    <RequestModal open={Boolean(selected)} title={selected ? typeLabel(selected) : "Application"} subtitle={selected ? `Application #${selected.id}` : ""} icon="fa-regular fa-file-lines" onClose={() => { setSelectedId(""); if (link.asked) link.clear(); }}>
      {selected && <div className="space-y-4 p-3 sm:p-4">
        <StatusBadge status={selected.status} />
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3">
          <div><dt className="mb-1 text-xs text-slate-500">Level 1</dt><dd><LevelCell level={selected.levels?.l1} /></dd></div>
          <div><dt className="mb-1 text-xs text-slate-500">Level 2</dt><dd><LevelCell level={selected.levels?.l2} /></dd></div>
        </dl>
        <RequestDetails request={selected} />
        {canDecide && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" disabled={busy} className={cn(buttonClass, "border-red-200 text-red-700 hover:bg-red-50")} onClick={() => startDecision("REJECTED")}>Reject</button>
          <button type="button" disabled={busy} className={cn(buttonClass, "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700")} onClick={() => startDecision("APPROVED")}>Approve</button>
        </div>}
        {canCancel && <div className="flex justify-end border-t border-slate-100 pt-3">
          <button type="button" disabled={busy} className={cn(buttonClass, "border-red-200 text-red-700 hover:bg-red-50")} onClick={() => onCancel(selected)}>Cancel application</button>
        </div>}
      </div>}
    </RequestModal>
  </>;
}

function PageShell({ icon, title, subtitle, actions, children }) {
  return <div className="w-full min-w-0 text-slate-900">
    <PageHeader icon={icon} title={title} description={subtitle} actions={actions} />
    {children}
  </div>;
}
function LoadState({ loading, error }) {
  return loading ? <div role="status" aria-label="Loading applications" className="glass-panel space-y-3 rounded-2xl p-4">{[0, 1, 2, 3, 4].map(row => <div key={row} className="flex items-center gap-3"><div className="skeleton h-9 w-9 rounded-xl" /><div className="skeleton h-3.5 flex-1" /><div className="skeleton hidden h-3.5 w-24 sm:block" /><div className="skeleton h-6 w-20 rounded-md" /></div>)}</div> : <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error?.message || "Unable to load applications."}</p>;
}

// The counts across the top of My Requests, so the state of your applications reads at a glance
function RequestTotals({ requests }) {
  const counts = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(status => ({ status, tone: toneFor(status), total: requests.filter(request => request.status === status).length }));
  return <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
    {counts.map(({ status, tone, total }) => <div key={status} style={{ "--i": counts.findIndex(item => item.status === status) }} className={cn("rise rounded-xl border p-3 shadow-[var(--shadow-card)] backdrop-blur", total ? tone.badge : "glass text-slate-500")}>
      <p className="text-lg font-bold tabular-nums">{total}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium"><Icon aria-hidden="true" className={tone.icon} />{tone.label}</p>
    </div>)}
  </div>;
}

export function AttendanceRequestsPage() {
  const { myRequests = [], isLoading, error, isSubmitting, cancelRequest, submitLeave, submitWFH } = useAttendanceRequests();
  const { serverToday } = useAttendanceAccess();
  const [cancelError, setCancelError] = useState("");
  const [notice, setNotice] = useState("");
  const [openForm, setOpenForm] = useState(null); // "leave" | "wfh"
  const today = serverToday || new Date().toISOString().slice(0, 10);
  const cancel = async (request) => {
    if (!window.confirm(`Cancel this ${typeLabel(request).toLowerCase()} application?`)) return;
    setCancelError("");
    setNotice("");
    const result = await cancelRequest(request.id);
    if (!result?.ok) setCancelError(result?.message || "Unable to cancel the application.");
    else setNotice("Application cancelled.");
  };
  // The modals close themselves on success; keep the page's banners in step
  const sendAndClose = (submit, done) => async (payload) => {
    const result = await submit(payload);
    if (result?.ok) {
      setCancelError("");
      setNotice(done);
      setOpenForm(null);
    }
    return result;
  };
  const actions = <div className="flex flex-wrap gap-2">
    <button type="button" onClick={() => { setNotice(""); setOpenForm("leave"); }} className={primaryButton}>
      <Icon aria-hidden="true" className="fa-regular fa-calendar-plus" />Apply Leave
    </button>
    <button type="button" onClick={() => { setNotice(""); setOpenForm("wfh"); }} className={secondaryButton}>
      <Icon aria-hidden="true" className="fa-solid fa-house-laptop" />Work From Home
    </button>
  </div>;
  return <PageShell icon="fa-regular fa-file-lines" title={LABELS.requests} subtitle="Apply for leave or work from home, and track your applications and their current reviewer." actions={actions}>
    {notice && <p role="status" className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {cancelError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{cancelError}</p>}
    {isLoading || error ? <LoadState loading={isLoading} error={error} /> : <>
      <RequestTotals requests={myRequests} />
      <ApplicationBrowser requests={myRequests} onCancel={cancel} busy={isSubmitting} />
    </>}
    <ApplyLeaveModal
      open={openForm === "leave"}
      initialDate={today}
      isSubmitting={isSubmitting}
      onClose={() => setOpenForm(null)}
      onSubmit={sendAndClose(submitLeave, "Leave application submitted.")}
    />
    <WorkFromHomeModal
      open={openForm === "wfh"}
      initialDate={today}
      isSubmitting={isSubmitting}
      onClose={() => setOpenForm(null)}
      onSubmit={sendAndClose(submitWFH, "Work from home application submitted.")}
    />
  </PageShell>;
}

export function AttendanceApplicationsPage() {
  const { formOptions = {} } = useAttendanceAccess();
  const approvals = useAttendanceApprovals();
  const { pendingApprovals = [], processedApprovals = [], canAccessApprovals, isLoading, error: loadError, isSubmitting, decideRequest } = approvals;
  const [linkParams] = useSearchParams();
  const [tab, setTab] = useState(linkParams.get("request") || linkParams.get("date") ? "all" : "inbox");
  // { requests: [...], status } — one application from its row, or several from the selection
  const [decision, setDecision] = useState(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState(null); // { done, total } while a bulk decision runs
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const busy = saving || isSubmitting;
  // pending is the backend-provided approval inbox, not a client role calculation.
  const pendingIds = new Set(pendingApprovals.map(request => String(request.id)));
  const all = Array.isArray(approvals.data?.allApplications) ? approvals.data.allApplications : [...new Map([...processedApprovals, ...pendingApprovals].map(request => [String(request.id), request])).values()];
  const openDecision = (requests, status) => { setDecision({ requests, status }); setRemark(""); setError(""); setNotice(""); };
  const closeDecision = () => { if (!inFlight.current) { setDecision(null); setRemark(""); setError(""); } };
  const many = (decision?.requests.length || 0) > 1;
  const verb = decision?.status === "APPROVED" ? "approve" : "reject";

  // The backend decides one application per call; a bulk decision runs them in turn and keeps
  // whichever fail in the dialog so they can be retried or left.
  const submitDecision = async (event) => {
    event.preventDefault();
    if (!decision || inFlight.current) return;
    if (!canAccessApprovals) { setError("You no longer have access to approvals."); return; }
    if (decision.status === "REJECTED" && !remark.trim()) { setError("Please enter a reason for rejection."); return; }
    inFlight.current = true;
    setSaving(true);
    setError("");
    const failed = [];
    let succeeded = 0;
    setProgress({ done: 0, total: decision.requests.length });
    for (const request of decision.requests) {
      if (!pendingIds.has(String(request.id))) {
        failed.push({ request, message: "No longer waiting on you" });
      } else {
        try {
          const result = await decideRequest(request.id, decision.status, remark.trim());
          if (result?.ok) succeeded += 1;
          else failed.push({ request, message: result?.message || "Unable to process the application." });
        } catch (cause) {
          failed.push({ request, message: cause?.message || "Unable to process the application." });
        }
      }
      setProgress(current => current && { ...current, done: current.done + 1 });
    }
    inFlight.current = false;
    setSaving(false);
    setProgress(null);
    const done = `${succeeded} application${succeeded === 1 ? "" : "s"} ${decision.status === "APPROVED" ? "approved" : "rejected"}.`;
    if (!failed.length) {
      setDecision(null);
      setRemark("");
      setNotice(done);
      return;
    }
    setDecision({ requests: failed.map(item => item.request), status: decision.status });
    setError(`${succeeded ? `${done} ` : ""}${failed.length} could not be ${decision.status === "APPROVED" ? "approved" : "rejected"}: ${failed.map(item => `${item.request.employeeName || item.request.employeeId} — ${item.message}`).join("; ")}`);
    if (succeeded) setNotice(done);
  };

  return <PageShell icon="fa-solid fa-file-circle-check" title={LABELS.applications} subtitle="Review and track applications within your access.">
    {notice && <p role="status" className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {isLoading || loadError ? <LoadState loading={isLoading} error={loadError} /> : !canAccessApprovals ? <p role="alert" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">You do not have access to attendance applications for approval.</p> : <>
      <div role="tablist" aria-label="Applications" className={cn(segClass, "mb-3 grid w-full grid-cols-2 sm:flex sm:w-fit")}>
        {["inbox", "all"].map((value, index) => <button key={value} type="button" role="tab" aria-label={LABELS[value]} id={`applications-tab-${value}`} aria-selected={tab === value} aria-controls={`applications-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "inbox" : event.key === "End" ? "all" : index === 0 ? "all" : "inbox"; setTab(next); document.getElementById(`applications-tab-${next}`)?.focus(); } }} className={cn(segItemClass(tab === value), "h-11 min-w-0 justify-center sm:h-9")}><span className="sm:hidden">{value === "inbox" ? "For approval" : "All applications"}</span><span className="hidden sm:inline">{LABELS[value]}</span><span aria-hidden="true" className={cn("inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none tabular-nums", tab === value ? "bg-white/15" : "bg-slate-100")}>{(value === "inbox" ? pendingApprovals.length : all.length) > 99 ? "99+" : value === "inbox" ? pendingApprovals.length : all.length}</span></button>)}
      </div>
      <section className="min-w-0" role="tabpanel" id={`applications-panel-${tab}`} aria-labelledby={`applications-tab-${tab}`}><ApplicationBrowser key={tab} requests={tab === "inbox" ? pendingApprovals : all} pendingIds={pendingIds} onDecision={openDecision} busy={busy} /></section>
    </>}
    <RequestModal open={Boolean(decision) && canAccessApprovals && !loadError} title={`${decision?.status === "APPROVED" ? "Approve" : "Reject"} ${many ? `${decision.requests.length} applications` : "application"}`} subtitle={many ? `The same ${decision?.status === "APPROVED" ? "remark" : "reason"} is recorded on each application.` : "Review the application before confirming your decision."} icon="fa-solid fa-file-circle-check" onClose={closeDecision}>
      <form onSubmit={submitDecision} className="space-y-4 p-4 sm:p-5" aria-busy={busy}>
        {decision && (many
          ? <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-2">{decision.requests.map(request => <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs"><span className="min-w-0 [overflow-wrap:anywhere] font-semibold text-slate-800">{request.employeeName || request.employeeId}</span><span className="text-slate-500">{typeLabel(request)} · {periodLabel(request)}</span></li>)}</ul>
          : <div className="rounded-xl border border-slate-200/80 bg-white p-3"><p className="[overflow-wrap:anywhere] text-sm font-bold">{typeLabel(decision.requests[0])} · {decision.requests[0].employeeName || decision.requests[0].employeeId}</p><p className="mt-1 break-all text-xs text-slate-500">#{decision.requests[0].id} · {periodLabel(decision.requests[0])}</p><p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-sm text-slate-600">{decision.requests[0].payload?.reason}</p></div>)}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {progress && <p role="status" className="text-xs text-slate-500">Working… {progress.done} of {progress.total}</p>}
        <label className="block text-sm font-semibold text-slate-700">{decision?.status === "REJECTED" ? "Reason for rejection (required)" : "Approval remark (optional)"}<textarea data-autofocus rows={4} disabled={busy} required={decision?.status === "REJECTED"} maxLength={formOptions.remarkMax} value={remark} onChange={event => setRemark(event.target.value)} className={cn(inputClass, "mt-2 resize-y py-3 font-normal")} /></label>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={busy} onClick={closeDecision} className={cn(buttonClass, "border-slate-200 text-slate-600")}>Cancel</button><button type="submit" disabled={busy} className={cn(buttonClass, decision?.status === "APPROVED" ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700" : "border-red-700 bg-red-700 text-white")}>{busy ? "Saving…" : `Confirm ${verb}${many ? ` (${decision.requests.length})` : ""}`}</button></div>
      </form>
    </RequestModal>
  </PageShell>;
}

// Keeps App.jsx's existing component names and /attendance/approvals URL working.
export const AttendanceApprovalsPage = AttendanceApplicationsPage;
export default AttendanceRequestsPage;
