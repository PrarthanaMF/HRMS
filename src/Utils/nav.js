import { ROLES, HR_ROLES } from './roles'

const EVERYONE = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE, ROLES.EMPLOYEE]
const SALARY_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER]

/*
 * The top navigation. One item per module, left to right, in the order they appear.
 * `roles` hides an item from everyone else; the pages themselves still check access,
 * so hiding a link is only to keep the bar tidy.
 * `children` turns the item into a dropdown; the parent highlights when any child is open.
 */
export const NAV_ITEMS = [
    { name: 'Dashboard', path: '/', icon: 'fa-solid fa-house', end: true, roles: EVERYONE },
    { name: 'Recruitment', path: '/recruitment', icon: 'fa-solid fa-people-pulling', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE] },
    { name: 'Onboarding', path: '/onboarding', icon: 'fa-solid fa-user-check', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE] },
    { name: 'Employees', path: '/workforce', icon: 'fa-solid fa-user-group', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE] },
    {
        name: 'Attendance',
        icon: 'fa-regular fa-calendar-days',
        roles: EVERYONE,
        children: [
            { name: 'Attendance Report', path: '/attendance', end: true, icon: 'fa-regular fa-calendar-days', description: 'Daily attendance, punches and payable days', roles: EVERYONE },
            { name: 'Upload Attendance', path: '/attendance/upload', icon: 'fa-solid fa-file-import', description: 'Import a biometric export or attendance sheet', roles: HR_ROLES },
            { name: 'My Requests', path: '/attendance/requests', icon: 'fa-regular fa-file-lines', description: 'Your applications, leave and work from home', roles: EVERYONE },
            { name: 'Salary', path: '/attendance/salary', icon: 'fa-solid fa-indian-rupee-sign', description: 'Payable days, salary and deductions', roles: SALARY_ROLES },
            { name: 'Holidays', path: '/attendance/holidays', icon: 'fa-solid fa-umbrella-beach', description: 'Company, branch and employee holidays', roles: EVERYONE },
        ],
    },
    { name: 'Applications', path: '/attendance/applications', icon: 'fa-solid fa-file-circle-check', roles: EVERYONE },
    { name: 'Exit Process', path: '/exit-process', icon: 'fa-solid fa-person-running', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER] },
    { name: 'MIS Reports', path: '/mis-reports', icon: 'fa-solid fa-chart-line', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGEMENT] },
    { name: 'Master', path: '/master', icon: 'fa-solid fa-gear', roles: HR_ROLES },
]

// How the phone menu groups the same items (the top bar shows them in one row)
export const NAV_GROUPS = [
    { title: 'People', names: ['Dashboard', 'Employees', 'Recruitment', 'Onboarding'] },
    { title: 'Attendance', names: ['Attendance', 'Applications'] },
    { title: 'Administration', names: ['Exit Process', 'MIS Reports', 'Master'] },
]

const allowed = (item, role) => !item.roles || item.roles.includes(role)

// The items one role may see, with each dropdown narrowed to that role's options
export const navFor = (role) => NAV_ITEMS
    .filter((item) => allowed(item, role))
    .map((item) => (item.children ? { ...item, children: item.children.filter((child) => allowed(child, role)) } : item))
    .filter((item) => !item.children || item.children.length > 0)
