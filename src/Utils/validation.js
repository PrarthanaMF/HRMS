// ============================================================
// Common Field Validators
// ============================================================
export const isValidEmail = (email) => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone) => {
    if (!phone) return true
    const cleaned = String(phone).replace(/[\s\-()]/g, '')
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned)
}

export const isValidPAN = (pan) => {
    if (!pan) return true
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())
}

export const isValidAadhaar = (aadhaar) => {
    if (!aadhaar) return true
    return /^\d{12}$/.test(String(aadhaar).replace(/\s/g, ''))
}

export const isValidIFSC = (ifsc) => {
    if (!ifsc) return true
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())
}

// ============================================================
// Employee Form Validation (Add / Edit Employee)
// ============================================================
export const validateEmployeeForm = (form) => {
    const errors = {}

    const required = [
        'name', 'gender', 'personalNumber', 'personalEmail', 'dateOfBirth', 'bloodGroup',
        'company', 'branch', 'department', 'designation', 'dateOfJoining', 'employeeType',
        'emergencyContactName', 'emergencyContactRelation', 'emergencyContactNumber',
        'presentAddress',
    ]

    required.forEach((field) => {
        const value = form[field]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field] = 'This field is required'
        }
    })

    if (form.personalEmail && !isValidEmail(form.personalEmail)) errors.personalEmail = 'Enter a valid email address'
    if (form.officialEmail && !isValidEmail(form.officialEmail)) errors.officialEmail = 'Enter a valid email address'
    if (form.previousCompanyEmail && !isValidEmail(form.previousCompanyEmail)) errors.previousCompanyEmail = 'Enter a valid email address'

    if (form.personalNumber && !isValidPhone(form.personalNumber)) errors.personalNumber = 'Enter a valid 10-digit mobile number'
    if (form.companyNumber && !isValidPhone(form.companyNumber)) errors.companyNumber = 'Enter a valid 10-digit mobile number'
    if (form.emergencyContactNumber && !isValidPhone(form.emergencyContactNumber)) errors.emergencyContactNumber = 'Enter a valid 10-digit mobile number'
    if (form.previousCompanyContact && !isValidPhone(form.previousCompanyContact)) errors.previousCompanyContact = 'Enter a valid 10-digit mobile number'

    if (form.panNumber && !isValidPAN(form.panNumber)) errors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)'
    if (form.aadhaarNumber && !isValidAadhaar(form.aadhaarNumber)) errors.aadhaarNumber = 'Aadhaar must be 12 digits'
    if (form.ifscCode && !isValidIFSC(form.ifscCode)) errors.ifscCode = 'Invalid IFSC format (e.g. HDFC0001234)'

    return errors
}

// ============================================================
// Resignation Form Validation
// ============================================================
export const validateResignationForm = (form, existingExits = [], mockUsers = {}) => {
    const errors = {}

    // ----- Employee ID -----
    if (!form.empId || form.empId.trim() === '') {
        errors.empId = 'Employee ID is required'
    } else {
        const empId = form.empId.trim()
        if (!mockUsers[empId]) {
            errors.empId = 'Employee not found'
        } else if (existingExits.some(e => e.empId === empId && e.status === 'Exiting')) {
            errors.empId = 'This employee already has an active resignation'
        }
    }

    // ----- Expected Date to Relieve -----
    if (!form.lastWorkingDate) {
        errors.lastWorkingDate = 'Expected date to relieve is required'
    } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const picked = new Date(form.lastWorkingDate)
        if (picked <= today) {
            errors.lastWorkingDate = 'Date must be in the future'
        }
    }

    // ----- Reason for Resignation -----
    if (!form.reasonForResignation || form.reasonForResignation.trim() === '') {
        errors.reasonForResignation = 'Reason for resignation is required'
    } else if (form.reasonForResignation.trim().length < 10) {
        errors.reasonForResignation = 'Please provide at least 10 characters'
    }

    return errors
}