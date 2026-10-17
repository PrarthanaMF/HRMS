import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { api } from "../api/client";
import { forgetContext } from "../api/attendance";
import { invalidateAttendance } from "../Store/Redux/Attendance/AttendanceSlice";
import { HR_ROLES } from "../Utils/roles";
import PageHeader, { primaryButton, secondaryButton } from "../Components/Common/PageHeader";

import Icon from "../Components/Common/Icon";
/*
 * Upload a biometric export or the HRMS attendance sheet (see the backend's docs/API.md,
 * "POST /attendance/import"). The backend has no dry-run for attendance: the import writes
 * immediately, so the panel asks for confirmation before sending and reports what changed.
 */
const MAX_BYTES = 5 * 1024 * 1024;

const secondary = secondaryButton;
const primary = primaryButton;

const sizeText = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

function Stat({ label, value, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <p className="text-lg font-bold tabular-nums">{value ?? 0}</p>
      <p className="mt-0.5 text-[11px] font-medium">{label}</p>
    </div>
  );
}

export default function AttendanceUpload() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.value?.role);
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  if (!HR_ROLES.includes(role)) {
    return (
      <div className="min-h-full p-4">
        <p role="alert" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Only HR can upload attendance.
        </p>
      </div>
    );
  }

  const choose = (event) => {
    const selected = event.target.files?.[0] || null;
    setError("");
    setResult(null);
    setConfirming(false);
    if (!selected) { setFile(null); return; }
    if (!/\.(csv|xlsx)$/i.test(selected.name)) {
      setFile(null);
      event.target.value = "";
      setError("Choose a CSV or Excel (.xlsx) file.");
      return;
    }
    if (!selected.size || selected.size > MAX_BYTES) {
      setFile(null);
      event.target.value = "";
      setError("Choose a non-empty file no larger than 5 MB.");
      return;
    }
    setFile(selected);
  };

  const clear = () => {
    setFile(null);
    setResult(null);
    setError("");
    setConfirming(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const upload = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const batch = await api.post("/attendance/import", form);
      forgetContext();
      dispatch(invalidateAttendance());
      setResult(batch);
      setConfirming(false);
      if (fileInput.current) fileInput.current.value = "";
      setFile(null);
    } catch (cause) {
      setError(cause?.message || "Unable to upload the sheet. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const problems = [...(result?.rowErrors || []), ...(result?.rowWarnings || [])];
  const tone = result?.status === "COMPLETED" ? "green" : result?.status === "FAILED" ? "red" : "amber";

  return (
    <div className="text-slate-900">
      <div className="w-full">
        <PageHeader
          icon="fa-solid fa-file-import"
          title="Upload attendance"
          description="Import the biometric device's daily export, or the HRMS attendance sheet, for any number of employees at once."
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          {/* ============ UPLOAD ============ */}
          <section className="glass-panel rounded-2xl p-5" style={{ "--i": 1 }}>
            <h2 className="text-sm font-bold text-slate-800">Choose a file</h2>
            <p className="mt-1 text-xs text-slate-500">Excel (.xlsx) or CSV, up to 5 MB. Rows are matched to employees by their biometric code.</p>

            <label
              htmlFor="attendance-sheet"
              className="group mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#cfdce5]/70 bg-gradient-to-br from-[#f2f5f7]/80 to-white/50 p-6 text-center transition-colors hover:border-[#2b6485] hover:from-[#dce6ed] focus-within:ring-2 focus-within:ring-[#2b6485]"
            >
              <span aria-hidden="true" className="gradient-brand flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_8px_18px_-8px_rgb(8_26_46/0.8)] transition-transform duration-300 group-hover:-translate-y-0.5">
                <Icon className="fa-solid fa-file-arrow-up text-base" />
              </span>
              <span className="text-xs font-semibold text-[#1f4e6b]">{file ? "Choose a different file" : "Click to choose a sheet"}</span>
              <span className="text-[11px] text-slate-500">CSV or Excel (.xlsx) · maximum 5 MB</span>
              <input
                id="attendance-sheet"
                ref={fileInput}
                type="file"
                accept=".csv,.xlsx"
                disabled={busy}
                onChange={choose}
                className="sr-only"
              />
            </label>

            {file && (
              <div className="mt-3 flex items-center gap-3 glass rounded-xl p-3">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f5f7] text-[#1f4e6b]">
                  <Icon className="fa-regular fa-file-excel" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-500">{sizeText(file.size)}</p>
                </div>
                <button type="button" onClick={clear} disabled={busy} className={secondary} aria-label="Remove the chosen file">
                  <Icon aria-hidden="true" className="fa-solid fa-xmark" />
                </button>
              </div>
            )}

            {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}

            {confirming ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-900">Import this sheet now?</p>
                <p className="mt-1 text-[11px] leading-4 text-amber-800">
                  Attendance has no check-only step: the days in this sheet are saved as soon as you confirm. Days corrected by hand are kept.
                </p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={secondary}>Back</button>
                  <button type="button" onClick={upload} disabled={busy} className={primary}>
                    {busy && <Icon aria-hidden="true" className="fa-solid fa-spinner animate-spin" />}
                    {busy ? "Importing…" : "Yes, import now"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setConfirming(true)} disabled={!file || busy} className={primary}>
                  <Icon aria-hidden="true" className="fa-solid fa-file-import" />Import Attendance
                </button>
              </div>
            )}
          </section>

          {/* ============ WHAT THE SHEET NEEDS ============ */}
          <section className="glass-panel rounded-2xl p-5" style={{ "--i": 1 }}>
            <h2 className="text-sm font-bold text-slate-800">What the sheet needs</h2>
            <dl className="mt-2 space-y-3 text-xs leading-5 text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Biometric export</dt>
                <dd>Employee Code, Date, and either Punch Records or In Time. Out Time, Status and Shift are optional.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">HRMS attendance sheet</dt>
                <dd>Employee Code, Date and Status are required. Check In, Check Out and Remarks are optional.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Dates</dt>
                <dd>YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY or an Excel date.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Good to know</dt>
                <dd>At most 20,000 rows. Days in a month locked for payroll are reported as problems and not saved.</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* ============ RESULT ============ */}
        {result && (
          <section aria-label="Import result" className="mt-3 glass-strong rounded-xl rise p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {result.status === "FAILED" ? "Nothing was imported" : `${result.format === "BIOMETRIC" ? "Biometric export" : "Attendance sheet"} imported`}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{result.fileName} · {result.totalRows} row(s) read</p>
              </div>
              <button type="button" onClick={clear} className={secondary}>Upload another</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="New days" value={result.createdCount} tone="green" />
              <Stat label="Updated" value={result.updatedCount} tone="green" />
              <Stat label="Unchanged" value={result.unchangedCount} />
              <Stat label="Skipped" value={result.skippedCount} tone={result.skippedCount ? "amber" : "slate"} />
              <Stat label="With problems" value={result.failedCount} tone={result.failedCount ? "red" : "slate"} />
            </div>

            {result.unmatchedCodes?.length > 0 && (
              <p role="status" className={`mt-3 rounded-lg border p-3 text-xs ${tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                Device codes not matched to anyone: {result.unmatchedCodes.join(", ")}.
              </p>
            )}

            {problems.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                {/* Phones: one card per problem row */}
                <ul className="divide-y divide-slate-100 md:hidden" aria-label="Rows that could not be imported">
                  {problems.map((row) => (
                    <li key={`${row.rowNumber}-${row.message}`} className="p-3.5">
                      <p className="text-[13px] font-semibold text-slate-800 tabular-nums">Row {row.rowNumber}</p>
                      <dl className="mt-2 grid gap-2">
                        <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Employee code</dt><dd className="mt-0.5 text-[13px] text-slate-700 [overflow-wrap:anywhere]">{row.employeeCode || "—"}</dd></div>
                        <div className="min-w-0"><dt className="text-[12px] font-medium text-slate-500">Problem</dt><dd className="mt-0.5 text-[13px] text-slate-700 [overflow-wrap:anywhere]">{row.message}</dd></div>
                      </dl>
                    </li>
                  ))}
                </ul>
                <table className="hidden w-full text-sm [overflow-wrap:anywhere] md:table">
                  <caption className="sr-only">Rows that could not be imported</caption>
                  <thead className="bg-[#edf1f4] border-b border-[var(--line)] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th scope="col" className="w-16 px-3 py-2.5 font-semibold">Row</th>
                      <th scope="col" className="w-44 px-3 py-2.5 font-semibold">Employee code</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((row) => (
                      <tr key={`${row.rowNumber}-${row.message}`} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2.5 align-top text-[13px] tabular-nums text-slate-700">{row.rowNumber}</td>
                        <td className="px-3 py-2.5 align-top text-[13px] text-slate-700">{row.employeeCode || "—"}</td>
                        <td className="px-3 py-2.5 align-top text-[13px] text-slate-700">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
