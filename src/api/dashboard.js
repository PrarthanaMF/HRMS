// Dashboard figures from the live endpoints. HR roles see the company; everyone else sees their own
// attendance and requests, since the company-wide endpoints are HR-only.
import { api } from "./client";
import { context, report } from "./attendance";
import { SALARY_ROLES } from "./employees";
import { HR_ROLES } from "../Utils/roles";

const optional = (promise, fallback) => promise.catch(() => fallback);
const total = (promise) => optional(promise.then((data) => data.pagination?.total ?? 0), null);

// Count of attendance records with one status on one day (HR only)
const attendanceCount = (date, status) => total(api.get("/attendance", { from: date, to: date, status, limit: 1 }));

// Sum of annual CTC over active employees: monthly gross × 12, 100 employees a page
const annualCtc = async () => {
  let page = 1;
  let pages = 1;
  let sum = 0;
  let known = 0;
  while (page <= pages) {
    const data = await api.get("/employees", { page, limit: 100, isActive: "true" });
    for (const employee of data.employees) {
      if (employee.salary?.grossSalary != null) {
        sum += Number(employee.salary.grossSalary) * 12;
        known += 1;
      }
    }
    pages = data.pagination?.pages ?? 1;
    page += 1;
  }
  return { amount: sum, employees: known };
};

// ₹ in lakh / crore, as payroll reads it
export const formatInr = (amount) => {
  if (amount == null) return "—";
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

const pct = (part, whole) => (part && whole ? `${Math.round((part / whole) * 100)}% of the workforce` : "");

const companyStats = async ({ viewer, today }) => {
  const [active, inactive, present, wfh, onLeave, ctc] = await Promise.all([
    total(api.get("/employees", { limit: 1, isActive: "true" })),
    total(api.get("/employees", { limit: 1, isActive: "false" })),
    attendanceCount(today, "PRESENT"),
    attendanceCount(today, "WFH"),
    attendanceCount(today, "APPROVED_LEAVE"),
    SALARY_ROLES.includes(viewer.role) ? optional(annualCtc(), null) : null,
  ]);
  const presentToday = present == null ? null : present + (wfh || 0);
  return [
    { key: "employees", icon: "fa-solid fa-users", name: "Total employees", value: active, note: inactive ? `${inactive} inactive` : "All active", tone: "sky", to: "/workforce" },
    ctc && { key: "ctc", icon: "fa-solid fa-indian-rupee-sign", name: "Current CTC", value: ctc.amount, format: formatInr, note: `Annual, across ${ctc.employees} employees`, tone: "navy", to: "/workforce" },
    { key: "present", icon: "fa-solid fa-calendar-days", name: "Present today", value: presentToday, note: presentToday == null ? "" : pct(presentToday, active) || "No attendance recorded for today yet", tone: "sage", to: "/attendance" },
    { key: "leave", icon: "fa-solid fa-plane", name: "On leave today", value: onLeave, note: onLeave == null ? "" : pct(onLeave, active) || "No approved leave today", tone: "rose", to: "/attendance/applications" },
  ].filter(Boolean);
};

const personalStats = async ({ viewer, access, today }) => {
  const self = access.employee;
  const monthStart = `${today.slice(0, 7)}-01`;
  const [pending, approvals, balances, month] = await Promise.all([
    total(api.get("/attendance/requests/mine", { status: "PENDING", limit: 1 })),
    optional(api.get("/attendance/requests/approvals/count").then((data) => data.pending), null),
    optional(api.get("/leave-balances").then((data) => data.balances || []), []),
    self ? optional(report({ viewer, employeeId: self.empId, from: monthStart, to: today }), null) : null,
  ]);
  const leaveLeft = balances.filter((row) => row.limited).reduce((sum, row) => sum + (row.available || 0), 0);
  const summary = month?.summary || {};
  const present = (summary.present || 0) + (summary.wfh || 0) + (summary.halfDay || 0);
  return [
    { key: "pending", icon: "fa-regular fa-clock", name: "My pending requests", value: pending, note: "Waiting for approval", tone: "sky", to: "/attendance/requests" },
    access.canAccessApprovals && { key: "approvals", icon: "fa-solid fa-list-check", name: "Approvals waiting", value: approvals, note: "On your decision", tone: "navy", to: "/attendance/applications" },
    { key: "present", icon: "fa-solid fa-calendar-days", name: "Present this month", value: month ? present : null, note: summary.attendancePercentage != null ? `${summary.attendancePercentage}% attendance` : "", tone: "sage", to: "/attendance" },
    { key: "balance", icon: "fa-solid fa-plane", name: "Leave available", value: balances.length ? leaveLeft : null, note: balances.length ? "Across your leave types" : "No leave balances yet", tone: "rose", to: "/attendance/requests" },
  ].filter(Boolean);
};

// Requests by status: the ones you decide on (approvers) or your own (everyone else)
const requestsByStatus = async ({ access }) => {
  const path = access.canAccessApprovals ? "/attendance/requests/approvals" : "/attendance/requests/mine";
  const [pending, approved, rejected] = await Promise.all(["PENDING", "APPROVED", "REJECTED"].map((status) => total(api.get(path, { status, limit: 1 }))));
  return {
    scope: access.canAccessApprovals ? "Requests you approve, all time" : "Your requests, all time",
    items: [
      { name: "Approved", value: approved || 0, color: "#10B981" },
      { name: "Pending", value: pending || 0, color: "#F59E0B" },
      { name: "Rejected", value: rejected || 0, color: "#EF4444" },
    ],
  };
};

export const dashboard = async ({ viewer }) => {
  const access = await context({ viewer });
  const today = access.serverToday;
  const isHr = HR_ROLES.includes(viewer.role);
  const [stats, requests] = await Promise.all([
    isHr ? companyStats({ viewer, today }) : personalStats({ viewer, access, today }),
    optional(requestsByStatus({ access }), null),
  ]);
  return { stats, requests };
};
