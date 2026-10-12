import { canManageAttendanceHolidays } from "./AttendanceHolidays";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import GridPattern from "../Components/MagicUI/GridPattern";
import BorderBeam from "../Components/MagicUI/BorderBeam";
import AnimatedGradientText from "../Components/MagicUI/AnimatedGradientText";

import AttendanceReport from "../Components/Pages/Attendance/AttendanceReport";

import {
  ApplyLeaveModal,
  ImportAttendanceModal,
  MissedPunchModal,
  RequestModal,
  WorkFromHomeModal,
} from "../Components/Pages/Attendance/AttendanceForms";

import {
  cn,
  focusRing,
  AttendanceSkeleton,
  StatusBanner,
} from "../Components/Pages/Attendance/AttendanceUI";

import {
  useAttendanceAccess,
  useAttendanceApprovals,
  useAttendanceReport,
  useAttendanceRequests,
} from "../Hooks/useAttendance";

import { ROLES } from "../Utils/roles";

import {
  ATTENDANCE_STATUS,
  formatRangeTitle,
  fromDateKey,
  getMonthRange,
  normalizeDate,
  shiftDateRangeByMonths,
  toDateKey,
} from "../Utils/attendance";
// Employee header and summary remain independent components in this file.
const MetaItem = ({ icon, label, value }) => (
  <div className="att-employee-meta flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 px-1 py-1 transition hover:border-[#D8E7F2] hover:bg-white hover:shadow-sm">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F6FA] text-[#2A5F98]">
      <i className={`${icon} text-xs`} />
    </span>

    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[.04em] text-slate-400">
        {label}
      </p>

      <p
        className="mt-0.5 truncate text-xs font-semibold text-slate-700"
        title={String(value ?? "")}
      >
        {value || "--"}
      </p>
    </div>
  </div>
);

