import React, { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
} from "../../Store/Redux/Notifications/NotificationSlice";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ============================================================
// NOTIFICATION VISUALS
// ============================================================

const getNotificationVisual = (type) => {
  switch (type) {
    case "ATTENDANCE_LEAVE_APPROVAL_REQUIRED":
      return {
        icon: "fa-regular fa-calendar-check",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        unreadBg: "bg-blue-50/60",
      };

    case "ATTENDANCE_PUNCH_APPROVAL_REQUIRED":
      return {
        icon: "fa-regular fa-clock",
        iconBg: "bg-amber-100",
        iconText: "text-amber-700",
        unreadBg: "bg-amber-50/60",
      };

    case "ATTENDANCE_WFH_APPROVAL_REQUIRED":
      return {
        icon: "fa-solid fa-house-laptop",
        iconBg: "bg-violet-100",
        iconText: "text-violet-700",
        unreadBg: "bg-violet-50/60",
      };

    case "ATTENDANCE_REQUEST_APPROVED":
      return {
        icon: "fa-solid fa-circle-check",
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
        unreadBg: "bg-emerald-50/50",
      };

    case "ATTENDANCE_REQUEST_REJECTED":
      return {
        icon: "fa-solid fa-circle-xmark",
        iconBg: "bg-rose-100",
        iconText: "text-rose-600",
        unreadBg: "bg-rose-50/50",
      };

    /*
      Backward compatibility with notifications
      already created using the previous generic type.
    */
    case "ATTENDANCE_APPROVAL_REQUIRED":
      return {
        icon: "fa-solid fa-user-check",
        iconBg: "bg-violet-100",
        iconText: "text-violet-600",
        unreadBg: "bg-violet-50/50",
      };

    default:
      return {
        icon: "fa-regular fa-bell",
        iconBg: "bg-slate-100",
        iconText: "text-slate-500",
        unreadBg: "bg-blue-50/50",
      };
  }
};

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

const NotificationBell = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.value);

  const allNotifications = useSelector(selectNotifications);

  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState(null);

  // ==========================================================
  // INDIVIDUAL USER NOTIFICATIONS
  // ==========================================================

  const notifications = useMemo(() => {
    if (!user?.empId) {
      return [];
    }

    return [...allNotifications]
      .filter((item) => String(item.recipientEmpId ?? "") === String(user.empId))
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
  }, [allNotifications, user?.empId]);

  const unread = notifications.length;

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
      dispatch(markNotificationRead(notification.id));
    }

    setOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
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
            "relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200",
            "hover:bg-slate-100 hover:text-slate-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          )}
        >
          <i
            className={cn(
              "text-[14px]",
              unread > 0
                ? "fa-solid fa-bell text-slate-700"
                : "fa-regular fa-bell",
            )}
          />

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
            className="fixed z-[100000] flex flex-col overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,.22)] backdrop-blur-xl"
            style={{
              top: position.top,

              left: position.left,

              width: position.width,

              maxHeight: position.maxHeight,
            }}
          >
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <i className="fa-regular fa-bell text-[10px]" />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-extrabold text-slate-800">
                      Notifications
                    </h3>

                    {unread > 0 && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                        {unread}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Notifications for {user?.name || "you"}
                  </p>
                </div>
              </div>

              {unread > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch(markAllNotificationsRead(user?.empId))
                  }
                  className="shrink-0 rounded-lg px-2 py-1.5 text-[9px] font-bold text-blue-600 transition hover:bg-blue-50"
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
                    <i className="fa-regular fa-bell-slash text-[14px]" />
                  </span>

                  <p className="mt-3 text-[11px] font-bold text-slate-600">
                    No new notifications
                  </p>

                  <p className="mt-1 text-[9.5px] leading-4 text-slate-400">
                    New attendance updates will appear here.
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
                      "group relative flex w-full items-start border-b border-slate-100 px-3.5 py-3 text-left transition last:border-b-0",

                      notification.isRead
                        ? "bg-white hover:bg-slate-50"
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
                      <i className={`${visual.icon} text-[10px]`} />
                    </span>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1 pl-2.5 pr-5">
                      <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 break-words text-[10.5px] font-extrabold leading-4 text-slate-800">
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-1 break-words text-[9.5px] leading-[15px] text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[8.5px] font-medium text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>

                        {!notification.isRead && (
                          <span className="text-[8px] font-bold text-blue-500">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition group-hover:text-blue-500">
                      <i className="fa-solid fa-chevron-right text-[7px]" />
                    </span>
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