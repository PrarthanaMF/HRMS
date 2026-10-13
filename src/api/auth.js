import { api } from "./client";

// The backend's user (with its linked employee) in the shape the screens already read:
// _id, name, role, empId, email, phone, department, designation, branches
export const toSessionUser = (user) => {
  const employee = user.employee || null;
  return {
    _id: user._id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    // Employee code (EMP000123); empty for logins not linked to an employee (e.g. a super admin)
    empId: employee?.employeeId || "",
    employeeId: employee?._id || null,
    employee,
    phone: employee?.phone || "",
    department: employee?.department || "",
    designation: employee?.designation || "",
    branches: employee?.branch ? [employee.branch.name] : [],
  };
};

export const login = async (email, password) => toSessionUser((await api.post("/auth/login", { email, password })).user);

export const fetchCurrentUser = async () => toSessionUser(await api.get("/auth/me"));

// Clears the cookie on the server; an already expired session is fine
export const logout = () => api.post("/auth/logout").catch(() => {});
