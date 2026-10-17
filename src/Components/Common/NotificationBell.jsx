import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

import Icon from "./Icon";
const cn = (...classes) => classes.filter(Boolean).join(" ");

// In-app notifications come from the backend (GET /api/notifications); each user sees only their own
const REFRESH_MS = 60 * 1000;

// Where a notification takes you
const LINKS = {
  APPROVAL_NEEDED: "/attendance/applications",
  REMINDER_APPROVALS: "/attendance/applications",
  REQUEST_PROGRESS: "/attendance/requests",
  REQUEST_APPROVED: "/attendance/requests",
  REQUEST_REJECTED: "/attendance/requests",
  REQUEST_CANCELLED: "/attendance/requests",
  REQUEST_RAISED_FOR_YOU: "/attendance/requests",
  REMINDER_MISSING_PUNCH: "/attendance",
  REMINDER_COMP_OFF_EXPIRY: "/attendance",
};

const toItem = (notification) => ({
  id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  createdAt: notification.createdAt,
  isRead: Boolean(notification.readAt),
  link: LINKS[notification.type],
});

// ============================================================
// NOTIFICATION VISUALS
// ============================================================

const VISUALS = {
  approval: { icon: "fa-solid fa-user-check", iconBg: "bg-violet-100", iconText: "text-violet-600", unreadBg: "bg-violet-50/50" },
  reminder: { icon: "fa-regular fa-clock", iconBg: "bg-amber-100", iconText: "text-amber-700", unreadBg: "bg-amber-50/60" },
  compOff: { icon: "fa-solid fa-arrow-rotate-left", iconBg: "bg-amber-100", iconText: "text-amber-700", unreadBg: "bg-amber-50/60" },
  progress: { icon: "fa-regular fa-calendar-check", iconBg: "bg-blue-100", iconText: "text-blue-600", unreadBg: "bg-blue-50/60" },
  approved: { icon: "fa-solid fa-circle-check", iconBg: "bg-emerald-100", iconText: "text-emerald-600", unreadBg: "bg-emerald-50/50" },
  rejected: { icon: "fa-solid fa-circle-xmark", iconBg: "bg-rose-100", iconText: "text-rose-600", unreadBg: "bg-rose-50/50" },
  other: { icon: "fa-regular fa-bell", iconBg: "bg-slate-100", iconText: "text-slate-500", unreadBg: "bg-blue-50/50" },
};

const VISUAL_BY_TYPE = {
  APPROVAL_NEEDED: "approval",
  REMINDER_APPROVALS: "reminder",
  REMINDER_MISSING_PUNCH: "reminder",
  REMINDER_COMP_OFF_EXPIRY: "compOff",
  REQUEST_PROGRESS: "progress",
  REQUEST_RAISED_FOR_YOU: "progress",
  REQUEST_APPROVED: "approved",
  REQUEST_REJECTED: "rejected",
  REQUEST_CANCELLED: "rejected",
};

const getNotificationVisual = (type) => VISUALS[VISUAL_BY_TYPE[type] || "other"];

const formatNotificationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;

  const hour = 60 * minute;

  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)}d ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

// ============================================================
// COMPONENT
// ============================================================