const EmployeeSearch = ({
  refContainer,
  open,
  setOpen,
  focused,
  setFocused,
  results,
  employee,
  employeeIdInput,
  onEmployeeIdChange,
  canChangeEmployee,
  select,
}) => {
  const listboxId = "attendance-employee-search-results";

  const sameEmployee = (item) =>
    String(item?.empId ?? "").trim() === String(employee?.empId ?? "").trim();

  const getInitials = (name) =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getMetaText = (item) =>
    [item?.empId, item?.designation, item?.branch]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join(" · ");

  const handleKeyDown = (event) => {
    if (!canChangeEmployee) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setFocused((value) =>
        results.length ? Math.min(value + 1, results.length - 1) : -1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setFocused((value) =>
        results.length ? Math.max(value <= 0 ? 0 : value - 1, 0) : -1,
      );
    }

    if (event.key === "Enter" && focused >= 0 && results[focused]) {
      event.preventDefault();
      select(results[focused]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setFocused(-1);
    }
  };

  return (
    <div
      ref={refContainer}
      className="att-employee-search relative z-50 flex min-w-0 flex-col justify-center rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50/80 px-2.5 py-2 shadow-[0_8px_24px_rgba(15,23,42,.05)]"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <label
          htmlFor="attendance-employee-search"
          className="text-xs font-bold uppercase tracking-[.08em] text-slate-400"
        >
          Employee
        </label>

        {canChangeEmployee && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F6FA] px-2 py-0.5 text-xs font-bold text-[#2A5F98]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3A7DC0]" />
            Switch
          </span>
        )}
      </div>

      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl transition",
            open
              ? "bg-[#2A5F98] text-white shadow-[0_4px_12px_rgba(37,99,235,.22)]"
              : "bg-[#F0F6FA] text-[#3A7DC0]",
          )}
        >
          <i className="fa-solid fa-magnifying-glass text-xs" />
        </span>

        <input
          id="attendance-employee-search"
          value={employeeIdInput}
          disabled={!canChangeEmployee}
          autoComplete="off"
          placeholder="Search ID or name"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            focused >= 0 && results[focused]
              ? `attendance-employee-option-${results[focused].empId}`
              : undefined
          }
          onFocus={() => {
            if (canChangeEmployee) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            onEmployeeIdChange?.(event.target.value);
            setOpen(true);
            setFocused(-1);
          }}
          className={cn(
            "h-10 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-16 text-sm font-semibold text-slate-700 outline-none transition-all duration-200",
            "placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 focus:border-[#5AA3D0] focus:shadow-[0_0_0_3px_rgba(59,130,246,.08)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            focusRing,
          )}
        />

        {canChangeEmployee && employeeIdInput && (
          <button
            type="button"
            aria-label="Clear employee search"
            onClick={() => {
              onEmployeeIdChange?.("");
              setOpen(true);
              setFocused(-1);
            }}
            className={cn(
              "absolute right-10 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700",
              focusRing,
            )}
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}

        {canChangeEmployee && (
          <button
            type="button"
            aria-label={open ? "Close employee list" : "Open employee list"}
            onClick={() => {
              setOpen((value) => !value);
              setFocused(-1);
            }}
            className={cn(
              "absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-[#F0F6FA] hover:text-[#2A5F98]",
              focusRing,
            )}
          >
            <i
              className={cn(
                "fa-solid fa-chevron-down text-xs transition-transform duration-200",
                open && "rotate-180 text-[#2A5F98]",
              )}
            />
          </button>
        )}

        {canChangeEmployee && open && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Employees"
            className="
              absolute right-0 top-[calc(100%+10px)] z-[100]
              w-full
              overflow-hidden rounded-2xl
              border border-slate-200/80
              bg-white/95
              shadow-[0_24px_70px_rgba(15,23,42,.20)]
              backdrop-blur-xl

              sm:w-[360px]
              lg:w-[360px]
              lg:max-w-[calc(100vw-32px)]
              xl:w-[420px]
            "
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-3.5 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F6FA] text-[#2A5F98]">
                    <i className="fa-solid fa-users text-xs" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-800">
                      Select Employee
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Search by employee ID or name
                    </p>
                  </div>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center rounded-full border border-[#D8E7F2] bg-[#F0F6FA] px-2 py-1 text-xs font-extrabold text-[#2A5F98]">
                {results.length} {results.length === 1 ? "result" : "results"}
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto overscroll-contain p-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
              {results.length ? (
                <div className="space-y-1">
                  {results.map((item, index) => {
                    const selected = sameEmployee(item);
                    const keyboardFocused = focused === index;
                    const initials = getInitials(item.name);
                    const metaText = getMetaText(item);
                    const activeEmployee = item?.status === "Active";

                    return (
                      <button
                        id={`attendance-employee-option-${item.empId}`}
                        key={item.empId}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setFocused(index)}
                        onMouseLeave={() => setFocused(-1)}
                        onClick={() => select(item)}
                        className={cn(
                          "group flex min-h-[62px] w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all duration-200",
                          focusRing,
                          selected
                            ? "border-[#D8E7F2] bg-gradient-to-r from-[#F0F6FA] via-[#F0F6FA]/80 to-[#F0F6FA]/70 shadow-[0_4px_14px_rgba(37,99,235,.07)]"
                            : keyboardFocused
                              ? "border-slate-200 bg-slate-50"
                              : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50/80",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black transition",
                            selected
                              ? "bg-[#2A5F98] text-white shadow-[0_5px_14px_rgba(37,99,235,.20)]"
                              : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm",
                          )}
                        >
                          {initials || "NA"}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-extrabold text-slate-800">
                              {item.name || "Unnamed employee"}
                            </span>

                            {item?.status && (
                              <span
                                className={cn(
                                  "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-bold",
                                  activeEmployee
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1 w-1 rounded-full",
                                    activeEmployee
                                      ? "bg-emerald-500"
                                      : "bg-slate-400",
                                  )}
                                />
                                {item.status}
                              </span>
                            )}
                          </span>

                          <span
                            className="mt-1 block truncate text-xs font-medium text-slate-400"
                            title={metaText}
                          >
                            {metaText || "Employee details unavailable"}
                          </span>
                        </span>

                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                            selected
                              ? "border-[#2A5F98] bg-[#2A5F98] text-white shadow-[0_4px_10px_rgba(37,99,235,.20)]"
                              : "border-slate-200 bg-white text-transparent group-hover:text-slate-300",
                          )}
                          aria-hidden="true"
                        >
                          <i className="fa-solid fa-check text-xs" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <i className="fa-solid fa-user-slash text-xs" />
                  </span>

                  <p className="mt-2 text-xs font-bold text-slate-600">
                    No employee found
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Try another employee ID or name.
                  </p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <i className="fa-solid fa-arrow-up text-[6px]" />
                  <i className="fa-solid fa-arrow-down text-[6px]" />
                  Navigate
                </span>
                <span>Enter to select</span>
                <span>Esc to close</span>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-1 truncate text-[11px] leading-4 font-medium text-slate-400">
        {canChangeEmployee
          ? employee?.name
            ? `Viewing ${employee.name}`
            : "Search by employee ID or name"
          : "Employee report locked to your profile"}
      </p>
    </div>
  );
};

const EmployeeAttendanceHeader = ({
  employee,

  employees = [],

  employeeIdInput = "",

  onEmployeeIdChange,

  canChangeEmployee = false,

  children,
}) => {
  const searchRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);

  const [focused, setFocused] = useState(-1);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const results = useMemo(() => {
    const query = String(employeeIdInput || "")
      .trim()

      .toLowerCase();

    return employees

      .filter(
        (item) =>
          !query ||
          String(item.empId || "")
            .toLowerCase()

            .includes(query) ||
          String(item.name || "")
            .toLowerCase()

            .includes(query),
      )

      .slice(0, 8);
  }, [employees, employeeIdInput]);

  useEffect(() => {
    const close = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);

        setFocused(-1);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    setDetailsOpen(false);
  }, [employee?.empId]);

  if (!employee) {
    return null;
  }

  const initials = String(employee.name || "")
    .split(" ")

    .filter(Boolean)

    .map((part) => part[0])

    .join("")

    .slice(0, 2)

    .toUpperCase();

  const meta = [
    ["fa-regular fa-id-badge", "Employee ID", employee.empId],

    ["fa-solid fa-building-user", "Department", employee.department],

    ["fa-solid fa-briefcase", "Designation", employee.designation],

    ["fa-regular fa-clock", "Shift", employee.shift || "09:00 AM – 06:00 PM"],

    ["fa-solid fa-location-dot", "Location", employee.branch],

    ["fa-solid fa-user-tie", "Reporting Manager", employee.reportingManager],
  ];

  const selectEmployee = (item) => {
    onEmployeeIdChange?.(item.empId);

    setSearchOpen(false);

    setFocused(-1);
  };

  return (
    <section className="att-employee-header relative z-30 overflow-visible rounded-2xl border border-white bg-white/90 p-2 shadow-[0_12px_40px_rgba(15,23,42,.06)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <BorderBeam />
      </div>

      <div className="relative z-10 grid gap-2 lg:grid-cols-[200px_minmax(0,1fr)_220px] xl:grid-cols-[240px_minmax(0,1fr)_260px]">
        <div className="relative order-1 flex min-h-[60px] items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#081F34] via-[#133F66] to-[#2A5F98] px-3 py-2 text-white shadow-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5AA3D0] to-[#3A7DC0] lg:text-[13px] text-sm font-black ring-4 ring-white/10">
            {initials || "NA"}
          </div>

          <div className="min-w-0 flex-1 pr-20 lg:pr-0">
            <p className="truncate lg:text-[13px] text-sm font-extrabold">
              {employee.name}
            </p>

            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",

                  employee.status === "Active"
                    ? "bg-emerald-400"
                    : "bg-slate-400",
                )}
              />

              {employee.status || "Unknown"}
            </span>
          </div>

          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((value) => !value)}
            className={cn(
              "absolute right-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-xs font-semibold text-white transition hover:bg-white/20 lg:hidden",

              focusRing,
            )}
          >
            Details
            <i
              className={cn(
                "fa-solid fa-chevron-down text-xs transition-transform",

                detailsOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "order-3 grid-cols-1 gap-1.5 sm:grid-cols-2 lg:order-2 lg:grid lg:grid-cols-3",

            detailsOpen ? "grid" : "hidden",
          )}
        >
          {meta.map(([icon, label, value]) => (
            <MetaItem key={label} icon={icon} label={label} value={value} />
          ))}
        </div>

        <div className="order-2 flex min-w-0 flex-col gap-2 lg:order-3">
          <EmployeeSearch
            refContainer={searchRef}
            open={searchOpen}
            setOpen={setSearchOpen}
            focused={focused}
            setFocused={setFocused}
            results={results}
            employee={employee}
            employeeIdInput={employeeIdInput}
            onEmployeeIdChange={onEmployeeIdChange}
            canChangeEmployee={canChangeEmployee}
            select={selectEmployee}
          />

          {children && <div className="flex justify-end">{children}</div>}
        </div>
      </div>
    </section>
  );
};

