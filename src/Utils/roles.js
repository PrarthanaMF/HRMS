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

// Who may list, create and edit logins (/api/users)
export const USER_MANAGER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER]

// Rank order the backend uses: a caller can only manage roles below their own
export const RANK = { EMPLOYEE: 0, HR_EXECUTIVE: 1, HR_MANAGER: 2, MANAGEMENT: 2, ADMIN: 3, SUPER_ADMIN: 4 }
export const manageableRoles = (role) => Object.keys(RANK).filter((target) => role === ROLES.SUPER_ADMIN || RANK[target] < RANK[role])

export const PASSWORD_RULE = '12–128 characters with an upper-case letter, a lower-case letter, a digit and a symbol'
