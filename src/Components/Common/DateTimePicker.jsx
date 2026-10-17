import React, { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";

import Icon from "./Icon";
// ============================================================
// HELPERS
// ============================================================

const cn = (...classes) => classes.filter(Boolean).join(" ");

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2";

const pad2 = (value) => String(value).padStart(2, "0");

// ============================================================
// DATE HELPERS
// VALUE FORMAT: YYYY-MM-DD
// ============================================================

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const dateToValue = (date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join("-");
};

export const valueToDate = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const formatDateDisplay = (value) => {
  const date = valueToDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildCalendarDays = (viewDate) => {
  const year = viewDate.getFullYear();

  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);

  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from(
    {
      length: 42,
    },
    (_, index) => {
      const date = new Date(start);

      date.setDate(start.getDate() + index);

      return date;
    },
  );
};

// ============================================================
// TIME HELPERS
// VALUE FORMAT: HH:mm
// ============================================================

export const parseTimeValue = (value) => {
  if (!value) {
    return {
      hour: "09",
      minute: "00",
      period: "AM",
    };
  }

  const [rawHour, rawMinute] = String(value).split(":").map(Number);

  if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) {
    return {
      hour: "09",
      minute: "00",
      period: "AM",
    };
  }

  const period = rawHour >= 12 ? "PM" : "AM";

  const hour = rawHour % 12 || 12;

  return {
    hour: pad2(hour),

    minute: pad2(rawMinute),

    period,
  };
};

export const timeToValue = ({ hour, minute, period }) => {
  let convertedHour = Number(hour);

  if (period === "AM" && convertedHour === 12) {
    convertedHour = 0;
  }

  if (period === "PM" && convertedHour !== 12) {
    convertedHour += 12;
  }

  return `${pad2(convertedHour)}:${pad2(minute)}`;
};

const formatTimeDisplay = (value) => {
  if (!value) {
    return "";
  }

  const parsed = parseTimeValue(value);

  return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
};

// ============================================================
// OUTSIDE CLICK
// ============================================================

const useOutsideClick = ({ triggerRef, popupRef, open, onClose }) => {
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event) => {
      const target = event.target;

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (popupRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);

      window.removeEventListener("keydown", handleEscape);
    };
  }, [triggerRef, popupRef, open, onClose]);
};

// ============================================================
// PORTAL POSITION
// ============================================================

const usePopoverPosition = (
  triggerRef,
  open,
  preferredWidth,
  estimatedHeight,
) => {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: preferredWidth,
    maxHeight: estimatedHeight,
  });

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();

      const viewportWidth = window.innerWidth;

      const viewportHeight = window.innerHeight;

      const width = Math.min(preferredWidth, viewportWidth - 24);

      let left = rect.left;

      if (left + width > viewportWidth - 12) {
        left = viewportWidth - width - 12;
      }

      left = Math.max(12, left);

      const spaceBelow = viewportHeight - rect.bottom;

      const spaceAbove = rect.top;

      // The popup may be taller than the window (a short laptop screen, a phone in landscape):
      // then it gets the window's height and scrolls inside
      const maxHeight = Math.min(estimatedHeight, viewportHeight - 24);

      const openAbove = spaceBelow < maxHeight + 8 && spaceAbove > spaceBelow;

      let top;

      if (openAbove) {
        top = rect.top - maxHeight - 8;
      } else {
        top = rect.bottom + 8;
      }

      // Whatever side it opens on, keep the whole popup inside the window
      top = Math.max(12, Math.min(top, viewportHeight - maxHeight - 12));

      setPosition({
        top,
        left,
        width,
        maxHeight,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef, open, preferredWidth, estimatedHeight]);

  return position;
};

// ============================================================
// FIELD BUTTON
// ============================================================