const toolbarButtonClass =
  "att-toolbar-button relative inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#A4C8E1] bg-[#F0F6FA] text-xs font-semibold text-[#133F66] shadow-sm transition hover:bg-[#D8E7F2] active:scale-[.98] sm:w-auto sm:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const days = (value) => Number(Number(value || 0).toFixed(2));
// HOP retains the existing holiday-presence color when only legacy HP exists.
const SUMMARY_STATUS = {
  ...ATTENDANCE_STATUS,
  HOP: ATTENDANCE_STATUS.HOP || {
    ...(ATTENDANCE_STATUS.HP || {
      cellClass: "border-green-200 bg-green-50 text-green-700",
    }),
    label: "Present On Holiday",
    shortLabel: "HOP",
  },
};
const legendText = (code) =>
  SUMMARY_STATUS[code].cellClass
    .split(" ")
    .find((value) => value.startsWith("text-"));

function AttendanceSummary({ employee, periodLabel, summary = {} }) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const leave = days(summary.leave);
  const unapproved = days(summary.unapprovedLeave);
  const rate = summary.attendancePercentage ?? 0;
  const groups = [
    {
      title: "Discipline",
      rows: [
        ["Late Entry", summary.lateIn, summary.lateInPayable, "LC"],
        [
          "Early Leaving",
          summary.earlyLeaving ?? summary.lessThanDuration,
          summary.earlyLeavingPayable ?? summary.lessThanDurationPayable,
          "EL",
        ],
      ],
    },
    {
      title: "Present",
      rows: [
        ["Present", summary.present, summary.presentPayable, "P"],
        ["Half Day", summary.halfDay, summary.halfDayPayable, "HD"],
        [
          "Present On Week Off",
          summary.presentWeekoff,
          summary.presentWeekoffPayable,
          "WOP",
        ],
        [
          "Present On Holiday",
          summary.presentOnHoliday,
          summary.presentOnHolidayPayable,
          "HOP",
        ],
        ["Work From Home", summary.wfh, summary.wfhPayable, "WFH"],
      ],
    },
    {
      title: "Off Days",
      rows: [
        ["Holiday", summary.holiday, summary.holidayPayable, "H"],
        ["Week Off", summary.weekoff, summary.weekoffPayable, "WO"],
      ],
    },
    {
      title: "Leave",
      rows: [
        ["Approved Leave", leave, summary.leavePayable, "AL"],
        ["Unapproved Leave", unapproved, summary.unapprovedLeavePayable, "UL"],
      ],
    },
  ];
  return (
    <aside className="att-summary relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,.06)]">
      <BorderBeam />
      <header className="att-summary-header bg-gradient-to-br from-[#081F34] via-[#133F66] to-[#2A5F98] px-3 py-2.5 lg:py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[13px] font-bold leading-tight sm:text-[15px]">
              <AnimatedGradientText
                colorFrom="#ffffff"
                colorTo="#A4C8E1"
                speed={10}
              >
                Attendance Summary
              </AnimatedGradientText>
            </h2>
            <p className="mt-0.5 truncate text-xs font-medium text-blue-100/80">
              {employee?.name} · {periodLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <strong
              className="att-attendance-rate rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-sm text-[#7FBBD8]"
              aria-label={`Attendance ${rate}%`}
              title="Present and WFH count as 1 attendance day; Half Day counts as 0.5. Approved leave, holidays and week offs are excluded. This is separate from payroll."
            >
              {rate}%
            </strong>
            <button
              type="button"
              className="att-summary-toggle inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 lg:hidden"
              aria-label={`${expanded ? "Collapse" : "Expand"} attendance summary`}
              aria-expanded={expanded}
              aria-controls={bodyId}
              onClick={() => setExpanded((value) => !value)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path
                  d="m6 9 6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Total attendance"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rate}
          className="att-total-progress mt-2 h-1.5 overflow-hidden rounded-full bg-white/15 lg:mt-1.5"
        >
          <div
            className="att-progress-fill h-full rounded-full bg-gradient-to-r from-[#7FBBD8] via-[#5AA3D0] to-[#A4C8E1] transition-[width] duration-500"
            style={{ width: `${rate}%` }}
          />
        </div>
      </header>
      <div
        id={bodyId}
        className="att-summary-body max-lg:data-[expanded=false]:hidden"
        data-expanded={expanded}
      >
        <div className="att-summary-totals grid grid-cols-4 gap-1.5 border-b border-slate-100 p-2.5 text-center lg:gap-1 lg:p-2">
          {[
            ["Present", summary.present, "P"],
            ["Half Day", summary.halfDay, "HD"],
            ["Approved Leave", leave, "AL"],
            ["Unapproved Leave", unapproved, "UL"],
          ].map(([label, value, code]) => (
            <div
              key={label}
              className={`rounded-lg border px-1 py-1.5 lg:py-1 ${SUMMARY_STATUS[code].cellClass}`}
              title={`${label}: ${days(value)} days`}
            >
              <p className="flex min-h-7 items-center justify-center text-[10px] leading-3.5 text-slate-500 lg:min-h-6">
                {label}
              </p>
              <p className={`text-base font-bold ${legendText(code)}`}>
                {days(value)}
              </p>
            </div>
          ))}
        </div>
        <div className="att-summary-groups space-y-3 px-3 py-2.5 lg:space-y-2 lg:py-2">
          {groups.map((group) => (
            <section key={group.title} className="att-summary-group">
              <div className="att-summary-heading grid grid-cols-[minmax(0,1fr)_36px_36px] items-center gap-x-2 border-b border-slate-200/80 pb-1.5 text-[10px] font-bold uppercase tracking-[.06em] text-slate-500 sm:text-[11px] lg:pb-1">
                <h3>{group.title}</h3>
                <span className="text-right">Days</span>
                <span className="text-right">Pay</span>
              </div>
              {group.rows.map(([label, value, pay, code]) => (
                <div
                  key={label}
                  className="att-summary-row grid min-h-9 grid-cols-[minmax(0,1fr)_36px_36px] items-center gap-x-2 border-b border-slate-100 py-1.5 text-xs leading-4 text-slate-700 transition-colors hover:bg-slate-50 lg:min-h-8 lg:py-1"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      title={label}
                      className={`inline-flex h-5 w-11 shrink-0 items-center justify-center rounded-full text-[10px] font-medium leading-none ${SUMMARY_STATUS[code].markerClass ? "" : `border ${SUMMARY_STATUS[code].cellClass}`}`}
                    >
                      {SUMMARY_STATUS[code].markerClass ? (
                        <span
                          className={`h-2.5 w-7 rounded-full ${SUMMARY_STATUS[code].markerClass}`}
                        />
                      ) : (
                        SUMMARY_STATUS[code].shortLabel
                      )}
                    </span>
                    <span className="min-w-0">{label}</span>
                  </div>
                  <span
                    className={`text-right font-semibold tabular-nums sm:text-sm ${days(value) === 0 ? "text-slate-400" : legendText(code)}`}
                  >
                    {days(value)}
                  </span>
                  <span className="text-right font-medium tabular-nums text-slate-800 sm:text-sm">
                    {days(pay)}
                  </span>
                </div>
              ))}
            </section>
          ))}
        </div>
        <footer
          title="Leave is unpaid. Discipline and leave rows overlap categories and are not added twice."
          className="att-payroll relative overflow-hidden m-2.5 rounded-xl border border-[#2A5F98] bg-gradient-to-r from-[#081F34] via-[#133F66] to-[#2A5F98] px-3 py-2 text-white lg:m-2 lg:py-1.5"
        >
          <BorderBeam />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Total Payable</span>
            <strong className="text-xl text-[#7FBBD8]">
              {days(summary.totalPayable)}
            </strong>
          </div>
        </footer>
      </div>
    </aside>
  );
}

