import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "hrms_notifications";

// ============================================================
// LOCAL STORAGE
// ============================================================

const loadNotifications = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load notifications:", error);

    return [];
  }
};

const persistNotifications = (items) => {
  try {
    if (!items.length) {
      /*
        Nothing is left, so remove the key entirely
        instead of storing [].
      */
      localStorage.removeItem(STORAGE_KEY);

      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to persist notifications:", error);
  }
};

// ============================================================
// SLICE
// ============================================================

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    items: loadNotifications(),
  },

  reducers: {
    // ======================================================
    // ADD
    // ======================================================

    addNotification: (state, action) => {
      const notification = action.payload;

      if (!notification?.id || !notification?.recipientEmpId) {
        return;
      }

      const exists = state.items.some((item) => item.id === notification.id);

      if (exists) {
        return;
      }

      state.items.unshift({
        ...notification,

        /*
            New notifications are always unread.
          */
        isRead: false,
      });

      persistNotifications(state.items);
    },

    // ======================================================
    // READ ONE
    // ======================================================

    /*
        Reading a notification now REMOVES it completely.

        This removes it from:
          - Redux
          - notification bell
          - localStorage
      */
    markNotificationRead: (state, action) => {
      const notificationId = action.payload;

      state.items = state.items.filter((item) => item.id !== notificationId);

      persistNotifications(state.items);
    },

    // ======================================================
    // READ ALL FOR CURRENT EMPLOYEE
    // ======================================================

    /*
        Mark All Read now means:
        remove all notifications belonging to
        the currently logged-in employee.

        Notifications belonging to other employees
        are preserved.
      */
    markAllNotificationsRead: (state, action) => {
      const employeeId = String(action.payload ?? "");

      state.items = state.items.filter(
        (item) => String(item.recipientEmpId ?? "") !== employeeId,
      );

      persistNotifications(state.items);
    },

    // ======================================================
    // CLEAR ONE EMPLOYEE
    // ======================================================

    clearNotificationsForEmployee: (state, action) => {
      const employeeId = String(action.payload ?? "");

      state.items = state.items.filter(
        (item) => String(item.recipientEmpId ?? "") !== employeeId,
      );

      persistNotifications(state.items);
    },

    // ======================================================
    // CLEAR EVERYTHING
    // ======================================================

    clearAllNotifications: (state) => {
      state.items = [];

      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

// ============================================================
// ACTIONS
// ============================================================

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotificationsForEmployee,
  clearAllNotifications,
} = notificationSlice.actions;

// ============================================================
// SELECTORS
// ============================================================

export const selectNotifications = (state) => state.notifications?.items || [];

export const selectNotificationsForEmployee = (state, employeeId) =>
  (state.notifications?.items || []).filter(
    (item) => String(item.recipientEmpId ?? "") === String(employeeId ?? ""),
  );

export const selectUnreadNotificationCount = (state, employeeId) =>
  (state.notifications?.items || []).filter(
    (item) => String(item.recipientEmpId ?? "") === String(employeeId ?? ""),
  ).length;

// ============================================================
// REDUCER
// ============================================================

export default notificationSlice.reducer;
