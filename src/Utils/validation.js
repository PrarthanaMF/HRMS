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

export const validateEmployeeForm = (form) => {
    const errors = {}

    const required = [
        'name', 'gender', 'personalNumber', 'personalEmail', 'dateOfBirth', 'bloodGroup',
        'company', 'branch', 'department', 'designation', 'dateOfJoining', 'employeeType',
        'emergencyContactName', 'emergencyContactRelation', 'emergencyContactNumber',
        'presentAddress',
        'officialEmail',
    ]

    required.forEach((field) => {
        const value = form[field]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[field] = 'This field is required'
        }
    })

    if (form.personalEmail && !isValidEmail(form.personalEmail)) errors.personalEmail = 'Enter a valid email address'
    if (form.officialEmail && !isValidEmail(form.officialEmail)) errors.officialEmail = 'Enter a valid email address'

    if (form.personalNumber && !isValidPhone(form.personalNumber)) errors.personalNumber = 'Enter a valid 10-digit mobile number'
    if (form.companyNumber && !isValidPhone(form.companyNumber)) errors.companyNumber = 'Enter a valid 10-digit mobile number'
    if (form.emergencyContactNumber && !isValidPhone(form.emergencyContactNumber)) errors.emergencyContactNumber = 'Enter a valid 10-digit mobile number'
    if (form.previousCompanyContact && !isValidPhone(form.previousCompanyContact)) errors.previousCompanyContact = 'Enter a valid 10-digit mobile number'

    if (form.panNumber && !isValidPAN(form.panNumber)) errors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)'
    if (form.aadhaarNumber && !isValidAadhaar(form.aadhaarNumber)) errors.aadhaarNumber = 'Aadhaar must be 12 digits'
    if (form.ifscCode && !isValidIFSC(form.ifscCode)) errors.ifscCode = 'Invalid IFSC format (e.g. HDFC0001234)'

    return errors
}