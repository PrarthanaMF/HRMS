import React, { useEffect, useId, useRef, useState } from "react";

import { createPortal } from "react-dom";

import {
  DatePicker,
  TimePicker,
} from "../../Common/DateTimePicker";

import AnimatedGradientText from "../../MagicUI/AnimatedGradientText";
import BorderBeam from "../../MagicUI/BorderBeam";
import { cn } from "./AttendanceUI";
import Icon from "../../Common/Icon";
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

  // "dark": navy header bar, used by every form. "light" keeps the older pale header.
  tone = "dark",

  // Optional wider panel for forms with more to show
  size = "md",
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
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[6px] sm:p-5 [animation:ui-fade_160ms_ease-out_backwards]"
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
        className={`att-request-dialog glass-strong relative flex max-h-[92dvh] w-full ${size === "lg" ? "max-w-[640px]" : "max-w-[600px]"} flex-col overflow-hidden rounded-2xl shadow-[var(--shadow-pop)] outline-none [animation:ui-pop_220ms_var(--ease-out)_backwards]`}
      >
        {tone !== "dark" && <BorderBeam />}
        {tone === "dark" ? (
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#0e2a47] via-[#163a58] to-[#1f4e6b] px-4 py-3.5 sm:px-5">
            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#9fb8c9]/20 blur-3xl" />
            <div className="relative flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="flex items-center gap-2 text-[17px] font-semibold leading-6 text-white">
                  <Icon className={`${icon} text-[18px] text-[#cfdce5]`} />
                  <span className="min-w-0 break-words">{title}</span>
                </h2>
                {subtitle && <p className="mt-0.5 text-[12px] leading-4 text-slate-300">{subtitle}</p>}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => onCloseRef.current?.()}
                className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20", focusRing)}
              >
                <Icon className="fa-solid fa-xmark text-[16px]" />
              </button>
            </div>
          </header>
        ) : (
        <header className="relative shrink-0 overflow-hidden border-b border-[#dce6ed]/60 bg-gradient-to-r from-[#f2f5f7]/80 to-[#f2f5f7]/60 px-3 py-3 sm:px-5 sm:py-4">
          <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_44px] items-start gap-2 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f4e6b] to-[#1f4e6b] text-white shadow-sm ">
              <Icon className={`${icon} text-sm`} />
            </span>

            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[15px] font-extrabold leading-5 tracking-[-.015em] text-slate-900 sm:text-[16px]"
              >
                <AnimatedGradientText
                  className="max-w-full whitespace-normal break-words"
                  colorFrom="#1f4e6b"
                  colorTo="#2b6485"
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
        )}

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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2";

const labelClass = "mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500";

const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus:border-[#2b6485] focus:ring-2 focus:ring-[#2b6485]/25";

const cancelButtonClass =
  "press h-11 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50";

const submitButtonClass =
  "press gradient-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(8_26_46/0.95)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700"
    >
      <Icon className="fa-solid fa-circle-exclamation text-xs" />

      <span>{message}</span>
    </div>
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
              focusRing,
            )}
          >
            <Icon className="fa-regular fa-paper-plane text-xs" />
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
          <div className="overflow-hidden rounded-xl border border-[#cfdce5] bg-[#f2f5f7]">
            <div className="border-b border-[#dce6ed] bg-white/80 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b6485]">
                Attendance confirmation
              </p>
              <p className="mt-1 text-sm font-semibold text-[#081a2e]">
                {confirming === "PUNCH_OUT"
                  ? "Record Punch Out"
                  : "Record Punch In"}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Employee</dt>
                <dd className="mt-0.5 font-semibold text-[#163a58]">
                  {employee?.name || user?.name || "--"}{" "}
                  <span className="font-normal text-slate-500">
                    ({employee?.empId || user?.empId || "--"})
                  </span>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Attendance date</dt>
                <dd className="mt-0.5 font-semibold text-[#163a58]">
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
                <dd className="mt-0.5 font-semibold text-[#163a58]">
                  {record.punchIn || "--"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Recorded Punch Out</dt>
                <dd className="mt-0.5 font-semibold text-[#163a58]">
                  {record.punchOut || "--"}
                </dd>
              </div>
            </dl>
            <div className="border-t border-[#dce6ed] px-4 py-3 text-center">
              <p className="text-xs text-slate-600">
                Current time · final time captured when you confirm
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1f4e6b]">
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
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-xs">
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
                    ? "border-[#9fb8c9] bg-[#f2f5f7]"
                    : "border-slate-200/80 bg-white",
                )}
              >
                {confirming && (
                  <p className="mb-2 text-sm font-bold text-[#1f4e6b]">
                    Confirm{" "}
                    {confirming === "PUNCH_OUT" ? "Punch Out" : "Punch In"}
                  </p>
                )}
                <p className="text-xs text-slate-700">
                  {confirming
                    ? "The current time will be saved when you confirm."
                    : "Current time · captured automatically when confirmed"}
                </p>
                <p className="mt-1 text-2xl font-bold text-[#163a58]">
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
