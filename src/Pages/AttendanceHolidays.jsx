import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAttendanceAccess } from "../Hooks/useAttendance";
import { invalidateAttendance } from "../Store/Redux/Attendance/AttendanceSlice";
import { RequestModal } from "../Components/Pages/Attendance/AttendanceForms";
import { api } from "../api/client";
import { forgetContext } from "../api/attendance";

/*
 * Holiday management on the backend's holiday model (see the backend's docs/API.md, "Holidays"):
 * one date per holiday, scope COMPANY (everyone) / BRANCH (listed branches) / PERSONAL (listed
 * employees), type NATIONAL / FESTIVAL / COMPANY, and `recurring` for holidays that repeat every
 * year (national holidays by default). HR roles only; the backend checks permissions and refuses
 * changes in months locked for payroll.
 *
 * EDIT GUIDE: LEVELS/TYPES/styles -> wording and appearance; HolidayForm -> fields;
 * HolidayWorkspace -> list/filters.
 */
const LEVELS = { COMPANY: "Company", BRANCH: "Branch", PERSONAL: "Employee" };
const TYPES = { NATIONAL: "National", FESTIVAL: "Festival", COMPANY: "Company" };
const button = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = `${button} border-slate-200 bg-white text-[#1B4A7B] hover:bg-[#F0F6FA]`;
const primary = `${button} border-[#1B4A7B] bg-[#1B4A7B] text-white hover:bg-[#133F66]`;
const input = "min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A7DC0]";
const label = "grid gap-1.5 text-xs font-medium text-slate-600";
const dateText = value => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// Navigation visibility only. The holiday endpoints independently authorize every change.
export function canManageAttendanceHolidays(access) {
  return access?.canManageHolidays === true;
}

