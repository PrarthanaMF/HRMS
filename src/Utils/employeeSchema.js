export const DROPDOWN_OPTIONS = {
    gender: ['Male', 'Female', 'Other'],
    bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    company: ['Marutiflex Pvt Ltd', 'Marutiflex Services'],
    branch: ['Bangalore', 'Mangalore', 'Ranchi'],
    location: ['Koramangala', 'Whitefield', 'MG Road', 'Kadri', 'Hampankatta', 'Main Road'],
    department: ['Information Technology', 'Operations', 'Management', 'Human Resources', 'Engineering', 'Finance', 'Sales', 'Marketing'],
    division: ['Product', 'Services', 'Support', 'R&D'],
    designation: ['IT Manager', 'Operations Head', 'Director', 'HR Manager', 'HR Executive', 'Operations Manager', 'Team Lead', 'Software Engineer', 'Senior Developer', 'DevOps Engineer', 'Accountant', 'Finance Manager', 'Sales Executive', 'Sales Manager', 'Marketing Lead', 'Content Writer', 'Recruiter', 'QA Engineer', 'UI/UX Designer'],
    reportingManager: ['Priya Sharma', 'Arjun Kapoor', 'Anita Desai', 'Suresh Nair', 'Vikram Singh', 'Pooja Bhatt'],
    divisionHead: ['Priya Sharma', 'Arjun Kapoor'],
    applicationApprover: ['Priya Sharma', 'Arjun Kapoor', 'Anita Desai'],
    employeeType: ['Fresher', 'Experienced'],
    emergencyRelation: ['Father', 'Mother', 'Guardian', 'Spouse', 'Sibling'],
    salaryTerms: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annually'],
    removalType: ['Resigned', 'Terminated', 'Absconded', 'Terminated Based on PIP'],
    // Backend employment statuses
    employmentStatus: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'OFFERED', label: 'Offered' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'ON_NOTICE', label: 'On notice' },
        { value: 'EXIT_IN_PROGRESS', label: 'Exit in progress' },
        { value: 'EXITED', label: 'Exited' },
        { value: 'TERMINATED', label: 'Terminated' },
    ],
}

export const REQUIRED_FIELDS = [
    'name', 'gender', 'personalNumber', 'personalEmail', 'dateOfBirth', 'bloodGroup',
    'company', 'branchId', 'department', 'designation', 'dateOfJoining', 'employeeType',
    'emergencyContactName', 'emergencyContactRelation', 'emergencyContactNumber',
    'presentAddress',
    'officialEmail',
]

// Editing an existing employee (e.g. one brought in by bulk import) only needs what the backend requires
export const EDIT_REQUIRED_FIELDS = ['name', 'gender', 'personalNumber', 'dateOfBirth', 'department', 'designation']

export const FORM_STEPS = [
    { key: 'personal', label: 'Personal' },
    { key: 'employment', label: 'Employment' },
    { key: 'contact', label: 'Emergency Contact' },
    { key: 'financial', label: 'Salary & Bank' },
    { key: 'identity', label: 'Identity & Education' },
    { key: 'background', label: 'Background' },
]

export const STEP_FIELD_MAP = {
    personal: ['name', 'gender', 'personalNumber', 'personalEmail', 'dateOfBirth', 'dateOfAnniversary', 'bloodGroup', 'photo', 'presentAddress', 'permanentAddress'],
    employment: ['company', 'branchId', 'location', 'department', 'division', 'designation', 'reportingManagerId', 'dateOfJoining', 'employeeType', 'employmentStatus', 'biometricCode', 'shiftStart', 'shiftEnd', 'weekOffPolicyId', 'category'],
    contact: ['emergencyContactName', 'emergencyContactRelation', 'emergencyContactNumber'],
    financial: ['monthlySalary', 'bankName', 'accountNumber', 'ifscCode'],
    identity: ['panNumber', 'panPhoto', 'aadhaarNumber', 'aadhaarPhoto', 'tenthCertificate', 'twelfthCertificate', 'degreeCertificate', 'mastersCertificate'],
    background: ['previousCompanyName', 'previousCompanyManager', 'previousCompanyContact', 'relievingLetter', 'experienceLetter', 'lastPaySlip1', 'lastPaySlip2', 'lastPaySlip3', 'resume', 'offerLetter', 'appointmentLetter', 'officialEmail', 'companyNumber'],
}