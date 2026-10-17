import React, { useEffect, useMemo, useRef, useState } from "react";

import AnimatedGradientText from "../../MagicUI/AnimatedGradientText";
import BorderBeam from "../../MagicUI/BorderBeam";

import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { IconButton, cn, focusRing } from "./AttendanceUI";

import {
  addDays,
  getMonthRange,
  normalizeDate,
  ATTENDANCE_STATUS,
  LEGEND_ITEMS,
  formatDayLabel,
  formatMinutes,
  formatPeriodRange,
  formatWeekdayShort,
  getDatesBetween,
  toDateKey,
  matchesSummaryCode,
} from "../../../Utils/attendance";

import Icon from "../../Common/Icon";
// Date range picker: local component, sharing the report presentation helpers.
const PICKER_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const sameDay = (a, b) => a && b && toDateKey(a) === toDateKey(b);

const isBetween = (date, start, end) =>
  start &&
  end &&
  normalizeDate(date) > normalizeDate(start) &&
  normalizeDate(date) < normalizeDate(end);

const getCalendarDays = (month) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);

  return [
    ...Array(first.getDay()).fill(null),
    ...Array.from(
      { length: last.getDate() },
      (_, index) => new Date(year, monthIndex, index + 1),
    ),
  ];
};

const CalendarMonth = ({ month, start, end, onSelect }) => {
  const days = useMemo(() => getCalendarDays(month), [month]);

  const title = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <div className="min-w-0">
      <h4 className="mb-3 text-center text-sm font-bold text-slate-800">
        {title}
      </h4>

      <div className="grid grid-cols-7 gap-1">
        {PICKER_WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-1.5 text-center text-xs font-semibold text-slate-400"
          >
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          if (!date) {
            return <div key={`blank-${index}`} className="h-10" />;
          }

          const selected = sameDay(date, start) || sameDay(date, end);

          const inside = isBetween(date, start, end);
          const today = sameDay(date, new Date());

          return (
            <button
              key={toDateKey(date)}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "relative flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition duration-200",
                focusRing,
                selected
                  ? "bg-gradient-to-br from-[#2b6485] to-[#2b6485] text-white shadow-md shadow-[#2b6485]/20"
                  : inside
                    ? "bg-[#f2f5f7] text-[#1f4e6b]"
                    : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {date.getDate()}

              {today && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#2b6485]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AttendanceDateRangePicker = ({ startDate, endDate, onApply }) => {
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  const [month, setMonth] = useState(
    new Date(startDate.getFullYear(), startDate.getMonth(), 1),
  );

  const secondMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const openPicker = () => {
    setStart(startDate);
    setEnd(endDate);

    setMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));

    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previousFocus = document.activeElement;
    const focusable = () => [
      ...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialogRef.current.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === items[0] ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0].focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
      (previousFocus?.isConnected
        ? previousFocus
        : triggerRef.current
      )?.focus();
    };
  }, [open]);

  const selectDate = (date) => {
    const selected = normalizeDate(date);

    if (!start || end) {
      setStart(selected);
      setEnd(null);
      return;
    }

    if (selected < start) {
      setStart(selected);
      setEnd(null);
      return;
    }

    setEnd(selected);
  };

  const setQuickRange = (type) => {
    const today = normalizeDate(new Date());

    const ranges = {
      thisMonth: () => getMonthRange(today),

      lastMonth: () =>
        getMonthRange(new Date(today.getFullYear(), today.getMonth() - 1, 1)),

      last7: () => ({
        start: addDays(today, -6),
        end: today,
      }),

      last30: () => ({
        start: addDays(today, -29),
        end: today,
      }),
    };

    const range = ranges[type]?.();
    if (!range) return;

    setStart(range.start);
    setEnd(range.end);

    setMonth(new Date(range.start.getFullYear(), range.start.getMonth(), 1));
  };

  const apply = () => {
    if (!start || !end) return;

    onApply({
      start: normalizeDate(start),
      end: normalizeDate(end),
    });

    setOpen(false);
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
  };

  const modal =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Select attendance date range"
        className="fixed inset-0 z-[99999] grid place-items-center bg-slate-950/45 p-3 backdrop-blur-[4px] sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div className="relative flex max-h-[92dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_35px_120px_rgba(8,26,46,.4)]">
          <BorderBeam />

          <header className="relative shrink-0 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f5f7] px-2.5 py-1 text-xs font-bold uppercase tracking-[.08em] text-[#2b6485]">
                  <Icon className="fa-regular fa-calendar text-xs" />
                  Attendance Filter
                </span>

                <h3 className="mt-2 text-lg font-extrabold tracking-tight text-slate-900">
                  Select date range
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select a start and end date for this report.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close date picker"
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200",
                  focusRing,
                )}
              >
                <Icon className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
              {[
                ["From", start],
                ["To", end],
              ].map(([label, value], index) => (
                <React.Fragment key={label}>
                  {index === 1 && (
                    <Icon className="fa-solid fa-arrow-right text-xs text-slate-300" />
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[.08em] text-slate-400">
                      {label}
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                      {value ? formatDayLabel(value) : "Select date"}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3 sm:px-5">
              {[
                ["thisMonth", "This Month"],
                ["lastMonth", "Last Month"],
                ["last7", "Last 7 Days"],
                ["last30", "Last 30 Days"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuickRange(value)}
                  className={cn(
                    "shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition",
                    "hover:border-[#cfdce5] hover:bg-[#f2f5f7] hover:text-[#2b6485]",
                    focusRing,
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-[#f2f5f7] hover:text-[#2b6485]",
                  focusRing,
                )}
              >
                <Icon className="fa-solid fa-chevron-left text-xs" />
              </button>

              <span className="text-center text-xs font-semibold uppercase tracking-[.08em] text-slate-400">
                Select start date, then end date
              </span>

              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-[#f2f5f7] hover:text-[#2b6485]",
                  focusRing,
                )}
              >
                <Icon className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 px-4 pb-5 pt-3 sm:px-5 md:grid-cols-2">
              <CalendarMonth
                month={month}
                start={start}
                end={end}
                onSelect={selectDate}
              />

              <div className="hidden md:block">
                <CalendarMonth
                  month={secondMonth}
                  start={start}
                  end={end}
                  onSelect={selectDate}
                />
              </div>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[.08em] text-slate-400">
                  Selected Range
                </p>

                <p className="mt-0.5 truncate text-xs font-semibold text-slate-600">
                  {start && end
                    ? formatPeriodRange(start, end)
                    : "Select both dates"}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className={cn(
                    "rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100",
                    focusRing,
                  )}
                >
                  <Icon className="fa-solid fa-eraser mr-1.5 text-xs" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50",
                    focusRing,
                  )}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!start || !end}
                  onClick={apply}
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-[#2b6485] to-[#2b6485] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#2b6485]/20 transition",
                    "hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40",
                    focusRing,
                  )}
                >
                  <Icon className="fa-solid fa-check mr-1.5 text-xs" />
                  Apply
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        aria-label="Change date range"
        title="Date Range"
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 pointer-coarse:h-10 pointer-coarse:w-10 xl:w-auto xl:gap-1.5 xl:px-2.5",
          focusRing,
        )}
      >
        <Icon className="fa-regular fa-calendar text-xs text-[#cfdce5]" />

        <span className="hidden text-xs font-semibold xl:inline">
          Date Range
        </span>
      </button>

      {modal}
    </>
  );
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const StatusBadge = ({ code }) => {
  if (!code) {
    return (
      <span className="text-xs font-medium text-slate-400">No record</span>
    );
  }

  const status = ATTENDANCE_STATUS[code];

  if (!status) {
    return <span className="text-xs font-medium text-slate-500">{code}</span>;
  }

  return (
    <span
      title={status.label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",

        status.cellClass,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status.dotClass)} />

      {status.shortLabel}
    </span>
  );
};