// Branches and employees a holiday can be assigned to
function useTargets(access) {
  const [branches, setBranches] = useState([]);
  useEffect(() => {
    let active = true;
    api.get("/branches").then(list => { if (active) setBranches(list.map(branch => ({ id: String(branch._id), label: branch.code ? `${branch.name} (${branch.code})` : branch.name }))); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const employees = (access.accessibleEmployees || []).map(employee => ({ id: String(employee._id), label: `${employee.empId} · ${employee.name || "Employee"}` }));
  return { COMPANY: [], BRANCH: branches, PERSONAL: employees };
}

function HolidayForm({ item, level, options, busy, error, onSave, onClose }) {
  const [name, setName] = useState(item?.name || "");
  const [date, setDate] = useState(item?.date || "");
  const [type, setType] = useState(item?.type || "FESTIVAL");
  const [recurring, setRecurring] = useState(item ? item.recurring === true : false);
  const [scope, setScope] = useState(item?.scope || level);
  const [targetIds, setTargetIds] = useState(item ? (item.scope === "BRANCH" ? item.branches : item.employees || []).map(String) : []);
  const [notes, setNotes] = useState(item?.description || "");
  const [search, setSearch] = useState("");
  const [validation, setValidation] = useState("");
  const choices = options[scope] || [];
  const matches = choices.filter(option => option.label.toLowerCase().includes(search.trim().toLowerCase()));
  const needsTargets = scope !== "COMPANY";
  const submit = event => {
    event.preventDefault();
    if (!name.trim() || !date || (needsTargets && !targetIds.length)) {
      setValidation(needsTargets ? "Enter a holiday name, a date, and at least one assignment." : "Enter a holiday name and a date.");
      return;
    }
    setValidation("");
    onSave({
      name: name.trim(),
      date,
      type,
      recurring,
      scope,
      branches: scope === "BRANCH" ? targetIds : [],
      employees: scope === "PERSONAL" ? targetIds : [],
      description: notes.trim(),
    });
  };
  return <RequestModal open title={item ? "Edit holiday" : "Add holiday"} subtitle="A holiday for everyone, for branches, or for specific employees." icon="fa-regular fa-calendar" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4 p-4" aria-busy={busy}>
      {(validation || error) && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{validation || error}</p>}
      <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>Holiday name<input data-autofocus required maxLength={100} value={name} onChange={event => setName(event.target.value)} className={input} /></label>
        <label className={label}>Date<input type="date" required value={date} onChange={event => setDate(event.target.value)} className={input} /></label>
        <label className={label}>Type<select value={type} onChange={event => { setType(event.target.value); if (!item) setRecurring(event.target.value === "NATIONAL"); }} className={input}>{Object.entries(TYPES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:col-span-2"><input type="checkbox" checked={recurring} onChange={event => setRecurring(event.target.checked)} className="h-4 w-4 accent-[#1B4A7B]" />Repeats every year on this date</label>
        <label className={`${label} sm:col-span-2`}>Applies to<select value={scope} onChange={event => { setScope(event.target.value); setTargetIds([]); setSearch(""); }} className={input}>{Object.entries(LEVELS).map(([value, text]) => <option key={value} value={value}>{value === "COMPANY" ? "Everyone (company)" : text === "Employee" ? "Specific employees" : "Specific branches"}</option>)}</select></label>
        {needsTargets && <div className="space-y-2 sm:col-span-2">
          <label className={label}>{LEVELS[scope]}s · {targetIds.length} selected<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${LEVELS[scope].toLowerCase()}s`} className={input} /></label>
          <div role="group" aria-label="Holiday assignments" className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {matches.length ? matches.map(option => <label key={option.id} className="flex min-h-9 items-center gap-2 rounded px-2 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={targetIds.includes(option.id)} onChange={event => setTargetIds(current => event.target.checked ? [...current, option.id] : current.filter(id => id !== option.id))} className="h-4 w-4 shrink-0 accent-[#1B4A7B]" /><span className="break-words">{option.label}</span></label>) : <p className="p-2 text-xs text-slate-500">No matching {LEVELS[scope].toLowerCase()}s.</p>}
          </div>
        </div>}
        <label className={`${label} sm:col-span-2`}>Notes (optional)<textarea rows={2} maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} className={input} /></label>
      </fieldset>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" disabled={busy} onClick={onClose} className={secondary}>Cancel</button><button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save holiday"}</button></div>
    </form>
  </RequestModal>;
}

function HolidayWorkspace({ access }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const options = useTargets(access);
  const currentYear = Number((access.serverToday || "").slice(0, 4)) || new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [holidays, setHolidays] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const controller = new AbortController();
    let active = true;
    setLoading(true); setLoadError(""); setHolidays(null);
    api.get("/holidays", { year }, { signal: controller.signal }).then(result => {
      if (active) setHolidays(result.holidays);
    }).catch(cause => { if (active && cause.name !== "AbortError") setLoadError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [year, revision]);
  const labelsFor = item => {
    const ids = (item.scope === "BRANCH" ? item.branches : item.scope === "PERSONAL" ? item.employees : []).map(String);
    if (item.scope === "COMPANY") return "Everyone";
    return ids.map(id => options[item.scope]?.find(option => option.id === id)?.label || "Unknown").join(", ");
  };
  const items = (holidays || []).filter(item => item.scope === level && (!target || [...(item.branches || []), ...(item.employees || [])].map(String).includes(target))).sort((a, b) => a.date.localeCompare(b.date));
  const closeEditor = () => { if (!pending.current) { setEditor(null); setError(""); } };
  const closeDelete = () => { if (!pending.current) { setDeleting(null); setError(""); } };
  const changed = () => { forgetContext(); dispatch(invalidateAttendance()); setRevision(value => value + 1); };
  const save = async payload => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      if (editor.item) {
        // The list shows a yearly holiday on this year's date; only send the date if it was changed,
        // so editing a repeating holiday does not move its first year
        const { date, ...rest } = payload;
        await api.patch(`/holidays/${encodeURIComponent(editor.item._id)}`, date === editor.item.date ? rest : payload);
      } else await api.post("/holidays", payload);
      changed();
      setEditor(null); setLevel(payload.scope); setTarget(""); setYear(Number(payload.date.slice(0, 4)));
      setNotice("Holiday saved. Attendance reports now count it.");
    } catch (cause) { setError(cause.message || "Unable to save holiday."); }
    finally { pending.current = false; setBusy(false); }
  };
  const remove = async () => {
    if (pending.current || !deleting) return;
    pending.current = true; setBusy(true); setError("");
    try {
      await api.delete(`/holidays/${encodeURIComponent(deleting._id)}`);
      changed();
      setDeleting(null); setNotice("Holiday deleted.");
    } catch (cause) { setError(cause.message || "Unable to delete holiday."); }
    finally { pending.current = false; setBusy(false); }
  };
  return <main className="min-h-full bg-[#f3f7fa] px-3 py-3 text-slate-900 sm:px-4"><div className="mx-auto max-w-[1440px]">
    <header className="mb-4 flex items-start justify-between gap-3"><div><p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Attendance</p><h1 className="text-xl font-bold">Holiday Management</h1><p className="mt-1 text-xs text-slate-500">Company, branch and employee holidays</p></div><button type="button" onClick={() => navigate("/attendance")} aria-label="Back to attendance" className={secondary}><i aria-hidden="true" className="fa-solid fa-arrow-left" /></button></header>
    {notice && <p role="status" className="mb-3 text-xs text-[#1B4A7B]">{notice}</p>}
    {loading ? <p role="status" className="p-4 text-sm text-slate-500">Loading holidays…</p> : loadError ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{loadError}</p><button type="button" onClick={() => setRevision(value => value + 1)} className={`${secondary} mt-3`}>Retry</button></div> : <>
      <div role="group" aria-label="Holiday level" className="mb-3 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">{Object.keys(LEVELS).map(value => <button type="button" key={value} aria-pressed={level === value} onClick={() => { setLevel(value); setTarget(""); }} className={level === value ? primary : `${button} border-transparent text-slate-600 hover:bg-slate-50`}>{LEVELS[value]}</button>)}</div>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className={label}>Year<input type="number" min={1970} max={2100} value={year} onChange={event => { const value = Number(event.target.value); if (value >= 1970 && value <= 2100) { setYear(value); setTarget(""); } }} className={`${input} max-w-28`} /></label>
        {level !== "COMPANY" && <label className={`${label} min-w-0 flex-1 sm:max-w-sm`}>Applies to<select value={target} onChange={event => setTarget(event.target.value)} className={input}><option value="">All {LEVELS[level].toLowerCase()} holidays</option>{(options[level] || []).map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
        <button type="button" onClick={() => { setNotice(""); setRevision(value => value + 1); }} className={secondary} aria-label="Refresh holidays"><i aria-hidden="true" className="fa-solid fa-rotate-right" /></button>
        <button type="button" onClick={() => { setEditor({ item: null }); setError(""); }} className={`${primary} sm:ml-auto`}><i aria-hidden="true" className="fa-solid fa-plus" />Add holiday</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.length ? items.map(item => <article key={`${item._id}-${item.date}`} className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-3 last:border-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="min-w-0"><h2 className="break-words text-sm font-semibold">{item.name}</h2><span className="mt-1 inline-block rounded bg-[#F0F6FA] px-2 py-0.5 text-[11px] text-[#1B4A7B]">{TYPES[item.type] || item.type}{item.recurring ? " · every year" : ""}</span>{item.description && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">{item.description}</p>}</div>
          <p className="text-xs text-slate-600">{dateText(item.date)}</p>
          <p className="break-words text-xs text-slate-600">{labelsFor(item)}</p>
          <div className="flex gap-2"><button type="button" onClick={() => { setEditor({ item }); setError(""); }} className={secondary} aria-label={`Edit ${item.name}`}>Edit</button><button type="button" onClick={() => { setDeleting(item); setError(""); }} className={`${button} border-red-200 text-red-700 hover:bg-red-50`} aria-label={`Delete ${item.name}`}>Delete</button></div>
        </article>) : <p className="p-8 text-center text-sm text-slate-500">No holidays for this selection.</p>}
      </div>
    </>}
    {editor && <HolidayForm item={editor.item} level={level} options={options} busy={busy} error={error} onSave={save} onClose={closeEditor} />}
    <RequestModal open={Boolean(deleting)} title="Delete holiday?" subtitle={deleting?.name || ""} icon="fa-regular fa-trash-can" onClose={closeDelete}><div className="space-y-4 p-4"><p className="text-sm text-slate-600">{deleting?.recurring ? "This holiday repeats every year; deleting removes it from every year." : "Remove this holiday for everyone it is assigned to?"}</p>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={closeDelete} className={secondary}>Cancel</button><button type="button" disabled={busy} onClick={remove} className={`${button} border-red-700 bg-red-700 text-white`}>{busy ? "Deleting…" : "Delete holiday"}</button></div></div></RequestModal>
  </div></main>;
}

export default function AttendanceHolidays() {
  const access = useAttendanceAccess();
  if (access.isLoading) return <p role="status" className="p-4 text-sm text-slate-500">Loading access…</p>;
  if (access.error) return <p role="alert" className="p-4 text-sm text-red-700">{access.error.message || "Unable to load access."}</p>;
  if (!canManageAttendanceHolidays(access)) return <div className="p-4"><p role="alert" className="text-sm text-slate-600">You are not assigned to manage holidays.</p><a href="/attendance" className="mt-3 inline-block text-sm text-[#1B4A7B] underline">Back to attendance</a></div>;
  return <HolidayWorkspace key={String(access.user?._id)} access={access} />;
}
