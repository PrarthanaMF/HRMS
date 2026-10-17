// Workforce screens <-> HRMS backend employees.
// The form and table use their own field names (name, personalNumber, officialEmail, ...);
// this file converts between those and the backend's Employee record, and sends a save as the
// separate calls the backend expects (details, salary, reporting manager, documents).
import { api, ApiError } from "./client";
import { ROLES } from "../Utils/roles";

export const SALARY_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER];

const title = (value) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : "");
const upper = (value) => (value ? String(value).trim().toUpperCase() : "");
const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");
const digits = (value) => String(value || "").replace(/\D/g, "");
// Indian mobile numbers may be typed with +91 / 91 / 0 in front; the backend stores 10 digits
const phone10 = (value) => {
  const all = digits(value);
  return all.length > 10 ? all.slice(-10) : all;
};
const personName = (person) => [person?.firstName, person?.middleName, person?.lastName].filter(Boolean).join(" ");

// Form file fields <-> backend document types
export const DOCUMENT_FIELDS = {
  photo: "PHOTO",
  panPhoto: "PAN",
  aadhaarPhoto: "AADHAAR",
  tenthCertificate: "CERT_10TH",
  twelfthCertificate: "CERT_12TH",
  degreeCertificate: "CERT_DEGREE",
  mastersCertificate: "CERT_MASTERS",
  relievingLetter: "RELIEVING_LETTER",
  experienceLetter: "EXPERIENCE_LETTER",
  lastPaySlip1: "PAYSLIP_1",
  lastPaySlip2: "PAYSLIP_2",
  lastPaySlip3: "PAYSLIP_3",
  resume: "RESUME",
  offerLetter: "OFFER_LETTER",
  appointmentLetter: "APPOINTMENT_LETTER",
};
export const RESTRICTED_DOCUMENTS = ["PAN", "AADHAAR", "PAYSLIP_1", "PAYSLIP_2", "PAYSLIP_3"];

// Backend employee -> the shape the Workforce screens use
export const fromApi = (employee) => ({
  _id: employee._id,
  empId: employee.employeeId,
  name: personName(employee),
  email: employee.workEmail || employee.personalEmail || "",
  status: employee.isActive ? "Active" : "Inactive",
  employmentStatus: employee.employmentStatus || "",
  gender: title(employee.gender),
  personalNumber: employee.phone || "",
  personalEmail: employee.personalEmail || "",
  dateOfBirth: dateOnly(employee.dateOfBirth),
  dateOfAnniversary: dateOnly(employee.anniversaryDate),
  bloodGroup: employee.bloodGroup || "",
  presentAddress: employee.presentAddress || "",
  permanentAddress: employee.permanentAddress || "",
  company: employee.company || "",
  branch: employee.branch?.name || "",
  branchId: employee.branch?._id || "",
  location: employee.location || "",
  department: employee.department || "",
  division: employee.division || "",
  designation: employee.designation || "",
  reportingManager: personName(employee.reportingManager),
  reportingManagerId: employee.reportingManager?._id || "",
  dateOfJoining: dateOnly(employee.joiningDate),
  employeeType: title(employee.employeeType),
  emergencyContactName: employee.emergencyContact?.name || "",
  emergencyContactRelation: employee.emergencyContact?.relation || "",
  emergencyContactNumber: employee.emergencyContact?.phone || "",
  monthlySalary: employee.salary ? String(employee.salary.grossSalary ?? "") : "",
  bankName: employee.bankDetails?.bankName || "",
  accountNumber: employee.bankDetails?.accountNumber || "",
  ifscCode: employee.bankDetails?.ifsc || "",
  panNumber: employee.identity?.pan || "",
  aadhaarNumber: employee.identity?.aadhaar || "",
  aadhaarMasked: employee.identity?.aadhaarMasked || "",
  previousCompanyName: employee.previousEmployer?.name || "",
  previousCompanyManager: employee.previousEmployer?.manager || "",
  previousCompanyContact: employee.previousEmployer?.contact || "",
  officialEmail: employee.workEmail || "",
  companyNumber: employee.companyPhone || "",
  // Attendance set-up
  biometricCode: employee.biometricCode || "",
  shiftStart: employee.shift?.start || "09:00",
  shiftEnd: employee.shift?.end || "18:00",
  weekOffPolicyId: employee.weekOffPolicy?._id || employee.weekOffPolicy || "",
  category: employee.category || "",
  // Salary roles get these back; others don't
  hasSalaryAccess: Boolean(employee.salary),
  // The linked login, when the backend sends it ({ _id, email, role, isActive } or null);
  // undefined when the record does not carry it, so the screen looks it up on /users
  user: employee.user === undefined ? undefined : employee.user || null,
});

