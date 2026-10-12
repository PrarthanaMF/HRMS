import React, { useEffect, useId, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  DatePicker,
  TimePicker,
} from "../../Common/DateTimePicker";

import AnimatedGradientText from "../../MagicUI/AnimatedGradientText";
import BorderBeam from "../../MagicUI/BorderBeam";
import { cn } from "./AttendanceUI";
import { useAttendanceAccess, useAttendanceDay } from "../../../Hooks/useAttendance";
// ============================================================

// REQUEST MODAL

// ============================================================

export const RequestModal = ({
  open,

  title,

  subtitle,

  icon = "fa-solid fa-file-pen",

  onClose,

  children,
}) => {
  const titleId = useId();

  const modalRef = useRef(null);

  const onCloseRef = useRef(onClose);

  /*

    Keep the latest onClose function available without making

    the modal focus-management effect rerun on every parent render.

  */

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const previouslyFocused = document.activeElement;

    document.body.style.overflow = "hidden";

    const getFocusableElements = () => {
      if (!modalRef.current) {
        return [];
      }

      return [
        ...modalRef.current.querySelectorAll(
          [
            "button:not([disabled])",

            "input:not([disabled])",

            "textarea:not([disabled])",

            "select:not([disabled])",

            "a[href]",

            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        ),
      ].filter(
        (element) =>
          !element.hasAttribute("aria-hidden") && element.offsetParent !== null,
      );
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        onCloseRef.current?.();

        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = getFocusableElements();

      if (!focusable.length) {
        event.preventDefault();

        modalRef.current.focus();

        return;
      }

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();

        last.focus();

        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();

        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    /*

      Focus only ONCE when the modal opens.

      Priority:

      1. element marked data-autofocus

      2. input / textarea / select

      3. modal itself

      Do not automatically focus the Close button.

    */

    const focusFrame = window.requestAnimationFrame(() => {
      const modal = modalRef.current;

      if (!modal) {
        return;
      }

      const preferred = modal.querySelector("[data-autofocus]");

      const formControl = modal.querySelector(
        [
          "input:not([disabled])",

          "textarea:not([disabled])",

          "select:not([disabled])",
        ].join(","),
      );

      const target = preferred || formControl || modal;

      target.focus?.();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);

      window.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;

      if (previouslyFocused instanceof HTMLElement) {
        window.requestAnimationFrame(() => {
          previouslyFocused.focus();
        });
      }
    };

    /*

      IMPORTANT:

      Only react to open/close state.

      Do NOT add onClose here because its function identity

      can change whenever the parent component rerenders.

    */
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current?.();
        }
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="att-request-dialog relative flex max-h-[92dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,.28)] outline-none"
      >
        <BorderBeam />
        <header className="relative shrink-0 overflow-hidden border-b border-[#D8E7F2]/60 bg-gradient-to-r from-[#F0F6FA]/80 to-[#F0F6FA]/60 px-3 py-3 sm:px-5 sm:py-4">
          <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_44px] items-start gap-2 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B4A7B] to-[#1B4A7B] text-white shadow-sm ">
              <i className={`${icon} text-sm`} />
            </span>

            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[15px] font-extrabold leading-5 tracking-[-.015em] text-slate-900 sm:text-[16px]"
              >
                <AnimatedGradientText
                  className="max-w-full whitespace-normal break-words"
                  colorFrom="#1B4A7B"
                  colorTo="#3A7DC0"
                  speed={8}
                >
                  {title}
                </AnimatedGradientText>
              </h2>

              {subtitle && (
                <p className="mt-1 max-w-full break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              aria-label="Close"
              onClick={() => onCloseRef.current?.()}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-100 hover:text-slate-700",
                focusRing,
              )}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>,

    document.body,
  );
};

// ============================================================

// SHARED FORM UI

// ============================================================

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

const textareaClass = `

  w-full resize-none rounded-xl

  border border-slate-200

  bg-white

  p-3 text-xs font-medium text-slate-700

  outline-none transition-all

  placeholder:text-slate-300

  hover:border-slate-200

  focus:border-slate-400 focus:bg-white

  

`;

const cancelButtonClass = `

  h-10 rounded-xl border border-slate-200 bg-white

  px-4 text-xs font-semibold text-slate-600

  transition hover:bg-slate-50 sm:min-w-[90px]

`;

