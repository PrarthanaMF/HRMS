import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  REQUEST_STATUS,
  REQUEST_TYPES,
  ATTENDANCE_STATUS,
  to12HourTime,
} from "../Utils/attendance";

import {
  useAttendanceAccess,
  useAttendanceApprovals,
  useAttendanceRequests,
} from "../Hooks/useAttendance";

import { RequestModal } from "../Components/Pages/Attendance/AttendanceForms";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getRequestTypeLabel = (request) => {
  if (request.type === REQUEST_TYPES.LEAVE) {
    return "Leave Request";
  }

  if (request.type === REQUEST_TYPES.WFH) {
    return "Work From Home";
  }

  if (request.type === REQUEST_TYPES.MISSED_PUNCH) {
    return "Missed Punch";
  }

  return "Attendance Request";
};

const getStatusTone = (status) => {
  switch (status) {
    case REQUEST_STATUS.APPROVED:
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: "fa-solid fa-circle-check",
      };

    case REQUEST_STATUS.REJECTED:
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: "fa-solid fa-circle-xmark",
      };

    case REQUEST_STATUS.PENDING:
    default:
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "fa-regular fa-clock",
      };
  }
};

const StatusBadge = ({ status }) => {
  const tone = getStatusTone(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[.08em]",
        tone.bg,
        tone.text,
        tone.border,
      )}
    >
      <i className={`${tone.icon} text-xs`} />
      {status}
    </span>
  );
};

const MetaItem = ({ icon, label, value, valueClassName = "" }) => (
  <div className="min-w-0">
    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.08em] text-slate-400">
      {icon && <i className={`${icon} text-xs`} />}
      {label}
    </p>

    <p
      className={cn(
        "truncate text-sm font-semibold text-slate-700",
        valueClassName,
      )}
      title={String(value ?? "")}
    >
      {value || "--"}
    </p>
  </div>
);

