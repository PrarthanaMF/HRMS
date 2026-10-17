import { createContext, useState } from "react";

const HeaderData = createContext(null)

// The modules, in the order the dashboard lists them
export function HeaderDataProvider({ children }) {
    let [data, setData] = useState([
        {
            name: 'Dashboard',
            description: 'Company performance and insights',
            icon: 'fa-solid fa-house',
        },
        {
            name: 'Recruitment',
            description: 'Hiring requests, candidates and interviews',
            icon: 'fa-solid fa-people-pulling',
        },
        {
            name: 'Onboarding',
            description: 'Joining steps for new employees',
            icon: 'fa-solid fa-user-check',
        },
        {
            name: 'Employees',
            description: 'Employee records, documents and reporting lines',
            icon: 'fa-solid fa-user-group',
        },
        {
            name: 'Attendance',
            description: 'Daily attendance, leave and requests',
            icon: 'fa-regular fa-calendar-days',
        },
        {
            name: 'Exit Process',
            description: 'Resignations, clearances and exit documents',
            icon: 'fa-solid fa-person-running',
        },
        {
            name: 'MIS Reports',
            description: 'Reports across every module',
            icon: 'fa-solid fa-chart-line',
        },
        {
            name: 'Master',
            description: 'Users, branches, leave types and week offs',
            icon: 'fa-solid fa-gear',
        }
    ])
    return (
        <HeaderData.Provider value={{ data, setData }}>
            {children}
        </HeaderData.Provider>
    )
}

export default HeaderData