const submitButtonClass = `

  att-button-primary bg-[linear-gradient(120deg,#2A5F98,#1B4A7B_55%,#0C3453)] hover:brightness-105 disabled:bg-none disabled:shadow-none inline-flex h-10 items-center justify-center gap-2

  rounded-xl px-5 text-xs font-bold text-white

  transition active:scale-[.98] sm:min-w-[150px]

`;

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600"
    >
      <i className="fa-solid fa-circle-exclamation text-xs" />

      <span>{message}</span>
    </div>
  );
};

// ============================================================

// MODERN SELECT

// ============================================================

const ModernSelect = ({
  value,

  options,

  onChange,

  icon = "fa-regular fa-circle-check",
}) => {
  const ref = useRef(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  const selected =
    options.find((option) => option.value === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "group flex h-11 w-full items-center rounded-xl border border-slate-200/90 bg-white px-2.5 text-left transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-[0_3px_12px_rgba(15,23,42,.05)]",

          focusRing,
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
          <i className={`${icon} text-xs`} />
        </span>

        <div className="min-w-0 flex-1 px-2.5">
          <p className="truncate text-xs font-semibold text-slate-700">
            {selected?.label}
          </p>
        </div>

        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition",

            open && "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          <i
            className={cn(
              "fa-solid fa-chevron-down text-xs transition-transform duration-200",

              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+7px)] z-[120] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,.16)]"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);

                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",

                  active
                    ? "bg-slate-50 text-slate-700"
                    : "text-slate-600 hover:bg-slate-50",

                  focusRing,
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",

                    active
                      ? "bg-slate-100 text-slate-600"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  <i className={`${option.icon || icon} text-xs`} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{option.label}</p>

                  {option.description && (
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {option.description}
                    </p>
                  )}
                </div>

                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
                    <i className="fa-solid fa-check text-xs" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================

// LEAVE

// ============================================================

export const ApplyLeaveModal = ({ open, initialDate, onClose, onSubmit, isSubmitting = false }) => {
  /*

    Keep dates as local YYYY-MM-DD.

    Do not use toISOString().slice(0, 10).

  */

  const { formOptions = {}, serverToday } = useAttendanceAccess();
  const todayKey = serverToday || "";

  const getInitialLeaveDate = () =>
    initialDate && initialDate >= (formOptions.leaveMinDate || "") ? initialDate : todayKey;

  const createInitialForm = () => {
    const date = getInitialLeaveDate();

    return {
      leaveType: formOptions.leaveTypes?.[0]?.value || "",

      from: date,

      to: date,

      duration: formOptions.durations?.[0]?.value || "FULL_DAY",

      reason: "",
    };
  };

  const [form, setForm] = useState(createInitialForm);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(createInitialForm());

    setError("");
  }, [open, initialDate, todayKey]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const updateFromDate = (value) => {
    setForm((current) => {
      const nextTo = !current.to || current.to < value ? value : current.to;

      /*

        Half-day leave is single-day only.

        If the user changes From while a half-day

        duration is selected, keep To synced.

      */

      return {
        ...current,

        from: value,

        to: formOptions.halfDaySingleDate && current.duration !== "FULL_DAY" ? value : nextTo,
      };
    });
  };

  const updateToDate = (value) => {
    setForm((current) => ({
      ...current,

      to: value,
    }));
  };

  const updateDuration = (value) => {
    setForm((current) => ({
      ...current,

      duration: value,

      /*

        FIRST_HALF and SECOND_HALF are only

        supported for a single attendance date.

      */

      to: !formOptions.halfDaySingleDate || value === "FULL_DAY" ? current.to : current.from,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !form.from ||
      !form.to ||
      !form.leaveType ||
      !form.duration ||
      !form.reason.trim()
    ) {
      setError("Please complete all required fields.");

      return;
    }

    if (form.to < form.from) {
      setError("End date cannot be before the start date.");

      return;
    }

    const reason = form.reason.trim();

    if (reason.length < formOptions.reasonMin) {
      setError(
        `Reason must contain at least ${formOptions.reasonMin} characters.`,
      );

      return;
    }

    if (reason.length > formOptions.reasonMax) {
      setError(
        `Reason cannot exceed ${formOptions.reasonMax} characters.`,
      );

      return;
    }

    const result = await onSubmit({
      ...form,

      reason,
    });

    if (!result?.ok) {
      setError(result?.message || "Unable to submit request.");

      return;
    }

    onClose();
  };

  return (
    <RequestModal
      open={open}
      title="Apply Leave"
      icon="fa-regular fa-calendar-plus"
      subtitle="Your request will be sent to your reporting manager for approval."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5">
        <div
          role="note"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#A4C8E1] bg-[#F0F6FA] px-3 py-2.5"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D8E7F2] text-[#1B4A7B]">
            <i className="fa-solid fa-route text-xs" />
          </span>

          <div>
            <p className="text-xs font-bold text-[#133F66]">
              Approval workflow
            </p>

            <p className="mt-0.5 text-xs leading-4 text-[#1B4A7B]">
              The request remains pending until an authorized approver processes
              it.
            </p>
          </div>
        </div>

        <ErrorMessage message={error} />

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Leave Type *</span>

            <ModernSelect
              value={form.leaveType}
              options={(formOptions.leaveTypes || [])}
              onChange={(value) => update("leaveType", value)}
              icon="fa-regular fa-calendar-check"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className={labelClass}>From *</span>

              <DatePicker
                value={form.from}
                min={formOptions.leaveMinDate}
                onChange={updateFromDate}
                placeholder="Select from date"
              />
            </div>

            <div>
              <span className={labelClass}>To *</span>

              <DatePicker
                value={form.to}
                min={form.from || formOptions.leaveMinDate}
                onChange={updateToDate}
                placeholder="Select to date"
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>Duration</span>

            <div className="grid grid-cols-3 gap-2">
              {(formOptions.durations || []).map((item) => {
                const active = form.duration === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateDuration(item.value)}
                    className={cn(
                      "flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 text-center transition-all duration-200",

                      focusRing,

                      active
                        ? "border-[#7FBBD8] bg-[#F0F6FA] text-[#1B4A7B]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-100 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg",

                        active
                          ? "bg-[#2A5F98] text-white"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      <i className={`${item.icon} text-xs`} />
                    </span>

                    <span className="text-xs font-bold sm:text-xs">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formOptions.halfDaySingleDate && form.duration !== "FULL_DAY" && (
              <p className="mt-2 text-xs font-medium text-slate-600">
                Half-day leave applies to one date only.
              </p>
            )}
          </div>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Reason *
              </span>

              <span className="text-xs font-semibold text-slate-400">
                {form.reason.length}/{formOptions.reasonMax}
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={formOptions.reasonMax}
              value={form.reason}
              onChange={(event) => update("reason", event.target.value)}
              placeholder="Briefly explain the reason for leave"
              className={cn(textareaClass, focusRing)}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(cancelButtonClass, focusRing)}
          >
            Cancel
          </button>

          <button
            disabled={isSubmitting}
            type="submit"
            className={cn(
              submitButtonClass,

              "bg-[#2A5F98] shadow-[0_4px_12px_rgba(79,70,229,.18)] hover:bg-[#1B4A7B]",

              focusRing,
            )}
          >
            <i className="fa-regular fa-paper-plane text-xs" />
            Submit Request
          </button>
        </div>
      </form>
    </RequestModal>
  );
};

// ============================================================

// WORK FROM HOME

// ============================================================

export const WorkFromHomeModal = ({ open, initialDate, onClose, onSubmit, isSubmitting = false }) => {
  const { formOptions = {}, serverToday } = useAttendanceAccess();
  const todayKey = serverToday || "";

  const getInitialDate = () =>
    initialDate && initialDate >= (formOptions.wfhMinDate || "") ? initialDate : todayKey;

  const createInitialForm = () => {
    const date = getInitialDate();

    return {
      from: date,
      to: date,
      reason: "",
    };
  };

  const [form, setForm] = useState(createInitialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(createInitialForm());
    setError("");
  }, [open, initialDate, todayKey]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateFromDate = (value) => {
    setForm((current) => ({
      ...current,
      from: value,
      to: !current.to || current.to < value ? value : current.to,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.from || !form.to || !form.reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.to < form.from) {
      setError("End date cannot be before the start date.");
      return;
    }

    const reason = form.reason.trim();

    if (reason.length < formOptions.reasonMin) {
      setError(
        `Reason must contain at least ${formOptions.reasonMin} characters.`,
      );
      return;
    }

    if (reason.length > formOptions.reasonMax) {
      setError(
        `Reason cannot exceed ${formOptions.reasonMax} characters.`,
      );
      return;
    }

    const result = await onSubmit({
      ...form,
      reason,
    });

    if (!result?.ok) {
      setError(result?.message || "Unable to submit WFH request.");
      return;
    }

    onClose();
  };

  return (
    <RequestModal
      open={open}
      title="Work From Home"
      icon="fa-solid fa-house-laptop"
      subtitle={formOptions.wfhDescription || "Submit a WFH request for approval."}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-5">
        <div
          role="note"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#A4C8E1] bg-[#F0F6FA] px-3 py-2.5"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D8E7F2] text-[#1B4A7B]">
            <i className="fa-solid fa-house-laptop text-xs" />
          </span>

          <div>
            <p className="text-xs font-bold text-[#133F66]">WFH payable rule</p>

            <p className="mt-0.5 text-xs leading-4 text-[#1B4A7B]">
              {formOptions.wfhDescription || "Payable values are supplied by the attendance backend."}
            </p>
          </div>
        </div>

        <ErrorMessage message={error} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className={labelClass}>From *</span>

              <DatePicker
                value={form.from}
                min={formOptions.wfhMinDate}
                onChange={updateFromDate}
                placeholder="Select from date"
              />
            </div>

            <div>
              <span className={labelClass}>To *</span>

              <DatePicker
                value={form.to}
                min={form.from || formOptions.wfhMinDate}
                onChange={(value) => update("to", value)}
                placeholder="Select to date"
              />
            </div>
          </div>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Reason / Work Plan *
              </span>

              <span className="text-xs font-semibold text-slate-400">
                {form.reason.length}/{formOptions.reasonMax}
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={formOptions.reasonMax}
              value={form.reason}
              onChange={(event) => update("reason", event.target.value)}
              placeholder="Explain why WFH is required and briefly mention the work plan"
              className={cn(textareaClass, focusRing)}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(cancelButtonClass, focusRing)}
          >
            Cancel
          </button>

          <button
            disabled={isSubmitting}
            type="submit"
            className={cn(
              submitButtonClass,
              "bg-[#2A5F98] shadow-[0_4px_12px_rgba(79,70,229,.18)] hover:bg-[#1B4A7B]",
              focusRing,
            )}
          >
            <i className="fa-regular fa-paper-plane text-xs" />
            Submit WFH Request
          </button>
        </div>
      </form>
    </RequestModal>
  );
};

// ============================================================

// MISSED PUNCH

// ============================================================

// One date-aware form: automatic punches today, manual corrections for past days.
export const MissedPunchModal = ({
  open,
  initialDate,
  initialPunchType,
  onClose,
  onSubmit,
  onPunch,
  isSubmitting = false,
}) => {
  const { formOptions = {}, serverToday, employee, user } = useAttendanceAccess();
  const todayKey = serverToday || "";
  const [form, setForm] = useState({
    date: initialDate || todayKey,
    requestedPunchIn: "",
    requestedPunchOut: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null);
  const confirmButtonRef = useRef(null);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (!open) return;
    setForm({
      date: initialDate || todayKey,
      requestedPunchIn: "",
      requestedPunchOut: "",
      reason: "",
    });
    setError("");
    setConfirming(initialDate === todayKey ? initialPunchType : null);
    setClock(new Date());
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, [open, initialDate, initialPunchType, todayKey]);
  useEffect(() => {
    if (open && confirming) confirmButtonRef.current?.focus();
  }, [open, confirming]);
  const day = useAttendanceDay(form.date, open);
  const record = day.data?.record || {};
  const actions = day.data?.actions || {};
  const live = actions.mode === "WEB_PUNCH";
  const web = actions.webPunch || { ok: false, message: "Loading punch availability…" };
  const missed = actions.missedPunch || {};
  const type = missed.canRequestPunchIn
    ? "PUNCH_IN"
    : missed.canRequestPunchOut
      ? "PUNCH_OUT"
      : "";
  const title = confirming
    ? `Confirm ${confirming === "PUNCH_OUT" ? "Punch Out" : "Punch In"}`
    : live
      ? web.type === "PUNCH_OUT"
        ? "Punch Out"
        : "Punch In"
      : "Missed Punch In/Out";
  const update = (key, value) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (live) {
      if (!web.ok) {
        setError(web.message);
        return;
      }
      setConfirming(web.type);
      return;
    }
    if (!form.date || !type || !form.reason.trim() ||
        ((type === "PUNCH_IN") && !form.requestedPunchIn) ||
        ((type === "PUNCH_OUT") && !form.requestedPunchOut)) {
      setError("Please complete the date, required punch times, and reason.");
      return;
    }
    const result = await onSubmit({
      date: form.date, reason: form.reason, missingType: type,
      ...(type === "PUNCH_IN" ? { requestedPunchIn: form.requestedPunchIn } : { requestedPunchOut: form.requestedPunchOut }),
    });
    if (!result?.ok) {
      setError(result?.message || "Unable to save punch.");
      return;
    }
    onClose();
  };
  const confirmPunch = async () => {
    if (!live || !web.ok || web.type !== confirming) {
      setError("Punch availability changed. Review the action and try again.");
      setConfirming(null);
      return;
    }
    const result = await onPunch({ date: form.date, expectedType: confirming });
    if (!result?.ok) {
      setError(result?.message || "Unable to save punch.");
      setConfirming(null);
      return;
    }
    onClose();
  };
  return (
    <RequestModal
      open={open}
      title={title}
      icon="fa-regular fa-clock"
      onClose={onClose}
      subtitle={
        confirming
          ? "Review the details below. Attendance is recorded only when you confirm."
          : live
            ? "Punch from anywhere when the office device is unavailable. Review and confirm to record the current time."
            : "Enter the actual worked times. Missing punches are updated after approval."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
        <ErrorMessage message={error || day.error?.message} />
        {confirming ? (
          <div className="overflow-hidden rounded-xl border border-[#A4C8E1] bg-[#F0F6FA]">
            <div className="border-b border-[#D8E7F2] bg-white/80 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A5F98]">
                Attendance confirmation
              </p>
              <p className="mt-1 text-sm font-semibold text-[#081F34]">
                {confirming === "PUNCH_OUT"
                  ? "Record Punch Out"
                  : "Record Punch In"}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Employee</dt>
                <dd className="mt-0.5 font-semibold text-[#133F66]">
                  {employee?.name || user?.name || "--"}{" "}
                  <span className="font-normal text-slate-500">
                    ({employee?.empId || user?.empId || "--"})
                  </span>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Attendance date</dt>
                <dd className="mt-0.5 font-semibold text-[#133F66]">
                  {new Date(`${form.date}T12:00:00`).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Recorded Punch In</dt>
                <dd className="mt-0.5 font-semibold text-[#133F66]">
                  {record.punchIn || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Recorded Punch Out</dt>
                <dd className="mt-0.5 font-semibold text-[#133F66]">
                  {record.punchOut || "--"}
                </dd>
              </div>
            </dl>
            <div className="border-t border-[#D8E7F2] px-4 py-3 text-center">
              <p className="text-xs text-slate-600">
                Current time · final time captured when you confirm
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1B4A7B]">
                {clock.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              {!web.ok && (
                <p className="mt-2 text-xs text-rose-700">{web.message}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <label className="block text-xs font-semibold text-slate-600">
              Attendance Date
              <DatePicker
                value={form.date}
                min={formOptions.missedPunchMinDate}
                max={formOptions.missedPunchMaxDate}
                onChange={(date) => {
                  setForm({
                    date,
                    requestedPunchIn: "",
                    requestedPunchOut: "",
                    reason: "",
                  });
                  setError("");
                  setConfirming(null);
                }}
                placeholder="Select attendance date"
                className="mt-1"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <p className="text-slate-500">Recorded Punch In</p>
                <strong>{record.punchIn || "--"}</strong>
              </div>
              <div>
                <p className="text-slate-500">Recorded Punch Out</p>
                <strong>{record.punchOut || "--"}</strong>
              </div>
            </div>
            {live ? (
              <div
                className={cn(
                  "rounded-xl border p-4 text-center",
                  confirming
                    ? "border-[#7FBBD8] bg-[#F0F6FA]"
                    : "border-slate-100 bg-slate-50",
                )}
              >
                {confirming && (
                  <p className="mb-2 text-sm font-bold text-[#1B4A7B]">
                    Confirm{" "}
                    {confirming === "PUNCH_OUT" ? "Punch Out" : "Punch In"}
                  </p>
                )}
                <p className="text-xs text-slate-700">
                  {confirming
                    ? "The current time will be saved when you confirm."
                    : "Current time · captured automatically when confirmed"}
                </p>
                <p className="mt-1 text-2xl font-bold text-[#133F66]">
                  {clock.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                {!web.ok && (
                  <p className="mt-2 text-xs text-rose-700">{web.message}</p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    [
                      "Punch In",
                      "requestedPunchIn",
                      type === "PUNCH_IN",
                      record.punchIn,
                    ],
                    [
                      "Punch Out",
                      "requestedPunchOut",
                      type === "PUNCH_OUT",
                      record.punchOut,
                    ],
                  ].map(([label, key, editable, value]) => (
                    <label
                      key={key}
                      className="text-xs font-semibold text-slate-600"
                    >
                      {label}
                      {editable ? " *" : " (recorded)"}
                      {editable ? (
                        <TimePicker
                          value={form[key]}
                          onChange={(value) => update(key, value)}
                          placeholder={`Select ${label}`}
                          minuteStep={1}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 rounded-xl bg-slate-100 p-2.5">
                          {value || "--"}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                <label className="block text-xs font-semibold text-slate-600">
                  Reason *
                  <textarea
                    required
                    rows={3}
                    minLength={formOptions.reasonMin}
                    maxLength={formOptions.reasonMax}
                    value={form.reason}
                    onChange={(event) => update("reason", event.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </label>
              </>
            )}
          </>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={
              confirming && !initialPunchType
                ? () => {
                    setConfirming(null);
                    setError("");
                  }
                : onClose
            }
            className={cn(cancelButtonClass, focusRing)}
          >
            {confirming && !initialPunchType ? "Back" : "Cancel"}
          </button>
          <button
            ref={confirmButtonRef}
            type={confirming ? "button" : "submit"}
            onClick={confirming ? confirmPunch : undefined}
            disabled={isSubmitting || day.isLoading || day.isError || (live ? !web.ok : !type)}
            className={cn(
              submitButtonClass,
              "bg-[#2A5F98] shadow-sm hover:bg-[#1B4A7B] disabled:cursor-not-allowed disabled:bg-slate-300",
              focusRing,
            )}
          >
            {confirming
              ? `Confirm ${confirming === "PUNCH_OUT" ? "Punch Out" : "Punch In"}`
              : live
                ? title
                : "Submit Missed Punch In/Out"}
          </button>
        </div>
      </form>
    </RequestModal>
  );
};

// Upload UI only. The backend matches employee IDs and processes sheet rows.
export const ImportAttendanceModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const selectFile = (event) => {
    const selected = event.target.files?.[0];
    setFile(null);
    setError("");
    setResult(null);
    if (!selected) return;
    if (!/\.(csv|xlsx|xls)$/i.test(selected.name)) {
      setError("Choose a CSV or Excel (.xlsx or .xls) file.");
      event.target.value = "";
      return;
    }
    if (!selected.size || selected.size > 10 * 1024 * 1024) {
      setError("Choose a non-empty file no larger than 10 MB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!file || isSubmitting || result?.ok) return;
    setError("");
    try {
      const response = await onSubmit(file);
      if (!response?.ok) {
        setError(response?.message || "Unable to import the sheet. Please try again.");
        return;
      }
      setResult(response);
    } catch (failure) {
      setError(failure?.message || "Unable to upload the sheet. Please try again.");
    }
  };
  return (
    <RequestModal
      open={open}
      title="Import Attendance"
      subtitle="Super Admin · attendance for multiple employees"
      icon="fa-solid fa-file-import"
      onClose={() => { if (!isSubmitting) onClose(); }}
    >
      <form onSubmit={submit} className="space-y-4 p-4 sm:p-5" aria-busy={isSubmitting}>
        <p className="text-xs leading-5 text-slate-600">
          Upload one sheet containing attendance for any number of employees. Each row is matched using Employee ID, regardless of the employee currently selected on this page.
        </p>
        <div>
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-slate-700">Attendance sheet</label>
          <input
            id={inputId}
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={isSubmitting}
            onChange={selectFile}
            aria-describedby={`${inputId}-help`}
            className="block w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F0F6FA] file:px-3 file:py-2 file:font-semibold file:text-[#1B4A7B] disabled:opacity-50"
          />
          <p id={`${inputId}-help`} className="mt-1 text-[11px] text-slate-500">CSV or Excel · maximum 10 MB</p>
          {file && <p className="mt-2 break-all text-xs font-medium text-slate-700">Selected: {file.name}</p>}
        </div>
        {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
        {result?.ok && (
          <div role="status" className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <p>{result.message || "Attendance import completed."}</p>
            <div className="flex flex-wrap gap-3">
              {[["Imported", result.importedCount], ["Skipped", result.skippedCount], ["Failed", result.failedCount]].map(([label, count]) =>
                count != null ? <span key={label}>{label}: <strong>{count}</strong></span> : null,
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50">{result?.ok ? "Done" : "Cancel"}</button>
          <button type="submit" disabled={!file || isSubmitting || result?.ok} className="inline-flex items-center gap-2 rounded-lg bg-[#1B4A7B] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting && <i aria-hidden="true" className="fa-solid fa-spinner animate-spin" />}
            {isSubmitting ? "Importing…" : "Import Attendance"}
          </button>
        </div>
      </form>
    </RequestModal>
  );
};
