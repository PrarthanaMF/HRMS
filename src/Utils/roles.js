// Role values exactly as the backend stores them (see the backend's docs/API.md, "Roles")
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGEMENT: 'MANAGEMENT',
    HR_MANAGER: 'HR_MANAGER',
    HR_EXECUTIVE: 'HR_EXECUTIVE',
    EMPLOYEE: 'EMPLOYEE',
}

// How each role is shown on screen
export const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGEMENT: 'Branch Manager',
    HR_MANAGER: 'HR Manager',
    HR_EXECUTIVE: 'HR Executive',
    EMPLOYEE: 'Employee',
}

export const HR_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE]
