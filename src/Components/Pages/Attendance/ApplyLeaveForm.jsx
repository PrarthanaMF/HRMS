import React, { useEffect, useId, useMemo, useState } from "react";

import Icon from "../../Common/Icon";
import { RequestModal } from "./AttendanceForms";
import { useAttendanceAccess } from "../../../Hooks/useAttendance";
import { leaveDays } from "../../../api/attendance";
import { DatePicker } from "../../Common/DateTimePicker";

/*
 * Apply Leave: leave type cards with what's left, From / To dates each with a session
 * (Session 1 = first half, Session 2 = second half), and a day-by-day breakdown.
 *
 * Sessions: the leave starts at the From session and ends at the To session. On one date,
 * 1→2 is a full day, 1→1 the first half, 2→2 the second half. On a range, starting at
 * Session 2 makes the first day a half day and ending at Session 1 makes the last day one.
 *
 * Backend rules (docs/API.md, "POST /api/attendance/requests"):
 * - halfDay is only accepted for a single date (from = to) and a leave type with allowHalfDay.
 *   Half first/last days on a range are a front-end choice the server can't store yet, so
 *   such a request is held back with a note instead of being saved as all full days.
 * - Holidays and week offs inside the range are not counted.
 * - At most 31 calendar days; no more than the type's maxConsecutiveDays; within the balance
 *   (unless the type allows a negative balance); minNoticeDays ahead for future dates.
 * The backend checks all of this again; the form only explains it before you submit.
 */

const MAX_RANGE_DAYS = 31;
const SESSIONS = [
  { value: 1, label: "Session 1", icon: "fa-regular fa-sun", hint: "First half" },
  { value: 2, label: "Session 2", icon: "fa-regular fa-moon", hint: "Second half" },
];
const NOT_COUNTED = { H: "holiday", HOP: "holiday", WO: "weekoff", WOP: "weekoff" };

// Date keys are YYYY-MM-DD; the maths runs in UTC so no time zone can shift a day
const toDate = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const toKey = (date) => date.toISOString().slice(0, 10);
const addDays = (key, n) => { const date = toDate(key); date.setUTCDate(date.getUTCDate() + n); return toKey(date); };
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
const dateLabel = (key) => toDate(key).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const daysText = (n) => `${Number.isInteger(n) ? n : n.toFixed(1)} day${n === 1 ? "" : "s"}`;

const labelClass = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const panelClass = "rounded-2xl border border-slate-200/80 bg-white p-3.5";