const NotificationBell = ({ onDark = false }) => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.value);

  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [unread, setUnread] = useState(0);

  // ==========================================================
  // LOAD FROM THE BACKEND
  // ==========================================================

  // Latest 20 (read and unread) plus the unread total
  const load = useCallback(() => {
    api
      .get("/notifications", { limit: 20 })
      .then((data) => {
        setNotifications(data.notifications.map(toItem));
        setUnread(data.unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?._id) return undefined;
    // Notifications used to live in this browser's storage; that copy is no longer used
    try {
      localStorage.removeItem("hrms_notifications");
    } catch {
      // storage unavailable
    }
    load();
    const timer = window.setInterval(() => {
      api.get("/notifications/unread-count").then((data) => setUnread(data.unread)).catch(() => {});
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [user?._id, load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // ==========================================================
  // RESPONSIVE POPOVER POSITION
  // ==========================================================

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return undefined;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();

      const viewportWidth = window.innerWidth;

      const viewportHeight = window.innerHeight;

      const gutter = 12;
      const gap = 8;

      const width = Math.min(380, viewportWidth - gutter * 2);

      let left;

      if (viewportWidth < 640) {
        left = Math.max(gutter, (viewportWidth - width) / 2);
      } else {
        left = rect.right - width;

        left = Math.max(gutter, Math.min(left, viewportWidth - width - gutter));
      }

      const top = rect.bottom + gap;

      const availableHeight = Math.max(120, viewportHeight - top - gutter);

      const maxHeight = Math.min(520, availableHeight);

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
  }, [open]);

  // ==========================================================
  // CLOSE
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutside = (event) => {
      const target = event.target;

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (popupRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);

      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // ==========================================================
  // OPEN NOTIFICATION
  // ==========================================================

  const openNotification = (notification) => {
    if (!notification.isRead) {
      setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)));
      setUnread((count) => Math.max(0, count - 1));
      api.patch(`/notifications/${notification.id}/read`).catch(() => {});
    }

    setOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    setUnread(0);
    api.patch("/notifications/read-all").catch(() => {});
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ================= BELL ================= */}

      <div ref={triggerRef} className="relative shrink-0">
        <button
          type="button"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2",
            onDark
              ? "border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/10 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
          )}
        >
          <Icon
            className={cn(
              "text-[14px]",
              unread > 0
                ? cn("fa-solid fa-bell origin-top [animation:notif-ring_2.4s_ease-in-out_infinite]", !onDark && "text-slate-700")
                : "fa-regular fa-bell",
            )} />

          {unread > 0 && (
            <>
              <span className="absolute right-[5px] top-[5px] h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />

              <span className="absolute -right-1 -top-1 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[7px] font-extrabold leading-none text-white shadow-sm">
                {unread > 99 ? "99+" : unread}
              </span>
            </>
          )}
        </button>
      </div>

      {/* ================= POPOVER ================= */}

      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label="Notifications"
            className="popover fixed z-[100000] flex flex-col overflow-hidden rounded-2xl shadow-[var(--shadow-pop)] [animation:ui-pop_180ms_var(--ease-out)_backwards]"
            style={{
              top: position.top,

              left: position.left,

              width: position.width,

              maxHeight: position.maxHeight,
            }}
          >
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#f2f5f7] to-white/60 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white">
                  <Icon className="fa-regular fa-bell text-[16px]" />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-[var(--ink)]">
                      Notifications
                    </h3>

                    {unread > 0 && (
                      <span className="rounded-md bg-[#dce6ed] px-1.5 py-0.5 text-[11px] font-semibold text-[#1f4e6b]">
                        {unread}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Notifications for {user?.name || "you"}
                  </p>
                </div>
              </div>

              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="press shrink-0 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-[#1f4e6b] hover:bg-[#dce6ed]"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {!notifications.length && (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon className="fa-regular fa-bell-slash text-[20px]" />
                  </span>

                  <p className="mt-3 text-[14px] font-semibold text-slate-700">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-slate-500">
                    Approvals, decisions on your requests and reminders will appear here.
                  </p>
                </div>
              )}

              {notifications.map((notification) => {
                const visual = getNotificationVisual(notification.type);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={cn(
                      "press group relative flex w-full items-start border-b border-slate-100/80 px-4 py-3 text-left last:border-b-0",

                      notification.isRead
                        ? "bg-transparent hover:bg-[#f2f5f7]/70"
                        : `${visual.unreadBg} hover:brightness-[.985]`,
                    )}
                  >
                    {/* ICON */}

                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",

                        notification.isRead
                          ? "bg-slate-100 text-slate-400"
                          : `${visual.iconBg} ${visual.iconText}`,
                      )}
                    >
                      <Icon className={`${visual.icon} text-[16px]`} />
                    </span>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1 pl-2.5 pr-5">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-5 text-[var(--ink)]">
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-0.5 break-words text-[12px] leading-5 text-slate-600">
                        {notification.message}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>

                        {!notification.isRead && (
                          <span className="text-[11px] font-semibold text-[#1f4e6b]">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default NotificationBell;