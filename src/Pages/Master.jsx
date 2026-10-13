import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ROLES, HR_ROLES } from '../Utils/roles'
import UsersTab from '../Components/Pages/Master/UsersTab'
import BranchesTab from '../Components/Pages/Master/BranchesTab'
import LeaveTypesTab from '../Components/Pages/Master/LeaveTypesTab'
import LeaveBalancesTab from '../Components/Pages/Master/LeaveBalancesTab'
import WeekOffTab from '../Components/Pages/Master/WeekOffTab'
import ImportsTab from '../Components/Pages/Master/ImportsTab'

// HR set-up screens. Each tab is shown only to the roles the backend lets use it.
const TABS = [
    { key: 'users', label: 'Users', icon: 'fa-user-shield', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER], Component: UsersTab },
    { key: 'branches', label: 'Branches', icon: 'fa-building', roles: HR_ROLES, Component: BranchesTab },
    { key: 'leave-types', label: 'Leave Types', icon: 'fa-calendar-check', roles: HR_ROLES, Component: LeaveTypesTab },
    { key: 'leave-balances', label: 'Leave Balances', icon: 'fa-scale-balanced', roles: HR_ROLES, Component: LeaveBalancesTab },
    { key: 'week-offs', label: 'Week Offs', icon: 'fa-calendar-week', roles: HR_ROLES, Component: WeekOffTab },
    { key: 'imports', label: 'Imports', icon: 'fa-file-import', roles: HR_ROLES, Component: ImportsTab },
]

const Master = () => {
    const navigate = useNavigate()
    const { tab } = useParams()
    const role = useSelector((state) => state.auth.value.role)
    const tabs = TABS.filter((item) => item.roles.includes(role))
    const active = tabs.find((item) => item.key === tab)

    if (!tabs.length) {
        return <div className='p-6 text-sm text-slate-600'>You do not have access to HR set-up.</div>
    }
    if (!active) return <Navigate to={`/master/${tabs[0].key}`} replace />

    const { Component } = active

    return (
        <div className='w-full max-w-7xl mx-auto px-4 md:px-6 py-6'>
            <div className='mb-5'>
                <h1 className='text-xl font-bold text-slate-800'>HR Set-up</h1>
                <p className='text-xs text-slate-500'>Users, branches, leave, week offs and bulk imports</p>
            </div>
            <div role='tablist' className='mb-4 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-fit'>
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type='button'
                        role='tab'
                        aria-selected={item.key === active.key}
                        onClick={() => navigate(`/master/${item.key}`)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${item.key === active.key ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <i className={`fa-solid ${item.icon} mr-2 text-xs`}></i>
                        {item.label}
                    </button>
                ))}
            </div>
            <Component />
        </div>
    )
}

export default Master
