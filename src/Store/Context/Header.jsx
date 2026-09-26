import { createContext, useState } from "react";

const HeaderData = createContext(null)

export function HeaderDataProvider({ children }) {
    let [data, setData] = useState([
        {
            name: 'Dashboard',
            description: 'View Company Performance And Insights',
            icon: 'fa-solid fa-house',
            bgIconColor: 'bg-orange-100',
            IconColor: 'text-orange-800'
        },
        {
            name: 'Recruitment',
            description: 'Manage Hiring And Recruitment Processes',
            icon: 'fa-solid fa-people-pulling',
            bgIconColor: 'bg-pink-100',
            IconColor: 'text-pink-800',
            btnText: 'Manage Hiring'
        },
        {
            name: 'Workforce',
            description: 'Manage Employees And Their Information',
            icon: 'fa-solid fa-user-group',
            bgIconColor: 'bg-blue-100',
            IconColor: 'text-blue-800',
            btnText: 'Manage'
        },
        {
            name: 'Attendance',
            description: 'Monitor Employee Attendance And Leaves',
            icon: 'fa-regular fa-calendar-days',
            bgIconColor: 'bg-purple-100',
            IconColor: 'text-purple-800',
            btnText: 'View Attendance'
        },
        {
            name: 'Payroll',
            description: 'Manage Salaries Payments And Deductions',
            icon: 'fa-solid fa-indian-rupee-sign',
            bgIconColor: 'bg-green-100',
            IconColor: 'text-green-800',
            btnText: 'View Payroll'
        },


        {
            name: 'Onboarding',
            description: 'Manage New Employee Joining Process',
            icon: 'fa-solid fa-user-check',
            bgIconColor: 'bg-cyan-100',
            IconColor: 'text-cyan-800',
            btnText: 'View Onboarding'
        },
        {
            name: 'Exit Process',
            description: 'Manage employee exit ducuments',
            icon: 'fa-solid fa-person-running',
            bgIconColor: 'bg-yellow-100',
            IconColor: 'text-yellow-800',
            btnText: 'Manage Exit'
        },
        {
            name: 'MIS Reports',
            description: 'Track Employee Goals And Performance',
            icon: 'fa-solid fa-chart-line',
            bgIconColor: 'bg-indigo-100',
            IconColor: 'text-indigo-800',
            btnText: 'View Performance'
        },
        {
            name: 'Expenses',
            description: 'Track Employee Expenses And Reimbursements',
            icon: 'fa-solid fa-receipt',
            bgIconColor: 'bg-rose-100',
            IconColor: 'text-rose-800',
            btnText: 'view Expense'
        },
        {
            name: 'Assets',
            description: 'Manage Company Assets And Allocation',
            icon: 'fa-solid fa-desktop',
            bgIconColor: 'bg-teal-100',
            IconColor: 'text-teal-800',
            btnText: 'Manage Assets'
        },
        {
            name: 'Helpdesk',
            description: 'Resolve Employee Issues And Requests',
            icon: 'fa-solid fa-headset',
            bgIconColor: 'bg-slate-100',
            IconColor: 'text-slate-800',
            btnText: 'Open Tickets'
        },
        {
            name: 'Master',
            description: 'Manage Master',
            icon: 'fa-solid fa-gear',
            bgIconColor: 'bg-blue-100',
            IconColor: 'text-blue-800',
            btnText: 'Manage Master'
        }
    ])
    return (
        <HeaderData.Provider value={{ data, setData }}>
            {children}
        </HeaderData.Provider>
    )
}



export default HeaderData