const PickerButton = ({
  id,
  open,
  disabled,
  value,
  placeholder,
  displayValue,
  icon,
  tone = "blue",
  onClick,
}) => {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : "bg-[#f2f5f7] text-[#2b6485]";

  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        `
          group flex h-11 w-full
          items-center rounded-xl

          border border-slate-200/90

          bg-gradient-to-b
          from-white
          to-slate-50/70

          px-2.5
          text-left

          transition-all
          duration-200

          hover:border-[#cfdce5]
          hover:bg-white
          hover:shadow-[0_3px_12px_rgba(8,26,46,.05)]

          disabled:cursor-not-allowed
          disabled:bg-slate-50
          disabled:opacity-60
        `,
        focusRing,
      )}
    >
      <span
        className={cn(
          `
            flex h-7 w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
          `,
          toneClass,
        )}
      >
        <Icon className={`${icon} text-[9px]`} />
      </span>

      <span
        className={cn(
          `
            min-w-0 flex-1
            truncate px-2.5
            text-[11px]
            font-semibold
          `,
          value ? "text-slate-700" : "text-slate-400",
        )}
      >
        {value ? displayValue : placeholder}
      </span>

      <span
        className={cn(
          `
            flex h-7 w-7
            shrink-0
            items-center
            justify-center
            rounded-lg

            border
            border-slate-200

            bg-white
            text-slate-400

            shadow-sm
            transition
          `,
          open && "border-[#cfdce5] bg-[#f2f5f7] text-[#2b6485]",
        )}
      >
        <Icon
          className={cn(
            `
              fa-solid
              fa-chevron-down
              text-[7px]
              transition-transform
              duration-200
            `,
            open && "rotate-180",
          )} />
      </span>
    </button>
  );
};

// ============================================================
// DATE PICKER
//
// value:
// YYYY-MM-DD
//
// onChange:
// YYYY-MM-DD
//
// Supports:
// min="YYYY-MM-DD"
// max="YYYY-MM-DD"
// ============================================================