function SessionPicker({ label, value, onChange, isDisabled, disabled }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 gap-2">
      {SESSIONS.map((session) => {
        const reason = isDisabled(session.value);
        const active = value === session.value;
        return (
          <button
            key={session.value}
            type="button"
            aria-pressed={active}
            disabled={disabled || Boolean(reason)}
            title={reason || session.hint}
            onClick={() => onChange(session.value)}
            className={`press inline-flex h-11 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] disabled:cursor-not-allowed disabled:opacity-40 ${active
              ? "border-[#2b6485] bg-[#f2f5f7] text-[#1f4e6b] shadow-[0_4px_12px_-6px_rgb(43_100_133/0.6)]"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
          >
            <Icon className={`${session.icon} text-[15px]`} />
            {session.label}
          </button>
        );
      })}
    </div>
  );
}

function LeaveForm({ initialDate, onClose, onSubmit, isSubmitting }) {
  const { formOptions = {}, serverToday, employee } = useAttendanceAccess();
  const ids = useId();
  const today = serverToday || toKey(new Date());
  const types = useMemo(() => formOptions.leaveTypes || [], [formOptions.leaveTypes]);

  // A type can't be picked when HR says it isn't available, or when nothing is left
  const blockedReason = (type) => type.unavailableReason
    || (type.limited && !type.allowNegativeBalance && type.available <= 0 ? `No ${type.label} left` : "");

  const firstOpen = types.find((type) => !blockedReason(type)) || types[0];
  const startDate = initialDate && initialDate >= (firstOpen?.minDate || "") ? initialDate : today;

  const [leaveType, setLeaveType] = useState(firstOpen?.value ?? "");
  const [from, setFrom] = useState(startDate);
  const [to, setTo] = useState(startDate);
  const [fromSession, setFromSession] = useState(1);
  const [toSession, setToSession] = useState(2);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [calendar, setCalendar] = useState({ key: "", days: null });

  const type = types.find((item) => item.value === leaveType) || null;
  const single = from === to;
  const allowHalf = Boolean(type?.allowHalfDay);
  const rangeLength = from && to && to >= from ? daysBetween(from, to) + 1 : 0;

  // Holidays and week offs in the range (best effort: without them every day counts)
  const rangeKey = rangeLength && rangeLength <= MAX_RANGE_DAYS && employee?.empId ? `${employee.empId}|${from}|${to}` : "";
  useEffect(() => {
    if (!rangeKey) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      leaveDays({ employeeId: employee.empId, from, to }, controller.signal)
        .then((days) => setCalendar({ key: rangeKey, days: new Map(days.map((day) => [day.date, day.code])) }))
        .catch(() => setCalendar({ key: rangeKey, days: new Map() }));
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [rangeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const calendarDays = calendar.key === rangeKey ? calendar.days : null;

  // Sessions -> what the backend calls the duration
  const duration = single && allowHalf
    ? (fromSession === 1 && toSession === 2 ? "FULL_DAY" : fromSession === 1 ? "FIRST_HALF" : "SECOND_HALF")
    : "FULL_DAY";
  const halfLabel = duration === "FIRST_HALF" ? "First Half" : "Second Half";
  // On a range: does the first day start at Session 2, does the last day end at Session 1?
  const startsHalf = !single && allowHalf && fromSession === 2;
  const endsHalf = !single && allowHalf && toSession === 1;

  // Day-by-day breakdown, and the number of leave days it adds up to
  const breakdown = useMemo(() => {
    if (!rangeLength || rangeLength > MAX_RANGE_DAYS) return [];
    return Array.from({ length: rangeLength }, (_, index) => {
      const date = addDays(from, index);
      const skip = NOT_COUNTED[calendarDays?.get(date)];
      if (skip) return { date, kind: skip, days: 0 };
      if (single) return duration === "FULL_DAY" ? { date, kind: "FULL_DAY", days: 1 } : { date, kind: duration, days: 0.5 };
      if (index === 0 && startsHalf) return { date, kind: "SECOND_HALF", days: 0.5 };
      if (index === rangeLength - 1 && endsHalf) return { date, kind: "FIRST_HALF", days: 0.5 };
      return { date, kind: "FULL_DAY", days: 1 };
    });
  }, [from, rangeLength, calendarDays, duration, single, startsHalf, endsHalf]);
  const total = breakdown.reduce((sum, day) => sum + day.days, 0);

  // Changing the dates or the type keeps the sessions to combinations the backend accepts
  const resetSessionsFor = (nextSingle, nextAllowHalf) => {
    if (!nextAllowHalf) { setFromSession(1); setToSession(2); return; }
    // One date can't run from Session 2 back to Session 1
    if (nextSingle && fromSession === 2 && toSession === 1) setToSession(2);
  };
  const chooseType = (value) => {
    setLeaveType(value);
    setError("");
    const next = types.find((item) => item.value === value);
    resetSessionsFor(single, Boolean(next?.allowHalfDay));
    if (next?.minDate && from < next.minDate) { setFrom(next.minDate); if (to < next.minDate) setTo(next.minDate); }
  };
  const changeFrom = (value) => {
    if (!value) return;
    setFrom(value);
    const nextTo = to < value ? value : to;
    setTo(nextTo);
    resetSessionsFor(value === nextTo, allowHalf);
  };
  const changeTo = (value) => {
    if (!value) return;
    setTo(value);
    resetSessionsFor(from === value, allowHalf);
  };

  // Why a session can't be picked right now (empty = it can)
  const fromSessionBlocked = (value) => {
    if (value === 1) return "";
    if (!allowHalf) return `${type?.label || "This leave"} can't be taken as a half day`;
    return "";
  };
  const toSessionBlocked = (value) => {
    if (value === 2) return "";
    if (!allowHalf) return `${type?.label || "This leave"} can't be taken as a half day`;
    if (single && fromSession === 2) return "The leave can't end before it starts";
    return "";
  };
  const pickFromSession = (value) => { setFromSession(value); if (single && value === 2) setToSession(2); };

  // What the backend would refuse, explained before submitting
  const problems = {};
  if (!type) problems.type = "Choose a leave type.";
  else if (blockedReason(type)) problems.type = blockedReason(type);
  if (rangeLength > MAX_RANGE_DAYS) problems.to = `One request can cover at most ${MAX_RANGE_DAYS} days. Split longer leave into two requests.`;
  else if (type?.maxConsecutiveDays && total > type.maxConsecutiveDays) problems.to = `Long leave: max ${plural(type.maxConsecutiveDays, "day")}`;
  if (type?.limited && !type.allowNegativeBalance && total > type.available) problems.type = `Only ${daysText(type.available)} of ${type.label} left; this request needs ${daysText(total)}.`;
  if (type?.minNoticeDays && from >= today && daysBetween(today, from) < type.minNoticeDays) problems.from = `${type.label} needs ${plural(type.minNoticeDays, "day")} notice. The earliest start is ${dateLabel(addDays(today, type.minNoticeDays))}.`;
  if (calendarDays && breakdown.length && total === 0) problems.to = "Every selected day is a holiday or week off, so there's nothing to apply for.";
  const halfEndsOnRange = startsHalf || endsHalf;
  if (halfEndsOnRange && !problems.to) problems.server = "Half days at the start or end of a longer leave can't be saved yet. Apply for the half day as its own single-day request, or choose full days here.";

  const ends = [startsHalf && "first day second half", endsHalf && "last day first half"].filter(Boolean).join(", ");
  const summary = single
    ? (duration !== "FULL_DAY" ? `Half Day (${halfLabel})` : "Full Day")
    : `${daysText(total)} over ${plural(rangeLength, "calendar day")}${ends ? ` (${ends})` : ""}`;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const firstProblem = problems.type || problems.from || problems.to || problems.server;
    if (firstProblem) { setError(firstProblem); return; }
    const text = reason.trim();
    if (text.length < (formOptions.reasonMin || 1)) { setError(`Write a reason of at least ${formOptions.reasonMin} characters.`); return; }
    const result = await onSubmit({ leaveType, from, to, duration, fromSession, toSession, reason: text });
    if (!result?.ok) { setError(result?.message || "The leave couldn't be submitted. Try again."); return; }
    onClose();
  };

  const minDate = type?.minDate || formOptions.leaveMinDate || "";

  return (
    <form onSubmit={submit} noValidate aria-busy={isSubmitting} className="space-y-4 p-4 sm:p-5">
      {/* Who it's for */}
      {employee && (
        <div className="flex items-center gap-2 rounded-xl border border-[#cfdce5] bg-[#f2f5f7] px-3 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-[#1f4e6b]">
          <Icon className="fa-solid fa-circle-user text-[17px]" />
          <span className="min-w-0 truncate">{employee.name} <span className="font-medium normal-case text-[#2b6485]">(#{employee.empId})</span></span>
        </div>
      )}

      {/* Leave type */}
      <fieldset disabled={isSubmitting}>
        <legend className={labelClass}><Icon className="fa-solid fa-tag text-[13px]" />Leave type</legend>
        <div role="radiogroup" aria-label="Leave type" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {types.map((item) => {
            const blocked = blockedReason(item);
            const active = item.value === leaveType;
            const left = item.available === null ? "No limit" : daysText(item.available);
            return (
              <button
                key={item.value || "none"}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={Boolean(blocked)}
                title={blocked || item.description}
                onClick={() => chooseType(item.value)}
                className={`press flex min-h-[64px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] disabled:cursor-not-allowed ${active
                  ? "border-emerald-500 bg-emerald-50 shadow-[0_6px_16px_-10px_rgb(16_185_129/0.8)]"
                  : blocked
                    ? "border-slate-200/70 bg-white opacity-60"
                    : "border-slate-200 bg-white hover:border-[#cfdce5] hover:bg-[#f7f9fb]"}`}
              >
                <span className={`text-[13px] font-medium leading-tight ${active ? "text-emerald-800" : blocked ? "text-slate-400" : "text-slate-700"}`}>{item.label}</span>
                {item.unavailableReason
                  ? <span className="mt-1 text-[12px] font-medium text-slate-400">Not available</span>
                  : <span className={`mt-1 text-[12px] font-semibold tabular-nums ${item.available === null ? "text-slate-500" : item.available > 0 ? "text-emerald-600" : "text-red-400"}`}>{left}</span>}
              </button>
            );
          })}
        </div>
        {problems.type && type && <p role="alert" className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-red-600"><Icon className="fa-solid fa-circle-exclamation mt-0.5 text-[12px]" />{problems.type}</p>}
      </fieldset>

      {/* From */}
      <div className={panelClass}>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`${ids}-from`} className={labelClass}><Icon className="fa-regular fa-calendar text-[13px]" />From date</label>
          <span className={labelClass} aria-hidden="true"><Icon className="fa-regular fa-clock text-[13px]" />From session</span>
        </div>
        <div className="mt-2 flex flex-col gap-2 min-[460px]:flex-row min-[460px]:items-center">
          <div className="min-w-0 flex-1"><DatePicker id={`${ids}-from`} value={from} min={minDate} disabled={isSubmitting} onChange={changeFrom} placeholder="From date" /></div>
          <SessionPicker label="From session" value={fromSession} onChange={pickFromSession} isDisabled={fromSessionBlocked} disabled={isSubmitting} />
        </div>
        {problems.from && <p className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-amber-700"><Icon className="fa-solid fa-triangle-exclamation mt-0.5 text-[12px]" />{problems.from}</p>}
      </div>

      {/* To */}
      <div className={panelClass}>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`${ids}-to`} className={labelClass}><Icon className="fa-regular fa-calendar text-[13px]" />To date</label>
          <span className={labelClass} aria-hidden="true"><Icon className="fa-regular fa-clock text-[13px]" />To session</span>
        </div>
        <div className="mt-2 flex flex-col gap-2 min-[460px]:flex-row min-[460px]:items-center">
          <div className="min-w-0 flex-1"><DatePicker id={`${ids}-to`} value={to} min={from || minDate} disabled={isSubmitting} onChange={changeTo} placeholder="To date" /></div>
          <SessionPicker label="To session" value={toSession} onChange={setToSession} isDisabled={toSessionBlocked} disabled={isSubmitting} />
        </div>
        {problems.to && <p className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-amber-700"><Icon className="fa-solid fa-triangle-exclamation mt-0.5 text-[12px]" />{problems.to}</p>}
        {problems.server && <p role="note" className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[12px] font-medium text-amber-800"><Icon className="fa-solid fa-circle-info mt-0.5 text-[12px]" />{problems.server}</p>}
      </div>

      {/* Summary */}
      <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-[#cfdce5] bg-[#f2f5f7] px-3 py-2.5 text-[13px] font-semibold text-[#1f4e6b]">
        <Icon className="fa-solid fa-clipboard-list text-[16px]" />
        {summary}
      </div>

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <section aria-labelledby={`${ids}-breakdown`} className={panelClass}>
          <h3 id={`${ids}-breakdown`} className={labelClass}><Icon className="fa-solid fa-list-check text-[13px]" />Leave breakdown</h3>
          <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {breakdown.map((day) => (
              <li key={day.date} className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2 py-1.5 text-[13px] text-slate-700">
                <span className="flex items-center gap-2"><Icon className="fa-regular fa-calendar text-[13px] text-slate-400" />{dateLabel(day.date)}</span>
                {day.kind === "holiday" && <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">Holiday – not counted</span>}
                {day.kind === "weekoff" && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">Week off – not counted</span>}
                {day.kind === "FULL_DAY" && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Full day</span>}
                {(day.kind === "FIRST_HALF" || day.kind === "SECOND_HALF") && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">Half day – {day.kind === "FIRST_HALF" ? "First half" : "Second half"}</span>}
              </li>
            ))}
          </ul>
          {calendarDays === null && rangeKey && <p className="mt-2 text-[12px] text-slate-500">Checking holidays and week offs…</p>}
        </section>
      )}

      {/* Reason */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <label htmlFor={`${ids}-reason`} className={labelClass}>Reason</label>
          <span className="text-[11px] tabular-nums text-slate-400">{reason.length}/{formOptions.reasonMax || 500}</span>
        </div>
        <textarea
          id={`${ids}-reason`}
          rows={3}
          maxLength={formOptions.reasonMax || 500}
          value={reason}
          disabled={isSubmitting}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Enter reason for leave…"
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 transition-[border-color,box-shadow] hover:border-slate-300 focus:border-[#2b6485] focus:outline-none focus:ring-2 focus:ring-[#2b6485]/25"
        />
      </div>

      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700"><Icon className="fa-solid fa-circle-exclamation mt-0.5 text-[14px]" />{error}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="press h-11 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="press gradient-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(8_26_46/0.95)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:opacity-60">
          <Icon className={isSubmitting ? "fa-solid fa-spinner animate-spin" : "fa-regular fa-paper-plane"} />
          {isSubmitting ? "Submitting…" : total ? `Apply for ${daysText(total)}` : "Apply"}
        </button>
      </div>
    </form>
  );
}

// The form mounts fresh each time the modal opens, so it always starts from a clean slate
export const ApplyLeaveModal = ({ open, initialDate, onClose, onSubmit, isSubmitting = false }) => (
  <RequestModal open={open} tone="dark" size="lg" title="Apply Leave" icon="fa-regular fa-calendar-plus" onClose={() => { if (!isSubmitting) onClose(); }}>
    {open && <LeaveForm initialDate={initialDate} onClose={onClose} onSubmit={onSubmit} isSubmitting={isSubmitting} />}
  </RequestModal>
);

export default ApplyLeaveModal;
