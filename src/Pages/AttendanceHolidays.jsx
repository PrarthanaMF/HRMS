import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAttendanceAccess } from "../Hooks/useAttendance";
import { invalidateAttendance } from "../Store/Redux/Attendance/AttendanceSlice";
import { RequestModal } from "../Components/Pages/Attendance/AttendanceForms";

/*
 * Place in src/Pages/AttendanceHolidays.jsx.
 * Frontend only: no holiday eligibility, payroll or attendance calculation here.
 *
 * API: same VITE_ATTENDANCE_API_BASE_URL as the attendance hooks.
 * GET /holidays?year=2026 => {
 *   canManageHolidays: true, canCreate: true,
 *   allowedLevels: ["COMPANY", "BRANCH", "EMPLOYEE"],
 *   options: { COMPANY: [{id, label}], BRANCH: [{id, label}], EMPLOYEE: [{id, label}] },
 *   items: [{id, name, from, to, level, targets:[{id,label}], notes,
 *            canEdit:true, canDelete:true, version:1}]
 * }
 * POST /holidays; PATCH /holidays/:id; DELETE /holidays/:id => {ok:true,message?}
 * Create/update body: {name, from, to, level, targetIds:[], notes, version?}
 * Delete body: {version?}. Backend checks version when present (409 on conflict).
 * GET /context must also return canManageHolidays for the navigation button.
 * Return only authorized records and target options; enforce all permissions,
 * duplicate/overlap handling, month locks and attendance updates on the backend.
 * No API URL: labeled, in-memory demo for Super_admin only. Reload resets demo edits.
 *
 * EDIT GUIDE: LEVELS/styles → wording and appearance; HolidayForm → fields;
 * HolidayWorkspace → list/filters; request → API transport; demoData → preview.
 */
const API_BASE = (import.meta.env?.VITE_ATTENDANCE_API_BASE_URL || "").replace(/\/$/, "");
const LEVELS = { COMPANY: "Company", BRANCH: "Branch", EMPLOYEE: "Employee" };
const button = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = `${button} border-slate-200 bg-white text-[#1B4A7B] hover:bg-[#F0F6FA]`;
const primary = `${button} border-[#1B4A7B] bg-[#1B4A7B] text-white hover:bg-[#133F66]`;
const input = "min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A7DC0]";
const label = "grid gap-1.5 text-xs font-medium text-slate-600";
const dateText = value => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// Navigation visibility only. The holiday endpoint independently authorizes the page.
export function canManageAttendanceHolidays(access) {
  return Boolean(access?.user?.empId && (API_BASE
    ? access.canManageHolidays === true
    : access.demo === true && access.user.role === "Super_admin"));
}

async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include", signal,
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || (response.status === 409 ? "This holiday changed. Close the form and refresh before editing again." : "Unable to update holidays."));
  if (!data || (method !== "GET" && data.ok !== true)) throw new Error(data?.message || "No confirmation was received. Refresh to check the holiday before retrying.");
  return data;
}

function demoData(access, year) {
  const employees = access.accessibleEmployees || [];
  const unique = values => [...new Set(values.filter(Boolean))].map(value => ({ id: String(value), label: String(value) }));
  const options = {
    COMPANY: unique(employees.map(item => item.company)),
    BRANCH: unique(employees.map(item => item.branch)),
    EMPLOYEE: employees.map(item => ({ id: String(item.empId), label: `${item.empId} · ${item.name || "Employee"}` })),
  };
  const items = Object.keys(LEVELS).filter(level => options[level].length).map((level, index) => ({
    id: `demo-${level}`, name: ["Company holiday", "Regional holiday", "Personalized holiday"][index],
    level, from: `${year}-11-${String(10 + index).padStart(2, "0")}`, to: `${year}-11-${String(10 + index).padStart(2, "0")}`,
    targets: [options[level][0]], notes: "Sample holiday for preview.", canEdit: true, canDelete: true,
  }));
  return { canManageHolidays: true, canCreate: true, allowedLevels: Object.keys(LEVELS).filter(level => options[level].length), options, items };
}