const Attendance = () => {
  const navigate = useNavigate();

  // ============================================================
  // ACCESS
  // ============================================================

  const attendanceAccess = useAttendanceAccess();
  const {
    user,
    allEmployees,
    accessibleEmployees,
    canSwitchEmployee,
    serverToday,
    demo: isDemo,
    monthControls = {},
    notice: demoNotice,
    isLoading: accessLoading,
    error: accessError,
  } = attendanceAccess;
  const canManageHolidays = canManageAttendanceHolidays(attendanceAccess);

  const defaultEmployee = useMemo(
    () =>
      accessibleEmployees.find(
        (employee) => String(employee.empId) === String(user?.empId),
      ) ||
      accessibleEmployees[0] ||
      null,
    [accessibleEmployees, user?.empId],
  );

  // ============================================================
  // LOCAL UI STATE
  // ============================================================

  const [employeeId, setEmployeeId] = useState("");
  const [search, setSearch] = useState("");

  const [range, setRange] = useState(() => getMonthRange(new Date()));

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const [importOpen, setImportOpen] = useState(false);
  const openHolidayManagement = () => {
    setImportOpen(false);
    navigate("/attendance/holidays");
  };
  const canImportAttendance = user?.role === ROLES.SUPER_ADMIN;
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [wfhOpen, setWfhOpen] = useState(false);
  const [punchOpen, setPunchOpen] = useState(false);
  const [punchType, setPunchType] = useState(null);
  const [lockDialogMonth, setLockDialogMonth] = useState("");
  const [lockError, setLockError] = useState("");
  const [initializedViewer, setInitializedViewer] = useState(null);
  // Demo fixtures have a fixed date; use the device date for calendar navigation.
  // With a backend, prefer its authoritative current date.
  const todayKey = (!isDemo && serverToday) || toDateKey(new Date());
  useEffect(() => {
    if (
      accessLoading ||
      accessError ||
      !user?.empId ||
      initializedViewer === user.empId
    )
      return;
    const today = fromDateKey(todayKey);
    if (!today) return;
    setRange(getMonthRange(today));
    setSelectedDate(todayKey);
    setInitializedViewer(user.empId);
  }, [accessLoading, accessError, todayKey, initializedViewer, user?.empId]);

  // ============================================================
  // KEEP SELECTED EMPLOYEE INSIDE ACCESS SCOPE
  // ============================================================

  useEffect(() => {
    if (!defaultEmployee) {
      setEmployeeId("");
      setSearch("");
      return;
    }

    const stillAllowed = accessibleEmployees.some(
      (employee) => String(employee.empId) === String(employeeId),
    );

    if (!employeeId || !stillAllowed) {
      setEmployeeId(defaultEmployee.empId);
      setSearch(defaultEmployee.empId);
    }
  }, [accessibleEmployees, defaultEmployee, employeeId]);

  const employee = useMemo(
    () =>
      accessibleEmployees.find(
        (item) => String(item.empId) === String(employeeId),
      ) ||
      defaultEmployee ||
      null,
    [accessibleEmployees, employeeId, defaultEmployee],
  );

  // ============================================================
  // ATTENDANCE DATA
  // ============================================================

  const {
    records,
    summary,
    isAuthorized,
    isLoading,
    isFetching,
    isError,
    error,
    actionsAllowed: showSelfActions,
    notice: reportNotice,
  } = useAttendanceReport({
    viewer: user,
    employees: allEmployees,
    employeeId: employee?.empId,
    startDate: range.start,
    endDate: range.end,
  });

  // ============================================================
  // REQUESTS
  // ============================================================

  const {
    submitLeave,
    submitWFH,
    submitMissedPunch,
    submitPunch,
    pendingRequestCount,
    setMonthLocked,
    importAttendance,
    isSubmitting,
  } = useAttendanceRequests();
  const { pendingApprovalCount, canAccessApprovals } = useAttendanceApprovals();

  // ============================================================
  // KEEP SELECTED DATE INSIDE CURRENT RANGE
  // ============================================================

  useEffect(() => {
    if (!selectedDate) return;

    const selected = fromDateKey(selectedDate);

    if (!selected) {
      setSelectedDate(toDateKey(range.start));
      return;
    }

    if (selected >= range.start && selected <= range.end) {
      return;
    }

    const today = fromDateKey(todayKey);

    setSelectedDate(
      toDateKey(
        today && today >= range.start && today <= range.end
          ? today
          : range.start,
      ),
    );
  }, [range, selectedDate, todayKey]);

  // ============================================================
  // EMPLOYEE SEARCH
  // ============================================================

  const handleEmployeeSearch = (value) => {
    setSearch(value);

    const match = accessibleEmployees.find(
      (item) => String(item.empId) === String(value).trim(),
    );

    if (match) {
      setEmployeeId(match.empId);
    }
  };

  // ============================================================
  // DATE RANGE
  // ============================================================

  const handleRangeChange = (nextRange) => {
    if (!nextRange?.start || !nextRange?.end) {
      return;
    }

    const start = normalizeDate(nextRange.start);
    const end = normalizeDate(nextRange.end);

    if (!start || !end) {
      return;
    }

    setRange({
      start,
      end,
    });
  };

  const handlePeriodShift = (direction) => {
    setRange((current) =>
      shiftDateRangeByMonths(current.start, current.end, direction),
    );
  };

  const handleResetRange = () => {
    const today = fromDateKey(todayKey);
    if (!today) return;
    setRange(getMonthRange(today));
    setSelectedDate(todayKey);
  };

  // ============================================================
  // DETAILED VIEW ACTIONS
  // ============================================================

  const handleRecordAction = (action, payload) => {
    if (!showSelfActions) {
      return;
    }

    const date = payload?.date ? toDateKey(payload.date) : selectedDate;

    if (date) {
      setSelectedDate(date);
    }

    if (action === "applyLeave") {
      setLeaveOpen(true);
      return;
    }

    if (action === "workFromHome") {
      setWfhOpen(true);
      return;
    }

    if (action === "webPunch") {
      setPunchType(payload?.punchType);
      setPunchOpen(true);
      return;
    }

    if (action === "missedPunch") {
      setPunchType(null);
      setPunchOpen(true);
    }
  };

  // ============================================================
  // DERIVED DATA
  // ============================================================

  const periodLabel = formatRangeTitle(range.start, range.end);
  const selectedMonth = selectedDate.slice(0, 7);
  const isSelectedMonthLocked = monthControls[selectedMonth]?.locked === true;
  const isDialogMonthLocked = monthControls[lockDialogMonth]?.locked === true;

  // ============================================================
  // EMPTY ACCESS
  // ============================================================

  if (accessLoading)
    return (
      <div className="attendance-ui p-3">
        <AttendanceSkeleton />
      </div>
    );
  if (accessError)
    return (
      <div className="attendance-ui p-3">
        <StatusBanner type="error">{accessError.message}</StatusBanner>
      </div>
    );

  if (!accessibleEmployees.length) {
    return (
      <div className="attendance-ui min-h-full bg-[#f5f7fb] p-4">
        <StatusBanner type="warning">
          <i className="fa-solid fa-user-lock mr-2" />
          No employees are currently available within your attendance access
          scope.
        </StatusBanner>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="attendance-ui min-h-full bg-[#f5f7fb] p-8 text-center text-sm text-slate-500">
        Employee information is unavailable.
      </div>
    );
  }

  return (
    <div className="attendance-ui att-workspace relative min-h-full bg-[radial-gradient(ellipse_at_top_left,#A4C8E133,transparent_45%),radial-gradient(ellipse_at_bottom_right,#7FBBD826,transparent_55%)] bg-[var(--att-bg)] px-2.5 pb-3 pt-2 sm:px-3">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <GridPattern className="opacity-10 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>
      <main className="att-main relative z-10 mx-auto w-full max-w-[1360px]">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <header className="att-page-header mb-2">
          <div className="flex flex-col gap-3">
            {/* LEFT */}
            <div className="min-w-0">
              <h1 className="flex items-center gap-2.5 text-[22px] font-bold tracking-[-.035em] text-slate-900 sm:text-[24px]">
                <span
                  aria-hidden="true"
                  className="h-6 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#1B4A7B] to-[#2A5F98]"
                />
                Attendance Report
              </h1>

              <p className="mt-0.5 max-w-xl text-xs leading-4 text-slate-500">
                Attendance, punches, payable days and employee activity in one
                workspace.
              </p>
            </div>

            {/* ==================================================
                ACTIONS BELOW THE PAGE HEADING

                Mobile: icon-only buttons with compact badges.
                sm+: labels and inline counts are restored.
            ================================================== */}

            <div className="flex w-full flex-wrap items-center justify-start gap-2 pb-1">
              {canManageHolidays && (
                <button
                  type="button"
                  onClick={openHolidayManagement}
                  title="Manage Holidays"
                  aria-label="Manage Holidays"
                  className={toolbarButtonClass}
                >
                  <i aria-hidden="true" className="fa-regular fa-calendar" />
                  <span className="hidden sm:inline">Manage Holidays</span>
                </button>
              )}
              {canImportAttendance && (
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  aria-label="Import Attendance"
                  title="Import Attendance"
                  className={toolbarButtonClass}
                >
                  <i aria-hidden="true" className="fa-solid fa-file-import" />
                  <span className="hidden sm:inline">Import Attendance</span>
                </button>
              )}
              {monthControls[selectedMonth]?.visible && (
                <button
                  type="button"
                  disabled={!monthControls[selectedMonth]?.canChange}
                  onClick={() => {
                    setLockError("");
                    setLockDialogMonth(selectedMonth);
                  }}
                  className={toolbarButtonClass}
                  aria-label={`${isSelectedMonthLocked ? "Reopen" : "Lock"} attendance month ${selectedMonth}`}
                >
                  <i
                    className={`fa-solid fa-${isSelectedMonthLocked ? "lock" : "lock-open"}`}
                  />
                  <span className="hidden sm:inline">
                    {selectedMonth} ·{" "}
                    {isSelectedMonthLocked ? "Locked" : "Open"}
                  </span>
                </button>
              )}
              {/* FETCH STATUS */}

              {isFetching && (
                <span
                  aria-label="Updating attendance"
                  title="Updating attendance"
                  className={toolbarButtonClass}
                >
                  <i className="fa-solid fa-spinner animate-spin text-xs" />
                  <span className="hidden text-xs font-semibold sm:inline">
                    Updating
                  </span>
                </span>
              )}

              {/* MY REQUESTS */}

              <button
                type="button"
                onClick={() => navigate("/attendance/requests")}
                aria-label="My Requests"
                title="My Requests"
                className={toolbarButtonClass}
              >
                <i className="fa-regular fa-file-lines shrink-0 text-xs" />

                <span className="hidden truncate text-xs font-semibold sm:inline">
                  My Requests
                </span>

                {pendingRequestCount > 0 && (
                  <>
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2A5F98] px-1 text-xs font-extrabold leading-none text-white shadow-sm sm:hidden">
                      {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
                    </span>

                    <span className="hidden min-w-[18px] items-center justify-center rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-extrabold text-slate-500 sm:inline-flex">
                      {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
                    </span>
                  </>
                )}
              </button>

              {/* APPROVALS */}

              {canAccessApprovals && (
                <button
                  type="button"
                  onClick={() => navigate("/attendance/applications")}
                  aria-label={`Applications${pendingApprovalCount > 0 ? `, ${pendingApprovalCount} awaiting your approval` : ""}`}
                  title="Applications"
                  className={`att-toolbar-button relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition active:scale-[.98] sm:w-auto sm:gap-2 sm:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] focus-visible:ring-offset-2 ${
                    pendingApprovalCount > 0
                      ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-slate-200 bg-white text-[#1B4A7B] hover:border-[#A4C8E1] hover:bg-[#F0F6FA]"
                  }`}
                >
                  <i
                    aria-hidden="true"
                    className="fa-regular fa-file-lines shrink-0 text-xs"
                  />
                  <span className="hidden text-xs font-semibold sm:inline">
                    Applications
                  </span>
                  {pendingApprovalCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold leading-none text-white sm:static"
                    >
                      {pendingApprovalCount > 99 ? "99+" : pendingApprovalCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        {demoNotice && (
          <p role="status" className="mb-2 text-xs text-amber-800">
            {demoNotice}
          </p>
        )}
        {reportNotice && (
          <p role="status" className="mb-2 text-xs text-slate-500">
            {reportNotice}
          </p>
        )}
        {isLoading ? (
          <AttendanceSkeleton />
        ) : (
          <>
            {/* ==================================================
                EMPLOYEE INFORMATION

                No action buttons here anymore.
            ================================================== */}

            <EmployeeAttendanceHeader
              employee={employee}
              employees={accessibleEmployees}
              employeeIdInput={search}
              onEmployeeIdChange={handleEmployeeSearch}
              canChangeEmployee={canSwitchEmployee}
            />

            {!canSwitchEmployee && !showSelfActions && (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <i className="fa-solid fa-lock text-xs" />
                Attendance access is restricted to your authorized employee
                scope.
              </div>
            )}

            {/* ==================================================
                AUTHORIZATION
            ================================================== */}

            {!isAuthorized && (
              <div className="mt-4">
                <StatusBanner type="error">
                  <i className="fa-solid fa-shield-halved mr-2" />
                  You do not have permission to view this employee&apos;s
                  attendance.
                </StatusBanner>
              </div>
            )}

            {isAuthorized && (
              <>
                {/* ==============================================
                    ERROR
                ============================================== */}

                {isError && (
                  <div className="mt-4">
                    <StatusBanner type="error">
                      <i className="fa-solid fa-triangle-exclamation mr-2" />

                      {error?.message ||
                        "Unable to load attendance information."}
                    </StatusBanner>
                  </div>
                )}

                {/* ==============================================
                    EMPTY
                ============================================== */}

                {!isError && !records.length && (
                  <div className="mt-4">
                    <StatusBanner type="info">
                      <i className="fa-regular fa-calendar-xmark mr-2" />
                      No attendance records were found for this employee and
                      date range.
                    </StatusBanner>
                  </div>
                )}

                {/* ==============================================
                    REPORT
                ============================================== */}

                <section className="att-content mt-2 grid items-start gap-2.5 lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)]">
                  {/* ATTENDANCE SUMMARY */}
                  <div className="att-summary-column order-1 min-w-0">
                    <AttendanceSummary
                      employee={employee}
                      periodLabel={periodLabel}
                      summary={summary}
                    />
                  </div>

                  {/* ATTENDANCE CALENDAR */}

                  <div className="att-report-column order-2 min-w-0">
                    <AttendanceReport
                      todayKey={todayKey}
                      employee={employee}
                      periodLabel={periodLabel}
                      periodStart={range.start}
                      periodEnd={range.end}
                      records={records}
                      selectedDate={selectedDate}
                      onSelectedDateChange={setSelectedDate}
                      onRangeChange={handleRangeChange}
                      onResetRange={handleResetRange}
                      onPreviousPeriod={() => handlePeriodShift(-1)}
                      onNextPeriod={() => handlePeriodShift(1)}
                      onRecordAction={handleRecordAction}
                      actionsAllowed={showSelfActions}
                    />
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* ======================================================
          ATTENDANCE REQUEST MODALS
      ====================================================== */}

      <ApplyLeaveModal
        isSubmitting={isSubmitting}
        open={leaveOpen}
        initialDate={selectedDate}
        onClose={() => setLeaveOpen(false)}
        onSubmit={submitLeave}
      />

      <WorkFromHomeModal
        isSubmitting={isSubmitting}
        open={wfhOpen}
        initialDate={selectedDate}
        onClose={() => setWfhOpen(false)}
        onSubmit={submitWFH}
      />

      {canImportAttendance && importOpen && (
        <ImportAttendanceModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSubmit={importAttendance}
          isSubmitting={isSubmitting}
        />
      )}

      <MissedPunchModal
        isSubmitting={isSubmitting}
        open={punchOpen}
        initialDate={selectedDate}
        initialPunchType={punchType}
        onClose={() => setPunchOpen(false)}
        onSubmit={submitMissedPunch}
        onPunch={submitPunch}
      />
      <RequestModal
        open={Boolean(lockDialogMonth)}
        title={`${isDialogMonthLocked ? "Reopen" : "Lock"} attendance month`}
        subtitle="Super Admin · payroll month control"
        icon="fa-solid fa-lock"
        onClose={() => setLockDialogMonth("")}
      >
        <div className="space-y-4 p-5 text-sm text-[#133F66]">
          <p>
            {isDialogMonthLocked
              ? `Reopen ${lockDialogMonth} only if payroll permits corrections. Missed-punch applications and approvals will become available again.`
              : `Confirm payroll is closed for ${lockDialogMonth}. Locking stops new missed-punch applications and approval of pending corrections for this month.`}
          </p>
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
            Month-lock changes require backend confirmation. Demo previews do
            not change payroll or save locks.
          </p>
          {lockError && (
            <p role="alert" className="text-xs text-rose-700">
              {lockError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLockDialogMonth("")}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                const result = await setMonthLocked({
                  month: lockDialogMonth,
                  locked: !isDialogMonthLocked,
                });
                if (!result.ok) {
                  setLockError(result.message);
                  return;
                }
                setLockDialogMonth("");
              }}
              className="rounded-lg bg-gradient-to-r from-[#133F66] to-[#2A5F98] px-4 py-2 font-semibold text-white"
            >
              {isDialogMonthLocked ? "Confirm reopen" : "Confirm lock"}
            </button>
          </div>
        </div>
      </RequestModal>
    </div>
  );
};

export default Attendance;