export const DatePicker = ({
  id,
  value = "",
  onChange,
  placeholder = "Select date",
  disabled = false,
  min,
  max,
  tone = "blue",
  className = "",
}) => {
  const triggerRef = useRef(null);

  const popupRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [viewDate, setViewDate] = useState(() => {
    const initial = valueToDate(value) || valueToDate(min) || new Date();

    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;

    let source = valueToDate(value) || new Date();

    const minimum = valueToDate(min);

    const maximum = valueToDate(max);

    if (minimum && source < minimum) {
      source = minimum;
    }

    if (maximum && source > maximum) {
      source = maximum;
    }

    setViewDate(new Date(source.getFullYear(), source.getMonth(), 1));
  }, [open, value, min, max]);

  useOutsideClick({
    triggerRef,
    popupRef,
    open,

    onClose: () => setOpen(false),
  });

  const position = usePopoverPosition(triggerRef, open, 320, 370);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const minDate = valueToDate(min);

  const maxDate = valueToDate(max);

  const today = new Date();

  const todayKey = dateToValue(today);

  const isDisabledDate = (date) => {
    const normalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (minDate && normalized < minDate) {
      return true;
    }

    if (maxDate && normalized > maxDate) {
      return true;
    }

    return false;
  };

  const shiftMonth = (amount) => {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const previousMonthEnd = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    0,
  );

  const nextMonthStart = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );

  const canGoPrevious = !minDate || previousMonthEnd >= minDate;

  const canGoNext = !maxDate || nextMonthStart <= maxDate;

  const selectDate = (date) => {
    if (isDisabledDate(date)) {
      return;
    }

    onChange?.(dateToValue(date));

    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={triggerRef}>
        <PickerButton
          id={id}
          open={open}
          disabled={disabled}
          value={value}
          displayValue={formatDateDisplay(value)}
          placeholder={placeholder}
          icon="fa-regular fa-calendar"
          tone={tone}
          onClick={() => setOpen((current) => !current)}
        />
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            className="
              fixed z-[100000]
              rounded-2xl
              border
              border-slate-200/80
              bg-white
              p-3
              shadow-[0_22px_70px_rgba(8,26,46,.22)]
            "
            style={{
              top: position.top,

              left: position.left,

              width: position.width,

              maxHeight: position.maxHeight,

              overflowY: "auto",
            }}
          >
            {/* HEADER */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-extrabold text-slate-800">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                  Choose a date
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  aria-label="Previous month"
                  type="button"
                  disabled={!canGoPrevious}
                  onClick={() => shiftMonth(-1)}
                  className={cn(
                    `
                      flex h-8 w-8
                      items-center
                      justify-center
                      rounded-lg

                      border
                      border-slate-200

                      text-slate-500
                      transition

                      hover:border-[#cfdce5]
                      hover:bg-[#f2f5f7]
                      hover:text-[#2b6485]

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                      disabled:hover:border-slate-200
                      disabled:hover:bg-transparent
                      disabled:hover:text-slate-500
                    `,
                    focusRing,
                  )}
                >
                  <Icon className="fa-solid fa-chevron-left text-[8px]" />
                </button>

                <button
                  aria-label="Next month"
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => shiftMonth(1)}
                  className={cn(
                    `
                      flex h-8 w-8
                      items-center
                      justify-center
                      rounded-lg

                      border
                      border-slate-200

                      text-slate-500
                      transition

                      hover:border-[#cfdce5]
                      hover:bg-[#f2f5f7]
                      hover:text-[#2b6485]

                      disabled:cursor-not-allowed
                      disabled:opacity-30
                      disabled:hover:border-slate-200
                      disabled:hover:bg-transparent
                      disabled:hover:text-slate-500
                    `,
                    focusRing,
                  )}
                >
                  <Icon className="fa-solid fa-chevron-right text-[8px]" />
                </button>
              </div>
            </div>

            {/* WEEKDAYS */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="
                      py-1.5
                      text-center
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[.08em]
                      text-slate-400
                    "
                >
                  {day}
                </div>
              ))}
            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date) => {
                const key = dateToValue(date);

                const outside = date.getMonth() !== viewDate.getMonth();

                const selected = key === value;

                const isToday = key === todayKey;

                const dateDisabled = isDisabledDate(date);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={dateDisabled}
                    onClick={() => selectDate(date)}
                    aria-label={formatDateDisplay(dateToValue(date))}
                    className={cn(
                      `
                          relative
                          flex h-8
                          items-center
                          justify-center

                          rounded-lg
                          text-[10px]
                          font-semibold

                          transition
                        `,

                      dateDisabled &&
                        `
                            cursor-not-allowed
                            text-slate-200
                          `,

                      outside &&
                        !selected &&
                        !dateDisabled &&
                        `
                            bg-slate-50/60
                            text-slate-500
                            hover:bg-[#f2f5f7]
                            hover:text-[#1f4e6b]
                          `,

                      !outside &&
                        !selected &&
                        !dateDisabled &&
                        `
                            text-slate-600
                            hover:bg-[#f2f5f7]
                            hover:text-[#1f4e6b]
                          `,

                      selected &&
                        `
                            bg-[#2b6485]
                            text-white
                            shadow-[0_4px_12px_rgba(31,78,107,.24)]
                          `,

                      focusRing,
                    )}
                  >
                    {date.getDate()}

                    {isToday && !selected && !dateDisabled && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#2b6485]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  let target = new Date();

                  if (minDate && target < minDate) {
                    target = minDate;
                  }

                  if (maxDate && target > maxDate) {
                    target = maxDate;
                  }

                  setViewDate(
                    new Date(target.getFullYear(), target.getMonth(), 1),
                  );
                }}
                className="
                  text-[9px]
                  font-bold
                  text-slate-400
                  transition

                  hover:text-slate-700
                "
              >
                Current
              </button>

              <button
                type="button"
                disabled={isDisabledDate(today)}
                onClick={() => selectDate(today)}
                className="
                  rounded-lg
                  bg-[#f2f5f7]
                  px-2.5 py-1.5

                  text-[9px]
                  font-bold
                  text-[#2b6485]

                  transition

                  hover:bg-[#dce6ed]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

// ============================================================
// TIME PICKER
//
// value:
// HH:mm
//
// onChange:
// HH:mm
//
// Display:
// hh:mm AM / PM
// ============================================================

const HOURS = Array.from(
  {
    length: 12,
  },
  (_, index) => pad2(index + 1),
);

const buildMinutes = (step) => {
  const safeStep = Math.max(1, Math.min(60, Number(step) || 1));

  const values = [];

  for (let minute = 0; minute < 60; minute += safeStep) {
    values.push(pad2(minute));
  }

  return values;
};

export const TimePicker = ({
  value = "",
  onChange,
  placeholder = "Select time",
  disabled = false,
  minuteStep = 1,
  tone = "blue",
  className = "",
}) => {
  const triggerRef = useRef(null);

  const popupRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [draft, setDraft] = useState(() => parseTimeValue(value));

  useEffect(() => {
    if (!open) return;

    setDraft(parseTimeValue(value));
  }, [open, value]);

  useOutsideClick({
    triggerRef,
    popupRef,
    open,

    onClose: () => setOpen(false),
  });

  const position = usePopoverPosition(triggerRef, open, 290, 330);

  const minutes = useMemo(() => buildMinutes(minuteStep), [minuteStep]);

  const updateDraft = (key, nextValue) => {
    setDraft((current) => ({
      ...current,

      [key]: nextValue,
    }));
  };

  const commitTime = () => {
    onChange?.(timeToValue(draft));

    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={triggerRef}>
        <PickerButton
          open={open}
          disabled={disabled}
          value={value}
          displayValue={formatTimeDisplay(value)}
          placeholder={placeholder}
          icon="fa-regular fa-clock"
          tone={tone}
          onClick={() => setOpen((current) => !current)}
        />
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            className="
              fixed z-[100000]
              overflow-hidden
              rounded-2xl

              border
              border-slate-200/80

              bg-white

              shadow-[0_22px_70px_rgba(8,26,46,.22)]
            "
            style={{
              top: position.top,

              left: position.left,

              width: position.width,

              maxHeight: position.maxHeight,

              overflowY: "auto",
            }}
          >
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-extrabold text-slate-700">
                Select time
              </p>

              <p className="mt-0.5 text-[8.5px] font-medium text-slate-400">
                Hour, minute and period
              </p>
            </div>

            <div className="grid grid-cols-[1fr_1fr_.8fr] divide-x divide-slate-100 px-2 py-2">
              {/* HOURS */}
              <div>
                <p className="pb-1.5 text-center text-[8px] font-bold uppercase tracking-[.08em] text-slate-400">
                  Hour
                </p>

                <div className="max-h-[176px] overflow-y-auto px-1">
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => updateDraft("hour", hour)}
                      className={cn(
                        `
                            mb-1
                            flex h-8
                            w-full
                            items-center
                            justify-center

                            rounded-lg

                            text-[10px]
                            font-bold

                            transition
                          `,

                        draft.hour === hour
                          ? "bg-[#2b6485] text-white"
                          : "text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* MINUTES */}
              <div>
                <p className="pb-1.5 text-center text-[8px] font-bold uppercase tracking-[.08em] text-slate-400">
                  Minute
                </p>

                <div className="max-h-[176px] overflow-y-auto px-1">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => updateDraft("minute", minute)}
                      className={cn(
                        `
                            mb-1
                            flex h-8
                            w-full
                            items-center
                            justify-center

                            rounded-lg

                            text-[10px]
                            font-bold

                            transition
                          `,

                        draft.minute === minute
                          ? "bg-[#2b6485] text-white"
                          : "text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM / PM */}
              <div>
                <p className="pb-1.5 text-center text-[8px] font-bold uppercase tracking-[.08em] text-slate-400">
                  Period
                </p>

                <div className="space-y-2 px-1">
                  {["AM", "PM"].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => updateDraft("period", period)}
                      className={cn(
                        `
                            flex h-10
                            w-full
                            items-center
                            justify-center

                            rounded-xl

                            text-[10px]
                            font-extrabold

                            transition
                          `,

                        draft.period === period
                          ? "bg-[#0b2a4a] text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100",
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="border-t border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-semibold text-slate-400">
                  Selected
                </span>

                <span className="text-[12px] font-extrabold text-slate-800">
                  {draft.hour}:{draft.minute} {draft.period}
                </span>
              </div>

              <button
                type="button"
                onClick={commitTime}
                className={cn(
                  `
                    flex h-9
                    w-full
                    items-center
                    justify-center

                    rounded-xl

                    bg-[#0b2a4a]

                    text-[10px]
                    font-bold
                    text-white

                    transition

                    hover:bg-[#123d69]
                  `,
                  focusRing,
                )}
              >
                <Icon className="fa-solid fa-check mr-2 text-[8px]" />
                Set Time
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