const CalendarView = ({
  dates,

  recordMap,

  selectedDate,

  onSelect,

  todayKey,

  highlight = null,

  // Page the clock / tick on a tile opens: My Requests for yourself, Applications for others
  requestsPath = "/attendance/requests",
}) => {
  const leadingBlanks = dates[0]?.getDay() || 0;

  return (
    <div className="att-calendar px-2 py-2 sm:px-3 lg:py-1.5">
      <div className="att-calendar-inner mx-auto w-full max-w-[880px] px-2 sm:px-5 lg:max-w-[820px] lg:px-3">
        {/* WEEKDAYS */}

        <div className="mb-2 grid grid-cols-7 gap-x-2 sm:gap-x-4 lg:mb-1 lg:gap-x-3">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-xs font-bold uppercase tracking-[.04em] text-slate-400 sm:text-xs"
            >
              <span className="sm:hidden">{day[0]}</span>

              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        {/* CALENDAR */}

        <div className="att-calendar-grid grid auto-rows-[64px] grid-cols-7 content-start gap-x-2 gap-y-2 sm:auto-rows-[68px] sm:gap-x-4 sm:gap-y-3 lg:auto-rows-[58px] lg:gap-x-3 lg:gap-y-2">
          {Array.from(
            {
              length: leadingBlanks,
            },

            (_, index) => (
              <div key={`blank-${index}`} aria-hidden="true" />
            ),
          )}

          {dates.map((date) => {
            const key = toDateKey(date);

            const record = recordMap.get(key);

            const displayStatusCode =
              record?.displayStatusCode ?? record?.statusCode ?? null;

            const status = displayStatusCode
              ? ATTENDANCE_STATUS[displayStatusCode]
              : null;

            const isLate =
              record?.isLate === true ||
              record?.lateMinutes > 0 ||
              displayStatusCode === "LC";
            const isEarlyLeaving = record?.isEarlyLeaving === true;
            const tileStatus =
              displayStatusCode === "LC" ? ATTENDANCE_STATUS.P : status;
            // The backend supplies the active application's status for this date.
            const applicationStatus = String(
              record?.application || "",
            ).toUpperCase();
            const hasApplicationIndicator =
              applicationStatus === "PENDING" ||
              applicationStatus === "APPROVED";

            const selected = key === selectedDate;

            const today = key === todayKey;

            // A summary row picked on the left: show its days, fade the rest
            const matched = Boolean(highlight) && matchesSummaryCode(highlight, record);
            const faded = Boolean(highlight) && !matched;

            // The clock / tick opens the request behind it on its requests page
            const requestHref = record?.applicationId
              ? `${requestsPath}?request=${encodeURIComponent(record.applicationId)}`
              : `${requestsPath}?date=${key}`;

            return (
              <div key={key} className="relative h-full min-w-0">
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-pressed={selected}
                aria-label={`${formatDayLabel(date)}${
                  status ? `, ${status.label}` : ", no attendance record"
                }${isLate ? ", late coming" : ""}${isEarlyLeaving ? ", early leaving" : ""}${hasApplicationIndicator ? `, application ${applicationStatus.toLowerCase()}` : ""}`}
                className={cn(
                  `att-calendar-cell relative flex h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-1 text-left transition duration-200 @min-[480px]:p-2 `,
                  focusRing,
                  tileStatus
                    ? tileStatus.cellClass
                    : "border-slate-200/70 bg-white text-slate-600",
                  !selected && "hover:-translate-y-0.5 hover:shadow-sm",
                  faded && !selected && "opacity-25 saturate-0",
                  matched && !selected && "ring-2 ring-[#1f4e6b]/40 shadow-[0_6px_18px_rgba(8,26,46,.18)]",
                  selected &&
                    `z-10 border-[#2b6485]! shadow-[0_5px_16px_rgba(31,78,107,.16)] ring-2 ring-[#2b6485]/25`,
                )}
              >
                {(isLate || isEarlyLeaving) && (
                  <span
                    title={[isLate && "Late Entry", isEarlyLeaving && "Early Leaving"].filter(Boolean).join(" and ")}
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute right-0 top-0 h-5 w-5 @min-[480px]:h-6 @min-[480px]:w-6 [clip-path:polygon(0_0,100%_0,100%_100%)]",
                      ATTENDANCE_STATUS[isLate ? "LC" : "EL"].markerClass,
                    )}
                  >
                    {/* Both on one day: half Late Entry, half Early Leaving */}
                    {isLate && isEarlyLeaving && (
                      <span
                        className={cn(
                          "absolute inset-0 [clip-path:polygon(100%_0,100%_100%,50%_50%)]",
                          ATTENDANCE_STATUS.EL.markerClass,
                        )}
                      />
                    )}
                  </span>
                )}
                {/* TOP */}

                <div className="flex w-full items-start justify-between gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold leading-none sm:text-sm",

                      selected ? "text-[#1f4e6b]" : "text-slate-700",
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {today && (
                    <span
                      title="Today"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full bg-[#2b6485]",
                        (isLate || isEarlyLeaving) && "mr-4",
                      )}
                    />
                  )}
                </div>

                {/* STATUS ONLY — TIME REMOVED */}

                <div className="flex w-full min-w-0 items-end justify-between gap-0.5">
                  {tileStatus ? (
                    <div
                      className={cn(
                        "inline-flex min-w-0 max-w-full items-center gap-0.5 rounded-full border px-0.5 py-0.5 @min-[480px]:gap-1 @min-[480px]:px-1.5",
                        tileStatus.cellClass,
                      )}
                    >
                      <span
                        className={cn(
                          "hidden h-1 w-1 shrink-0 rounded-full @min-[480px]:block @min-[480px]:h-1.5 @min-[480px]:w-1.5",

                          tileStatus.dotClass,
                        )}
                      />

                      <span className="truncate text-[8px] font-semibold leading-none @min-[480px]:text-[10px]">
                        {tileStatus.shortLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-300">
                      —
                    </span>
                  )}
                  {hasApplicationIndicator && (
                    <span aria-hidden="true" className="hidden shrink-0 @min-[480px]:block @min-[480px]:h-5 @min-[480px]:w-5" />
                  )}
                </div>
              </button>

              {hasApplicationIndicator && (
                <Link
                  to={requestHref}
                  title={applicationStatus === "PENDING" ? "Open the pending application" : "Open the approved application"}
                  aria-label={`Open the ${applicationStatus === "PENDING" ? "pending" : "approved"} application for ${formatDayLabel(date)}`}
                  className={cn(
                    "absolute bottom-[22px] right-1 z-20 inline-flex h-4 w-4 @min-[480px]:h-5 @min-[480px]:w-5 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] @min-[480px]:bottom-1.5 @min-[480px]:right-1.5",
                    applicationStatus === "PENDING" ? "text-amber-700 ring-amber-200" : "text-emerald-700 ring-emerald-200",
                  )}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5 @min-[480px]:h-3 @min-[480px]:w-3"
                  >
                    {applicationStatus === "PENDING" ? (
                      <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </>
                    ) : (
                      <path d="m5 12 4 4L19 6" />
                    )}
                  </svg>
                </Link>
              )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CalendarActionBar = ({
  date,

  record,

  onRecordAction,

  actionsAllowed = true,
}) => {
  if (!date) return null;
  const actions = record?.actions || {};
  const availability = actions.missedPunch || {};
  const webPunch = actions.webPunch || {};
  const canPunchToday = actions.canPunchToday === true;
  const canRequestMissedPunch = actions.canRequestMissedPunch === true;
  const showMissedPunchUnavailable =
    actions.showMissedPunchUnavailable === true;
  const missedPunchLabel = actions.missedPunchLabel || "Missed Punch In/Out";

  if (!actionsAllowed) {
    return (
      <div className="att-actions bg-white px-2 py-2.5 sm:px-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon className="fa-solid fa-lock text-xs" />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-600">
                Self-service actions unavailable
              </p>

              <p className="mt-0.5 text-xs leading-relaxed text-slate-400 sm:text-xs">
                Punching in or out and Missed Punch are available only for your
                own attendance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (typeof onRecordAction !== "function") {
    return null;
  }

  if (
    !canRequestMissedPunch &&
    !canPunchToday &&
    webPunch.reasonCode !== "SHIFT_NOT_ENDED" &&
    !showMissedPunchUnavailable
  ) {
    return null;
  }

  return (
    <div className="att-actions bg-white px-2 py-1.5 sm:px-3">
      {webPunch.reasonCode === "SHIFT_NOT_ENDED" && (
        <p
          title={webPunch.message}
          role="status"
          className="mb-1 text-right text-[10px] font-bold text-amber-800"
        >
          <Icon
            aria-hidden="true"
            className="fa-solid fa-triangle-exclamation mr-1" />
          Punch Out after {webPunch.shiftEndLabel}
        </p>
      )}
      <div
        role="group"
        aria-label="Attendance actions"
        className="
          att-action-row flex flex-nowrap min-h-9 items-center justify-end overflow-x-auto
          gap-1.5 rounded-lg
          text-[11px] font-semibold

          sm:gap-2 sm:rounded-xl sm:text-xs
        "
      >
        {showMissedPunchUnavailable && (
          <div className="flex min-w-0 flex-col gap-1 sm:items-end">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title={availability.message}
              className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-semibold text-slate-400"
            >
              <Icon className="fa-regular fa-clock text-xs" />
              Missed Punch unavailable
            </button>
          </div>
        )}

        {/* Leave and work from home are applied for under Attendance > My Requests */}

        {canPunchToday && (
          <button
            type="button"
            onClick={() =>
              onRecordAction("webPunch", {
                date,
                record,
                punchType: webPunch.type,
              })
            }
            className={cn(
              "att-action-button att-button-primary inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#1f4e6b] bg-[linear-gradient(120deg,#2b6485,#1B4A7B_55%,#163a58)] px-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
            )}
          >
            <Icon className="fa-regular fa-clock" />
            {webPunch.type === "PUNCH_IN" ? "Punch In" : "Punch Out"}
          </button>
        )}
        {canRequestMissedPunch && (
          <button
            type="button"
            onClick={() =>
              onRecordAction("missedPunch", {
                date,

                record,
              })
            }
            className={cn(
              "att-action-button att-button-primary inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#1f4e6b] bg-[linear-gradient(120deg,#2b6485,#1B4A7B_55%,#163a58)] px-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
            )}
          >
            <Icon className="fa-regular fa-clock text-xs" />

            {missedPunchLabel}
          </button>
        )}
      </div>
    </div>
  );
};

const DetailMetric = ({ icon, label, value }) => (
  <div className="att-detail-metric min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-2 py-1.5">
    <div className="flex items-center gap-2">
      <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm @min-[760px]:flex">
        <Icon className={`${icon} text-xs`} />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[.04em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
          {value ?? "--"}
        </p>
      </div>
    </div>
  </div>
);

const SelectedDay = ({ date, record }) => {
  if (!date) return null;

  const displayStatusCode =
    record?.displayStatusCode ?? record?.statusCode ?? null;

  const status = displayStatusCode
    ? ATTENDANCE_STATUS[displayStatusCode]
    : null;

  return (
    <section className="att-selected-day border-b border-slate-100 bg-white/40 px-2 py-2 sm:px-3">
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">Selected day</p>

            <p className="text-sm font-bold text-slate-900">
              {formatDayLabel(date)} · {formatWeekdayShort(date)}
            </p>
          </div>

          <StatusBadge code={displayStatusCode} />
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            ["In", record?.punchIn || "--"],
            ["Out", record?.punchOut || "--"],
            [
              "Duration",
              record?.durationMinutes != null
                ? formatMinutes(record.durationMinutes)
                : "--",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-lg bg-slate-50 px-2 py-1.5"
            >
              <p className="text-xs text-slate-500">{label}</p>

              <p className="truncate text-sm font-semibold text-slate-800">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet / desktop */}

      <div className="hidden sm:block">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[.06em] text-slate-400">
              Selected Day
            </p>

            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                {formatDayLabel(date)}
              </h3>

              <span className="text-xs font-semibold text-slate-400">
                {formatWeekdayShort(date)}
              </span>
            </div>
          </div>

          {displayStatusCode ? (
            <StatusBadge code={displayStatusCode} />
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
              {record && (record.punchIn !== "--" || record.punchOut !== "--")
                ? "In Progress"
                : "No Record"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <DetailMetric
            icon="fa-solid fa-circle-check"
            label="Status"
            value={
              status?.label ||
              (record && (record.punchIn !== "--" || record.punchOut !== "--")
                ? "In Progress"
                : "--")
            }
          />

          <DetailMetric
            icon="fa-solid fa-right-to-bracket"
            label="Punch In"
            value={record?.punchIn || "--"}
          />

          <DetailMetric
            icon="fa-solid fa-right-from-bracket"
            label="Punch Out"
            value={record?.punchOut || "--"}
          />

          <DetailMetric
            icon="fa-regular fa-clock"
            label="Duration"
            value={
              record?.durationMinutes != null
                ? formatMinutes(record.durationMinutes)
                : "--"
            }
          />
        </div>
      </div>
    </section>
  );
};

const Legend = () => (
  <section
    className="att-legend border-t border-slate-100 bg-slate-50/50 px-2 py-3 sm:px-3"
    aria-label="Attendance Legend"
  >
    <div className="p-1 text-[12px] lg:text-[14px] font-bold">
      <p>LEGENDS</p>
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      {LEGEND_ITEMS.map(([code, label]) => (
        <span
          key={code}
          title={label}
          className={cn(
            "att-legend-pill inline-flex whitespace-nowrap items-center gap-1 text-[10px] leading-4",
            ATTENDANCE_STATUS[code].markerClass
              ? "min-h-5 gap-1.5 text-slate-700"
              : cn(
                  "rounded-full border px-2 py-0.5",
                  ATTENDANCE_STATUS[code].cellClass,
                ),
          )}
        >
          {ATTENDANCE_STATUS[code].markerClass ? (
            <span
              aria-hidden="true"
              className={cn(
                "h-2.5 w-7 shrink-0 rounded-full",
                ATTENDANCE_STATUS[code].markerClass,
              )}
            />
          ) : (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  ATTENDANCE_STATUS[code].dotClass,
                )}
              />
              <strong>{ATTENDANCE_STATUS[code].shortLabel}</strong>
            </>
          )}
          <span className="att-legend-label">{label}</span>
        </span>
      ))}
    </div>
  </section>
);

const AttendanceReport = ({
  todayKey,
  periodLabel,
  periodStart,
  periodEnd,
  records,
  onResetRange,
  onPreviousPeriod,
  onNextPeriod,
  onRangeChange,
  selectedDate,
  onSelectedDateChange,
  onRecordAction,
  actionsAllowed = true,
  highlight = null,
  onClearHighlight,
  requestsPath,
}) => {
  const dates = useMemo(
    () => getDatesBetween(periodStart, periodEnd),

    [periodStart, periodEnd],
  );

  const recordMap = useMemo(
    () => new Map(records.map((record) => [record.date, record])),

    [records],
  );

  const foundIndex = dates.findIndex(
    (date) => toDateKey(date) === selectedDate,
  );

  const selectedIndex = foundIndex === -1 ? 0 : foundIndex;

  // No day selected (e.g. after picking a summary row): no day panel, no actions
  const selected = selectedDate ? dates[selectedIndex] || dates[0] : null;

  const selectedRecord = selected
    ? recordMap.get(toDateKey(selected)) || null
    : null;

  return (
    <section className="att-report glass-strong rise @container relative min-w-0 overflow-hidden rounded-2xl" style={{ "--i": 2 }}>
      <BorderBeam />
      <header className="relative bg-gradient-to-r from-[#081a2e] via-[#163a58] to-[#2b6485] px-3 py-2.5 text-white sm:px-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2  h-13">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold leading-tight sm:text-[15px]">
              <AnimatedGradientText
                colorFrom="#ffffff"
                colorTo="#cfdce5"
                speed={10}
              >
                {periodLabel}
              </AnimatedGradientText>
            </h2>

            <p className="mt-0.5 truncate text-xs font-medium text-blue-200 sm:text-xs">
              {formatPeriodRange(periodStart, periodEnd)}
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <AttendanceDateRangePicker
              startDate={periodStart}
              endDate={periodEnd}
              onApply={onRangeChange}
            />

            <button
              type="button"
              onClick={onResetRange}
              aria-label="Reset date range"
              title="Reset to current month"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 p-0 font-bold text-white transition hover:bg-white/20 pointer-coarse:h-10 pointer-coarse:w-10 xl:w-auto xl:gap-2 xl:px-3",

                focusRing,
              )}
            >
              <Icon className="fa-solid fa-rotate-left text-xs" />

              <span className="hidden font-semibold xl:inline">Reset</span>
            </button>

            <IconButton
              onClick={onPreviousPeriod}
              aria-label="Previous period"
              className="att-period-arrow h-8! w-8! rounded-lg pointer-coarse:h-10! pointer-coarse:w-10!"
            >
              <Icon className="fa-solid fa-chevron-left text-xs" />
            </IconButton>

            <IconButton
              onClick={onNextPeriod}
              aria-label="Next period"
              className="att-period-arrow h-8! w-8! rounded-lg pointer-coarse:h-10! pointer-coarse:w-10!"
            >
              <Icon className="fa-solid fa-chevron-right text-xs" />
            </IconButton>
          </div>
        </div>
      </header>

      {selected && <SelectedDay date={selected} record={selectedRecord} />}

      {highlight && ATTENDANCE_STATUS[highlight] && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 border-b border-[#dce6ed] bg-[#f2f5f7] px-3 py-1.5 text-xs text-[#1f4e6b]"
        >
          <span className="min-w-0">
            Showing only{" "}
            <strong>{ATTENDANCE_STATUS[highlight].label}</strong> days ·{" "}
            <span className="tabular-nums">
              {dates.filter((date) => matchesSummaryCode(highlight, recordMap.get(toDateKey(date)))).length}
            </span>{" "}
            in view
          </span>
          {onClearHighlight && (
            <button
              type="button"
              onClick={onClearHighlight}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-semibold hover:bg-white",
                focusRing,
              )}
            >
              <Icon aria-hidden="true" className="fa-solid fa-xmark" />
              Show all
            </button>
          )}
        </div>
      )}

      <CalendarView
        todayKey={todayKey}
        dates={dates}
        recordMap={recordMap}
        selectedDate={selectedDate}
        onSelect={onSelectedDateChange}
        highlight={highlight}
        requestsPath={requestsPath}
      />

      <div className="att-action-slot h-18 shrink-0 overflow-y-auto overscroll-contain border-t border-slate-100">
        <CalendarActionBar
          date={selected}
          record={selectedRecord}
          onRecordAction={onRecordAction}
          actionsAllowed={actionsAllowed}
        />
      </div>

      <Legend />
    </section>
  );
};

export default AttendanceReport;