// Form -> backend fields for create / update (salary and reporting manager go separately)
const toApi = (form, { canSalary }) => {
  const [firstName, ...rest] = String(form.name || "").trim().split(/\s+/);
  const payload = {
    firstName,
    lastName: rest.join(" "),
    gender: upper(form.gender),
    phone: phone10(form.personalNumber),
    personalEmail: form.personalEmail || "",
    dateOfBirth: form.dateOfBirth || undefined,
    anniversaryDate: form.dateOfAnniversary || null,
    bloodGroup: form.bloodGroup || "",
    presentAddress: form.presentAddress || "",
    permanentAddress: form.permanentAddress || "",
    company: form.company || "",
    branch: form.branchId || null,
    location: form.location || "",
    department: form.department,
    division: form.division || "",
    designation: form.designation,
    joiningDate: form.dateOfJoining || null,
    employeeType: upper(form.employeeType),
    emergencyContact: { name: form.emergencyContactName || "", relation: form.emergencyContactRelation || "", phone: phone10(form.emergencyContactNumber) },
    previousEmployer: { name: form.previousCompanyName || "", manager: form.previousCompanyManager || "", contact: form.previousCompanyContact || "" },
    workEmail: form.officialEmail || undefined,
    companyPhone: phone10(form.companyNumber),
    biometricCode: form.biometricCode?.trim() || null,
    shift: { start: form.shiftStart || "09:00", end: form.shiftEnd || "18:00" },
    weekOffPolicy: form.weekOffPolicyId || null,
    category: form.category || "",
  };
  if (form.employmentStatus) payload.employmentStatus = form.employmentStatus;
  if (canSalary) {
    payload.bankDetails = { bankName: form.bankName || "", accountNumber: digits(form.accountNumber), ifsc: upper(form.ifscCode) };
    payload.identity = { pan: upper(form.panNumber), aadhaar: digits(form.aadhaarNumber) };
  }
  return payload;
};

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export const listEmployees = async ({ filters = {}, page = 1, limit = 20 }, signal) => {
  const status = filters.status && filters.status !== "All" ? filters.status : "Active";
  const pick = (value) => (value && value !== "All" ? value : undefined);
  const data = await api.get("/employees", {
    page,
    limit,
    search: filters.search?.trim() || undefined,
    isActive: status === "Inactive" ? "false" : "true",
    branch: pick(filters.branchId),
    department: pick(filters.department),
    designation: pick(filters.designation),
    company: pick(filters.company),
    reportingManager: pick(filters.reportingManagerId),
  }, { signal });
  return { employees: data.employees.map(fromApi), pagination: data.pagination };
};

export const getEmployee = async (id) => fromApi(await api.get(`/employees/${id}`));

// Everything the form and filters offer to choose from
export const loadOptions = async () => {
  const [branches, values, policies, people] = await Promise.all([
    api.get("/branches"),
    api.get("/employees/filter-options"),
    api.get("/week-off-policies").catch(() => ({ policies: [] })),
    api.get("/attendance/employees").catch(() => ({ employees: [] })),
  ]);
  return {
    branches: branches.filter((branch) => branch.isActive !== false).map((branch) => ({ value: branch._id, label: branch.name })),
    managers: people.employees.map((person) => ({ value: person._id, label: `${person.name} (${person.employeeId})` })),
    weekOffPolicies: [{ value: "", label: "Default policy" }, ...policies.policies.map((policy) => ({ value: policy._id, label: policy.name }))],
    values,
  };
};

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

const uploadDocuments = async (employeeId, form, { canSalary }) => {
  const failed = [];
  for (const [field, type] of Object.entries(DOCUMENT_FIELDS)) {
    const file = form[field];
    if (!(file instanceof File)) continue;
    if (RESTRICTED_DOCUMENTS.includes(type) && !canSalary) continue;
    const body = new FormData();
    body.append("type", type);
    body.append("file", file);
    try {
      await api.post(`/employees/${employeeId}/documents`, body);
    } catch (error) {
      failed.push(`${file.name}: ${error.message}`);
    }
  }
  return failed;
};

// Returns { employee, warnings }: details are saved first; salary, manager and files after
export const saveEmployee = async (form, { canSalary, existing }) => {
  const payload = toApi(form, { canSalary });
  const warnings = [];
  let saved;

  if (existing) {
    saved = await api.patch(`/employees/${existing._id}`, payload);
    if (form.reportingManagerId && form.reportingManagerId !== existing.reportingManagerId) {
      await api.patch(`/employees/${existing._id}/reporting-manager`, { reportingManagerId: form.reportingManagerId });
    }
    if (canSalary && form.monthlySalary !== "" && Number(form.monthlySalary) !== Number(existing.monthlySalary || 0)) {
      await api.patch(`/employees/${existing._id}/salary`, { grossSalary: Number(form.monthlySalary) });
    }
  } else {
    saved = await api.post("/employees", {
      ...payload,
      reportingManager: form.reportingManagerId || undefined,
      ...(canSalary && form.monthlySalary !== "" ? { salary: { grossSalary: Number(form.monthlySalary) } } : {}),
    });
  }

  warnings.push(...(await uploadDocuments(saved._id, form, { canSalary })));
  return { employee: saved, warnings };
};

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const listDocuments = (employeeId) => api.get(`/employees/${employeeId}/documents`).catch((error) => {
  if (error instanceof ApiError && error.status === 403) return [];
  throw error;
});

export const deleteDocument = (employeeId, documentId) => api.delete(`/employees/${employeeId}/documents/${documentId}`);

export const documentUrl = (employeeId, documentId) => `${import.meta.env.VITE_API_BASE || "/api"}/employees/${employeeId}/documents/${documentId}/file`;

export const photoUrl = (employeeId) => `${import.meta.env.VITE_API_BASE || "/api"}/employees/${employeeId}/photo`;