const RequestDetails = ({ request, attendanceRecord }) => {
  if (request.type === REQUEST_TYPES.LEAVE) {
    const { from, to, leaveType, duration, reason } = request.payload || {};

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaItem
            icon="fa-regular fa-calendar"
            label="From"
            value={formatDate(from)}
          />

          <MetaItem
            icon="fa-regular fa-calendar"
            label="To"
            value={formatDate(to)}
          />

          <MetaItem
            icon="fa-solid fa-layer-group"
            label="Leave Type"
            value={leaveType}
          />

          <MetaItem
            icon="fa-regular fa-clock"
            label="Duration"
            value={
              duration === "FIRST_HALF"
                ? "First Half"
                : duration === "SECOND_HALF"
                  ? "Second Half"
                  : "Full Day"
            }
          />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.08em] text-slate-400">
            Reason
          </p>

          <p className="whitespace-pre-wrap text-xs font-medium leading-5 text-slate-700">
            {reason || "--"}
          </p>
        </div>
      </div>
    );
  }

  if (request.type === REQUEST_TYPES.WFH) {
    const { from, to, reason } = request.payload || {};

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetaItem
            icon="fa-regular fa-calendar"
            label="From"
            value={formatDate(from)}
          />

          <MetaItem
            icon="fa-regular fa-calendar"
            label="To"
            value={formatDate(to)}
          />

          <MetaItem
            icon="fa-solid fa-coins"
            label="Payable Rule"
            value="0.5 day / applicable WFH date"
          />
        </div>

        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.08em] text-violet-500">
            Reason / Work Plan
          </p>

          <p className="whitespace-pre-wrap text-xs font-medium leading-5 text-slate-700">
            {reason || "--"}
          </p>
        </div>
      </div>
    );
  }

  if (request.type === REQUEST_TYPES.MISSED_PUNCH) {
    const { date, missingType, requestedPunchIn, requestedPunchOut, reason } =
      request.payload || {};

    const currentStatus =
      attendanceRecord?.statusCode &&
        ATTENDANCE_STATUS[attendanceRecord.statusCode]
        ? `${ATTENDANCE_STATUS[attendanceRecord.statusCode].label
        } (${attendanceRecord.statusCode})`
        : attendanceRecord?.statusCode || "--";

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.08em] text-slate-400">
              <i className="fa-solid fa-database text-xs" />
              Current Attendance
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MetaItem label="Date" value={formatDate(date)} />

              <MetaItem label="Status" value={currentStatus} />

              <MetaItem
                label="Punch In"
                value={attendanceRecord?.punchIn || "--"}
              />

              <MetaItem
                label="Punch Out"
                value={attendanceRecord?.punchOut || "--"}
              />
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.08em] text-blue-500">
              <i className="fa-solid fa-pen-to-square text-xs" />
              Requested Change
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MetaItem
                label="Missing"
                value={
                  missingType === "PUNCH_IN"
                    ? "Punch In"
                    : missingType === "PUNCH_OUT"
                      ? "Punch Out"
                      : "Both"
                }
              />

              <MetaItem label="Date" value={formatDate(date)} />

              <MetaItem
                label="Requested In"
                value={requestedPunchIn ? to12HourTime(requestedPunchIn) : "--"}
              />

              <MetaItem
                label="Requested Out"
                value={
                  requestedPunchOut ? to12HourTime(requestedPunchOut) : "--"
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.08em] text-slate-400">
            Reason
          </p>

          <p className="whitespace-pre-wrap text-xs font-medium leading-5 text-slate-700">
            {reason || "--"}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const RequestCard = ({
  request,
  attendanceRecord,
  mode,
  onApprove,
  onReject,
}) => {
  const isPending = request.status === REQUEST_STATUS.PENDING;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,.05)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-white px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                {getRequestTypeLabel(request)}
              </h3>

              <StatusBadge status={request.status} />
            </div>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Request #{request.id}
            </p>
          </div>

          {mode === "approval" && (
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold text-slate-800">
                {request.employeeName}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {request.employeeId}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <RequestDetails request={request} attendanceRecord={attendanceRecord} />

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem
            icon="fa-regular fa-paper-plane"
            label="Submitted"
            value={formatDateTime(request.submittedAt)}
          />

          <MetaItem
            icon="fa-solid fa-user-check"
            label="Assigned Approver"
            value={request.approverName || request.approverEmpId || "--"}
          />

          {request.status !== REQUEST_STATUS.PENDING && (
            <>
              <MetaItem
                icon="fa-solid fa-user-shield"
                label="Decision By"
                value={
                  request.decisionByName || request.decisionByEmpId || "--"
                }
              />

              <MetaItem
                icon="fa-regular fa-clock"
                label="Decision At"
                value={formatDateTime(request.decisionAt)}
              />
            </>
          )}
        </div>

        {request.decisionRemark && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-[.08em] text-slate-400">
              Decision Remark
            </p>

            <p className="whitespace-pre-wrap text-xs font-medium leading-5 text-slate-700">
              {request.decisionRemark}
            </p>
          </div>
        )}

        {mode === "approval" && isPending && (
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onReject(request)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <i className="fa-solid fa-xmark text-xs" />
              Reject
            </button>

            <button
              type="button"
              onClick={() => onApprove(request)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_5px_14px_rgba(5,150,105,.18)] transition hover:bg-emerald-700"
            >
              <i className="fa-solid fa-check text-xs" />
              Approve
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

const EmptyState = ({ icon, title, message }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <i className={`${icon} text-[16px]`} />
    </span>

    <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>

    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
      {message}
    </p>
  </div>
);

const PageHeader = ({ title, subtitle, icon, onBack }) => (
  <div className="mb-5 flex justify-between gap-3">
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b2a4a] text-white">
        <i className={`${icon} text-xs`} />
      </span>

      <div>
        <h1 className="text-[17px] font-black tracking-[-.02em] text-slate-900">
          {title}
        </h1>

        <p className="mt-1 text-xs leading-4 text-slate-500">{subtitle}</p>
      </div>
    </div>
    {onBack && (
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0b2a4a79] bg-white text-[#0b2a4a] transition hover:bg-slate-50 hover:text-slate-800"
      >
        <i className="fa-solid fa-arrow-left text-xs" />
      </button>
    )}
  </div>
);

const SectionTitle = ({ title, count, icon }) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <i className={`${icon} text-xs`} />
    </span>

    <h2 className="text-xs font-extrabold text-slate-800">{title}</h2>

    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
      {count}
    </span>
  </div>
);

// ============================================================
// MY REQUESTS
// ============================================================

export const AttendanceRequestsPage = () => {
  const navigate = useNavigate();

  const { myRequests, isLoading, error } = useAttendanceRequests();

  return (
    <main className="min-h-full bg-slate-50/60 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1200px]">
        <PageHeader
          title="My Attendance Requests"
          subtitle="Track leave, WFH and missed-punch requests, assigned approvers, and decision history."
          icon="fa-regular fa-file-lines"
          onBack={() => navigate("/attendance")}
        />

        {isLoading ? <p role="status" className="text-sm text-slate-500">Loading requests…</p> : error ? <p role="alert" className="text-sm text-rose-700">{error.message}</p> : !myRequests.length ? (
          <EmptyState
            icon="fa-regular fa-folder-open"
            title="No attendance requests"
            message="Leave and missed-punch requests you submit will appear here."
          />
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <RequestCard key={request.id} request={request} mode="request" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

// ============================================================
// APPROVALS
// ============================================================

export const AttendanceApprovalsPage = () => {
  const { formOptions = {} } = useAttendanceAccess();
  const navigate = useNavigate();

  const {
    pendingApprovals,
    processedApprovals,
    decideRequest,
    getAttendanceRecordForRequest,
    pendingApprovalCount,
    processedApprovalCount,
    isLoading,
    error: loadError,
    isSubmitting,
  } = useAttendanceApprovals();

  const [decision, setDecision] = useState(null);

  const [remark, setRemark] = useState("");

  const [error, setError] = useState("");

  const openDecision = (request, status) => {
    setDecision({
      request,
      status,
    });

    setRemark("");
    setError("");
  };

  const closeDecision = () => {
    setDecision(null);
    setRemark("");
    setError("");
  };

  const submitDecision = async () => {
    if (!decision?.request) {
      return;
    }

    const result = await decideRequest(decision.request.id, decision.status, remark);

    if (!result?.ok) {
      setError(result?.message || "Unable to process request.");
      return;
    }

    closeDecision();
  };

  const decisionLabel =
    decision?.status === REQUEST_STATUS.APPROVED
      ? "Approve Request"
      : "Reject Request";

  const decisionSubtitle =
    decision?.status === REQUEST_STATUS.APPROVED
      ? "Confirm that this attendance request should be approved."
      : "Confirm that this attendance request should be rejected.";

  const decisionIcon =
    decision?.status === REQUEST_STATUS.APPROVED
      ? "fa-solid fa-circle-check"
      : "fa-solid fa-circle-xmark";

  const pendingCards = useMemo(
    () =>
      pendingApprovals.map((request) => ({
        request,
        attendanceRecord: getAttendanceRecordForRequest(request),
      })),
    [pendingApprovals, getAttendanceRecordForRequest],
  );

  const processedCards = useMemo(
    () =>
      processedApprovals.map((request) => ({
        request,
        attendanceRecord: getAttendanceRecordForRequest(request),
      })),
    [processedApprovals, getAttendanceRecordForRequest],
  );

  return (
    <main className="min-h-full bg-slate-50/60 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1200px]">
        <PageHeader
          title="Attendance Approvals"
          subtitle="Review pending attendance requests and maintain an auditable history of processed requests."
          icon="fa-solid fa-user-check"
          onBack={() => navigate("/attendance")}
        />

        <section className="mb-6">
          <SectionTitle
            title="Pending Requests"
            count={pendingApprovalCount}
            icon="fa-regular fa-clock"
          />

          {isLoading ? <p role="status" className="text-sm text-slate-500">Loading approvals…</p> : loadError ? <p role="alert" className="text-sm text-rose-700">{loadError.message}</p> : !pendingCards.length ? (
            <EmptyState
              icon="fa-solid fa-check-double"
              title="No pending approvals"
              message="There are currently no attendance requests waiting for your decision."
            />
          ) : (
            <div className="space-y-3">
              {pendingCards.map(({ request, attendanceRecord }) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  attendanceRecord={attendanceRecord}
                  mode="approval"
                  onApprove={(item) =>
                    openDecision(item, REQUEST_STATUS.APPROVED)
                  }
                  onReject={(item) =>
                    openDecision(item, REQUEST_STATUS.REJECTED)
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle
            title="Processed Requests"
            count={processedApprovalCount}
            icon="fa-solid fa-clock-rotate-left"
          />

          {isLoading || loadError ? null : !processedCards.length ? (
            <EmptyState
              icon="fa-solid fa-clock-rotate-left"
              title="No processed requests"
              message="Approved and rejected attendance requests will remain visible here for reference."
            />
          ) : (
            <div className="space-y-3">
              {processedCards.map(({ request, attendanceRecord }) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  attendanceRecord={attendanceRecord}
                  mode="approval"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <RequestModal
        open={Boolean(decision)}
        title={decisionLabel}
        subtitle={decisionSubtitle}
        icon={decisionIcon}
        onClose={closeDecision}
      >
        <div className="p-4 sm:p-5">
          {decision?.request && (
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">Request</p>

              <p className="mt-1 text-xs font-extrabold text-slate-800">
                {getRequestTypeLabel(decision.request)}
                {" · "}
                {decision.request.employeeName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                #{decision.request.id}
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600"
            >
              <i className="fa-solid fa-circle-exclamation text-xs" />
              {error}
            </div>
          )}

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[.08em] text-slate-400">
                Remark
              </span>

              <span className="text-xs font-semibold text-slate-400">
                {remark.length}/{formOptions.remarkMax ?? "—"}
              </span>
            </div>

            <textarea
              data-autofocus
              rows={4}
              maxLength={formOptions.remarkMax}
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder={
                decision?.status === REQUEST_STATUS.REJECTED
                  ? "Add a reason for rejection"
                  : "Optional approval remark"
              }
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,.08)]"
            />
          </label>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDecision}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={submitDecision}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition",
                decision?.status === REQUEST_STATUS.APPROVED
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700",
              )}
            >
              <i
                className={
                  decision?.status === REQUEST_STATUS.APPROVED
                    ? "fa-solid fa-check text-xs"
                    : "fa-solid fa-xmark text-xs"
                }
              />

              {decision?.status === REQUEST_STATUS.APPROVED
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </RequestModal>
    </main>
  );
};

export default AttendanceRequestsPage;