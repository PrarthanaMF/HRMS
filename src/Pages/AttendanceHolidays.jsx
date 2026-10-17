import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAttendanceAccess } from "../Hooks/useAttendance";
import { invalidateAttendance } from "../Store/Redux/Attendance/AttendanceSlice";
import { RequestModal } from "../Components/Pages/Attendance/AttendanceForms";
import { api } from "../api/client";
import { forgetContext } from "../api/attendance";
import { HOLIDAY_IMPORT, SpreadsheetImportModal } from "../Components/Common/SpreadsheetImport";
import { DatePicker } from "../Components/Common/DateTimePicker";
import PageHeader, { primaryButton, secondaryButton } from "../Components/Common/PageHeader";

import Icon from "../Components/Common/Icon";
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
const button = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition pointer-coarse:min-h-10 pointer-coarse:min-w-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = `${button} border-slate-200 bg-white text-[#1f4e6b] hover:bg-[#f2f5f7]`;
const primary = `${button} border-[#1f4e6b] bg-[#1f4e6b] text-white hover:bg-[#163a58]`;
const input = "min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2b6485]";
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
        <label className={label}>Date<DatePicker value={date} onChange={setDate} placeholder="Holiday date" /></label>
        <label className={label}>Type<select value={type} onChange={event => { setType(event.target.value); if (!item) setRecurring(event.target.value === "NATIONAL"); }} className={input}>{Object.entries(TYPES).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:col-span-2"><input type="checkbox" checked={recurring} onChange={event => setRecurring(event.target.checked)} className="h-4 w-4 accent-[#1f4e6b]" />Repeats every year on this date</label>
        <label className={`${label} sm:col-span-2`}>Applies to<select value={scope} onChange={event => { setScope(event.target.value); setTargetIds([]); setSearch(""); }} className={input}>{Object.entries(LEVELS).map(([value, text]) => <option key={value} value={value}>{value === "COMPANY" ? "Everyone (company)" : text === "Employee" ? "Specific employees" : "Specific branches"}</option>)}</select></label>
        {needsTargets && <div className="space-y-2 sm:col-span-2">
          <label className={label}>{LEVELS[scope]}s · {targetIds.length} selected<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${LEVELS[scope].toLowerCase()}s`} className={input} /></label>
          <div role="group" aria-label="Holiday assignments" className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {matches.length ? matches.map(option => <label key={option.id} className="flex min-h-9 items-center gap-2 rounded px-2 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={targetIds.includes(option.id)} onChange={event => setTargetIds(current => event.target.checked ? [...current, option.id] : current.filter(id => id !== option.id))} className="h-4 w-4 shrink-0 accent-[#1f4e6b]" /><span className="break-words">{option.label}</span></label>) : <p className="p-2 text-xs text-slate-500">No matching {LEVELS[scope].toLowerCase()}s.</p>}
          </div>
        </div>}
        <label className={`${label} sm:col-span-2`}>Notes (optional)<textarea rows={2} maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} className={input} /></label>
      </fieldset>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" disabled={busy} onClick={onClose} className={secondary}>Cancel</button><button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save holiday"}</button></div>
    </form>
  </RequestModal>;
}

function HolidayWorkspace({ access }) {
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
  const [importOpen, setImportOpen] = useState(false);
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
  const canManage = canManageAttendanceHolidays(access);
  const todayKey = access.serverToday || new Date().toISOString().slice(0, 10);
  // Group the visible holidays by month so a year reads as a calendar, not one long list
  const months = items.reduce((groups, item) => {
    const key = item.date.slice(0, 7);
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {});
  const upcoming = items.find(item => item.date >= todayKey);
  const monthName = key => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long" });
  const weekday = value => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" });

  return <div className="text-slate-900">
    <div className="w-full">
      <PageHeader
        icon="fa-solid fa-umbrella-beach"
        title="Holidays"
        description={canManage
          ? "Company, branch and employee holidays. Attendance reports count these days automatically."
          : "Company, branch and employee holidays for the year."}
        actions={<>
          <div role="group" aria-label="Year" className="glass-panel flex items-center gap-1 rounded-xl p-1">
            <button type="button" onClick={() => { setYear(value => value - 1); setTarget(""); }} className="press flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-[var(--ink)] pointer-coarse:h-10 pointer-coarse:w-10" aria-label={`Show ${year - 1}`}><Icon className="fa-solid fa-chevron-left text-[13px]" /></button>
            <span aria-live="polite" className="min-w-14 text-center text-sm font-semibold tabular-nums text-[var(--ink)]">{year}</span>
            <button type="button" onClick={() => { setYear(value => value + 1); setTarget(""); }} className="press flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-[var(--ink)] pointer-coarse:h-10 pointer-coarse:w-10" aria-label={`Show ${year + 1}`}><Icon className="fa-solid fa-chevron-right text-[13px]" /></button>
          </div>
          <button type="button" onClick={() => { setNotice(""); setRevision(value => value + 1); }} className={`${secondaryButton} w-10 px-0`} aria-label="Refresh holidays"><Icon className="fa-solid fa-rotate-right" /></button>
          {canManage && <button type="button" onClick={() => setImportOpen(true)} className={secondaryButton}><Icon className="fa-solid fa-file-import" />Import</button>}
          {canManage && <button type="button" onClick={() => { setEditor({ item: null }); setError(""); }} className={primaryButton}><Icon className="fa-solid fa-plus" />Add holiday</button>}
        </>}
      />

      {notice && <p role="status" className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</p>}

      {loading ? <p role="status" className="glass rounded-xl p-6 text-sm text-slate-500">Loading holidays…</p>
        : loadError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{loadError}</p><button type="button" onClick={() => setRevision(value => value + 1)} className={`${secondary} mt-3`}>Retry</button></div>
          : <>
            {/* ============ SCOPE + FILTER ============ */}
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <div role="group" aria-label="Holiday level" className="flex flex-wrap gap-1 glass rounded-xl p-1">
                {Object.keys(LEVELS).map(value => <button type="button" key={value} aria-pressed={level === value} onClick={() => { setLevel(value); setTarget(""); }} className={level === value ? primary : `${button} border-transparent text-slate-600 hover:bg-slate-50`}>{LEVELS[value]}</button>)}
              </div>
              {level !== "COMPANY" && <label className={`${label} min-w-0 flex-1 sm:max-w-sm`}>Applies to<select value={target} onChange={event => setTarget(event.target.value)} className={input}><option value="">All {LEVELS[level].toLowerCase()} holidays</option>{(options[level] || []).map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>}
            </div>

            {/* ============ AT A GLANCE ============ */}
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="glass rounded-xl rise p-3"><p className="text-lg font-bold tabular-nums text-slate-800">{items.length}</p><p className="mt-0.5 text-[11px] font-medium text-slate-500">{LEVELS[level]} holidays in {year}</p></div>
              <div className="glass rounded-xl rise p-3"><p className="text-lg font-bold tabular-nums text-slate-800">{items.filter(item => item.recurring).length}</p><p className="mt-0.5 text-[11px] font-medium text-slate-500">Repeat every year</p></div>
              <div className="glass rounded-xl rise p-3"><p className="text-lg font-bold tabular-nums text-slate-800">{items.filter(item => item.date >= todayKey).length}</p><p className="mt-0.5 text-[11px] font-medium text-slate-500">Still to come</p></div>
              <div className="rise rounded-xl border border-[#cfdce5]/80 bg-gradient-to-br from-[#f2f5f7] to-white/80 p-3 shadow-[var(--shadow-card)]"><p className="truncate text-sm font-bold text-[#1f4e6b]">{upcoming ? upcoming.name : "—"}</p><p className="mt-0.5 text-[11px] font-medium text-[#64788a]">{upcoming ? `Next · ${dateText(upcoming.date)}` : "Nothing upcoming"}</p></div>
            </div>

            {/* ============ BY MONTH ============ */}
            {items.length ? <div className="space-y-3">
              {Object.keys(months).sort().map(key => <section key={key} aria-label={`${monthName(key)} ${year}`} className="overflow-hidden glass-strong rounded-2xl">
                <h2 className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white/40 px-3 py-2 text-[13px] font-semibold text-slate-500">
                  {monthName(key)}
                  <span className="ml-2 font-semibold normal-case tracking-normal text-slate-400">{months[key].length} holiday{months[key].length === 1 ? "" : "s"}</span>
                </h2>
                {months[key].map(item => <article key={`${item._id}-${item.date}`} className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-slate-100 p-3 transition-colors last:border-0 hover:bg-[#f2f5f7]/50 sm:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center ${item.date < todayKey ? "opacity-70" : ""}`}>
                  <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border text-center ${item.date === todayKey ? "border-[#1f4e6b] bg-[#1f4e6b] text-white" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
                    <span className="text-sm font-bold leading-none tabular-nums">{item.date.slice(8, 10)}</span>
                    <span className="mt-0.5 text-[10px] font-medium leading-none">{weekday(item.date)}</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-slate-800">{item.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{TYPES[item.type] || item.type}</span>
                      {item.recurring && <span className="inline-block rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">Every year</span>}
                      {item.date === todayKey && <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">Today</span>}
                    </div>
                    {item.description && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">{item.description}</p>}
                  </div>
                  <p className="col-start-2 break-words text-xs text-slate-600 sm:col-start-auto"><span className="text-slate-400">Applies to: </span>{labelsFor(item)}</p>
                  {canManage && <div className="col-start-2 flex justify-end gap-2 sm:col-start-auto">
                    <button type="button" onClick={() => { setEditor({ item }); setError(""); }} className={secondary} aria-label={`Edit ${item.name}`}><Icon aria-hidden="true" className="fa-solid fa-pen" /></button>
                    <button type="button" onClick={() => { setDeleting(item); setError(""); }} className={`${button} border-red-200 bg-white text-red-700 hover:bg-red-50`} aria-label={`Delete ${item.name}`}><Icon aria-hidden="true" className="fa-regular fa-trash-can" /></button>
                  </div>}
                </article>)}
              </section>)}
            </div> : <div className="rounded-xl border border-dashed border-slate-300/90 bg-white/60 p-10 text-center backdrop-blur">
              <h3 className="font-semibold text-slate-800">No {LEVELS[level].toLowerCase()} holidays for {year}</h3>
              <p className="mt-2 text-sm text-slate-500">{canManage ? "Add one, or import a whole year with Import." : "Nothing has been added for this selection yet."}</p>
            </div>}
          </>}

      {editor && <HolidayForm item={editor.item} level={level} options={options} busy={busy} error={error} onSave={save} onClose={closeEditor} />}
      {canManage && <SpreadsheetImportModal open={importOpen} config={HOLIDAY_IMPORT} onClose={() => setImportOpen(false)} onImported={() => { changed(); setNotice("Holidays imported. Attendance reports now count them."); }} />}
      <RequestModal open={Boolean(deleting)} title="Delete holiday?" subtitle={deleting?.name || ""} icon="fa-regular fa-trash-can" onClose={closeDelete}>
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-600">{deleting?.recurring ? "This holiday repeats every year; deleting removes it from every year." : "Remove this holiday for everyone it is assigned to?"}</p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={closeDelete} className={secondary}>Cancel</button>
            <button type="button" disabled={busy} onClick={remove} className={`${button} border-red-700 bg-red-700 text-white`}>{busy ? "Deleting…" : "Delete holiday"}</button>
          </div>
        </div>
      </RequestModal>
    </div>
  </div>;
}

export default function AttendanceHolidays() {
  const access = useAttendanceAccess();
  if (access.isLoading) return <p role="status" className="p-4 text-sm text-slate-500">Loading holidays…</p>;
  if (access.error) return <p role="alert" className="p-4 text-sm text-red-700">{access.error.message || "Unable to load access."}</p>;
  return <HolidayWorkspace key={String(access.user?._id)} access={access} />;
}