function HolidayForm({ item, level, data, busy, error, onSave, onClose }) {
  const [name, setName] = useState(item?.name || "");
  const [from, setFrom] = useState(item?.from || "");
  const [to, setTo] = useState(item?.to || "");
  const [scope, setScope] = useState(item?.level || level);
  const [targetIds, setTargetIds] = useState((item?.targets || []).map(target => String(target.id)));
  const [notes, setNotes] = useState(item?.notes || "");
  const [search, setSearch] = useState("");
  const [validation, setValidation] = useState("");
  const options = data.options?.[scope] || [];
  const matches = options.filter(option => option.label.toLowerCase().includes(search.trim().toLowerCase()));
  const submit = event => {
    event.preventDefault();
    if (!name.trim() || !from || !to || to < from || !targetIds.length) { setValidation("Enter a holiday name, a valid date range, and at least one assignment."); return; }
    if (!data.allowedLevels.includes(scope) || targetIds.some(id => !options.some(option => String(option.id) === id))) { setValidation("One or more assignments are unavailable. Refresh and select them again."); return; }
    setValidation("");
    onSave({ name: name.trim(), from, to, level: scope, targetIds, notes: notes.trim(), ...(item?.version != null ? { version: item.version } : {}) });
  };
  return <RequestModal open title={item ? "Edit holiday" : "Add holiday"} subtitle="Assign a holiday to a company, branch or specific employees." icon="fa-regular fa-calendar" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4 p-4" aria-busy={busy}>
      {(validation || error) && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{validation || error}</p>}
      <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>Holiday name<input data-autofocus required maxLength={120} value={name} onChange={event => setName(event.target.value)} className={input} /></label>
        <label className={label}>From<input type="date" required value={from} onChange={event => { setFrom(event.target.value); if (!to) setTo(event.target.value); }} className={input} /></label>
        <label className={label}>To<input type="date" required min={from || undefined} value={to} onChange={event => setTo(event.target.value)} className={input} /></label>
        <label className={`${label} sm:col-span-2`}>Level<select value={scope} onChange={event => { setScope(event.target.value); setTargetIds([]); setSearch(""); }} className={input}>{data.allowedLevels.map(value => <option key={value} value={value}>{LEVELS[value]}</option>)}</select></label>
        <div className="space-y-2 sm:col-span-2">
          <label className={label}>Applies to · {targetIds.length} selected<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${LEVELS[scope]?.toLowerCase() || "assignments"}`} className={input} /></label>
          <div role="group" aria-label="Holiday assignments" className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {matches.length ? matches.map(option => <label key={option.id} className="flex min-h-9 items-center gap-2 rounded px-2 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={targetIds.includes(String(option.id))} onChange={event => setTargetIds(current => event.target.checked ? [...current, String(option.id)] : current.filter(id => id !== String(option.id)))} className="h-4 w-4 shrink-0 accent-[#1B4A7B]" /><span className="break-words">{option.label}</span></label>) : <p className="p-2 text-xs text-slate-500">No matching assignments.</p>}
          </div>
        </div>
        <label className={`${label} sm:col-span-2`}>Notes (optional)<textarea rows={2} maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} className={input} /></label>
      </fieldset>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" disabled={busy} onClick={onClose} className={secondary}>Cancel</button><button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save holiday"}</button></div>
    </form>
  </RequestModal>;
}

function HolidayWorkspace({ access }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const demo = !API_BASE;
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(() => demo ? demoData(access, currentYear) : null);
  const [loading, setLoading] = useState(!demo);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [level, setLevel] = useState("COMPANY");
  const [target, setTarget] = useState("");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true); setLoadError(""); setData(null);
    request(`/holidays?year=${year}`, { signal: controller.signal }).then(result => {
      if (!active) return;
      setData(result);
      setLevel(previous => result.allowedLevels?.includes(previous) ? previous : result.allowedLevels?.[0] || "COMPANY");
    }).catch(cause => { if (active && cause.name !== "AbortError") setLoadError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [year, revision, demo]);
  const levels = (data?.allowedLevels || []).filter(value => LEVELS[value]);
  const activeLevel = levels.includes(level) ? level : levels[0];
  const authorized = data?.canManageHolidays === true;
  const items = (data?.items || []).filter(item => item.level === activeLevel && item.from <= `${year}-12-31` && item.to >= `${year}-01-01` && (!target || item.targets?.some(value => String(value.id) === target))).sort((a, b) => a.from.localeCompare(b.from));
  const closeEditor = () => { if (!pending.current) { setEditor(null); setError(""); } };
  const closeDelete = () => { if (!pending.current) { setDeleting(null); setError(""); } };
  const save = async payload => {
    if (pending.current || !authorized || (editor?.item ? editor.item.canEdit !== true : data.canCreate !== true)) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (demo) {
        const item = { ...payload, id: editor.item?.id || `demo-${Date.now()}`, targets: (data.options[payload.level] || []).filter(option => payload.targetIds.includes(String(option.id))), canEdit: true, canDelete: true };
        setData(previous => ({ ...previous, items: editor.item ? previous.items.map(value => value.id === item.id ? item : value) : [...previous.items, item] }));
      } else {
        await request(editor.item ? `/holidays/${encodeURIComponent(editor.item.id)}` : "/holidays", { method: editor.item ? "PATCH" : "POST", body: payload });
        dispatch(invalidateAttendance()); setRevision(value => value + 1);
      }
      setEditor(null); setLevel(payload.level); setTarget(""); setYear(Number(payload.from.slice(0, 4)));
      setNotice(demo ? "Holiday saved in this preview. Attendance is unchanged." : "Holiday saved.");
    } catch (cause) { setError(cause.message || "Unable to save holiday."); }
    finally { pending.current = false; setBusy(false); }
  };
  const remove = async () => {
    if (pending.current || !authorized || deleting?.canDelete !== true) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (demo) setData(previous => ({ ...previous, items: previous.items.filter(item => item.id !== deleting.id) }));
      else {
        await request(`/holidays/${encodeURIComponent(deleting.id)}`, { method: "DELETE", body: deleting.version != null ? { version: deleting.version } : {} });
        dispatch(invalidateAttendance()); setRevision(value => value + 1);
      }
      setDeleting(null); setNotice(demo ? "Holiday removed from this preview." : "Holiday deleted.");
    } catch (cause) { setError(cause.message || "Unable to delete holiday."); }
    finally { pending.current = false; setBusy(false); }
  };
  return <main className="min-h-full bg-[#f3f7fa] px-3 py-3 text-slate-900 sm:px-4"><div className="mx-auto max-w-[1440px]">
    <header className="mb-4 flex items-start justify-between gap-3"><div><p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Attendance</p><h1 className="text-xl font-bold">Holiday Management</h1><p className="mt-1 text-xs text-slate-500">Company, branch and employee holidays</p></div><button type="button" onClick={() => navigate("/attendance")} aria-label="Back to attendance" className={secondary}><i aria-hidden="true" className="fa-solid fa-arrow-left" /></button></header>
    {demo && <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Demo preview · Sample holidays only. Changes reset when you leave this page and do not update attendance.</p>}
    {notice && <p role="status" className="mb-3 text-xs text-[#1B4A7B]">{notice}</p>}
    {loading ? <p role="status" className="p-4 text-sm text-slate-500">Loading holidays…</p> : loadError ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{loadError}</p><button type="button" onClick={() => setRevision(value => value + 1)} className={`${secondary} mt-3`}>Retry</button></div> : !authorized ? <p role="alert" className="rounded-lg border border-slate-200 bg-white p-4 text-sm">You are not assigned to manage holidays.</p> : <>
      <div role="group" aria-label="Holiday level" className="mb-3 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">{levels.map(value => <button type="button" key={value} aria-pressed={activeLevel === value} onClick={() => { setLevel(value); setTarget(""); }} className={activeLevel === value ? primary : `${button} border-transparent text-slate-600 hover:bg-slate-50`}>{LEVELS[value]}</button>)}</div>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className={label}>Year<input type="number" min={1900} max={9999} value={year} onChange={event => { const value = Number(event.target.value); if (value >= 1900 && value <= 9999) { setYear(value); setTarget(""); } }} className={`${input} max-w-28`} /></label>
        <label className={`${label} min-w-0 flex-1 sm:max-w-sm`}>Applies to<select value={target} onChange={event => setTarget(event.target.value)} className={input}><option value="">All {LEVELS[activeLevel]?.toLowerCase() || "assigned"} holidays</option>{(data.options?.[activeLevel] || []).map(option => <option key={option.id} value={String(option.id)}>{option.label}</option>)}</select></label>
        {!demo && <button type="button" onClick={() => { setNotice(""); setRevision(value => value + 1); }} className={secondary} aria-label="Refresh holidays"><i aria-hidden="true" className="fa-solid fa-rotate-right" /></button>}
        {data.canCreate === true && activeLevel && <button type="button" onClick={() => { setEditor({ item: null }); setError(""); }} className={`${primary} sm:ml-auto`}><i aria-hidden="true" className="fa-solid fa-plus" />Add holiday</button>}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.length ? items.map(item => <article key={item.id} className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-3 last:border-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="min-w-0"><h2 className="break-words text-sm font-semibold">{item.name}</h2><span className="mt-1 inline-block rounded bg-[#F0F6FA] px-2 py-0.5 text-[11px] text-[#1B4A7B]">{LEVELS[item.level]}</span>{item.notes && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">{item.notes}</p>}</div>
          <p className="text-xs text-slate-600">{dateText(item.from)}{item.from !== item.to && <> – {dateText(item.to)}</>}</p>
          <p className="break-words text-xs text-slate-600">{item.targets?.map(value => value.label).join(", ") || "Assignment not provided"}</p>
          <div className="flex gap-2">{item.canEdit === true && <button type="button" onClick={() => { setEditor({ item }); setError(""); }} className={secondary} aria-label={`Edit ${item.name}`}>Edit</button>}{item.canDelete === true && <button type="button" onClick={() => { setDeleting(item); setError(""); }} className={`${button} border-red-200 text-red-700 hover:bg-red-50`} aria-label={`Delete ${item.name}`}>Delete</button>}</div>
        </article>) : <p className="p-8 text-center text-sm text-slate-500">No holidays for this selection.</p>}
      </div>
    </>}
    {editor && authorized && <HolidayForm item={editor.item} level={activeLevel} data={data} busy={busy} error={error} onSave={save} onClose={closeEditor} />}
    <RequestModal open={Boolean(deleting) && authorized} title="Delete holiday?" subtitle={deleting?.name || ""} icon="fa-regular fa-trash-can" onClose={closeDelete}><div className="space-y-4 p-4"><p className="text-sm text-slate-600">Remove this holiday for all its assigned companies, branches or employees?</p>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={closeDelete} className={secondary}>Cancel</button><button type="button" disabled={busy} onClick={remove} className={`${button} border-red-700 bg-red-700 text-white`}>{busy ? "Deleting…" : "Delete holiday"}</button></div></div></RequestModal>
  </div></main>;
}

export default function AttendanceHolidays() {
  const access = useAttendanceAccess();
  if (access.isLoading) return <p role="status" className="p-4 text-sm text-slate-500">Loading access…</p>;
  if (access.error) return <p role="alert" className="p-4 text-sm text-red-700">{access.error.message || "Unable to load access."}</p>;
  if (!canManageAttendanceHolidays(access)) return <div className="p-4"><p role="alert" className="text-sm text-slate-600">You are not assigned to manage holidays.</p><a href="/attendance" className="mt-3 inline-block text-sm text-[#1B4A7B] underline">Back to attendance</a></div>;
  return <HolidayWorkspace key={String(access.user.empId)} access={access} />;
}
