import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ROLES, HR_ROLES } from '../Utils/roles'
import UsersTab from '../Components/Pages/Master/UsersTab'
import BranchesTab from '../Components/Pages/Master/BranchesTab'
import LeaveTypesTab from '../Components/Pages/Master/LeaveTypesTab'
import LeaveBalancesTab from '../Components/Pages/Master/LeaveBalancesTab'
import WeekOffTab from '../Components/Pages/Master/WeekOffTab'

import Icon from '../Components/Common/Icon'
import PageHeader, { segClass, segItemClass } from '../Components/Common/PageHeader'
// HR set-up screens. Each tab is shown only to the roles the backend lets use it.
const TABS = [
    { key: 'users', label: 'Users', icon: 'fa-user-shield', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR_MANAGER], Component: UsersTab },
    { key: 'branches', label: 'Branches', icon: 'fa-building', roles: HR_ROLES, Component: BranchesTab },
    { key: 'leave-types', label: 'Leave types', icon: 'fa-calendar-check', roles: HR_ROLES, Component: LeaveTypesTab },
    { key: 'leave-balances', label: 'Leave balances', icon: 'fa-scale-balanced', roles: HR_ROLES, Component: LeaveBalancesTab },
    { key: 'week-offs', label: 'Week offs', icon: 'fa-calendar-week', roles: HR_ROLES, Component: WeekOffTab },
]

const Master = () => {
    const navigate = useNavigate()
    const { tab } = useParams()
    const role = useSelector((state) => state.auth.value.role)
    const tabs = TABS.filter((item) => item.roles.includes(role))
    const active = tabs.find((item) => item.key === tab)

    if (!tabs.length) {
        return (
            <div className='w-full'>
                <PageHeader icon='fa-solid fa-gear' title='HR set-up' />
                <div className='glass-panel flex flex-col items-center rounded-2xl px-6 py-10 text-center'>
                    <span aria-hidden='true' className='mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/70'><Icon className='fa-solid fa-lock text-lg' /></span>
                    <p className='text-[13px] text-slate-600'>You do not have access to HR set-up. Ask an admin if you need to change users, branches or leave rules.</p>
                </div>
            </div>
        )
    }
    if (!active) return <Navigate to={`/master/${tabs[0].key}`} replace />

    const { Component } = active

    return (
        <div className='w-full'>
            <PageHeader
                icon='fa-solid fa-gear'
                title='HR set-up'
                description='Logins, branches, leave types and balances, and week-off policies used across attendance and approvals.'
            />
            <div role='tablist' aria-label='HR set-up sections' className={`${segClass} mb-4`}>
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type='button'
                        role='tab'
                        aria-selected={item.key === active.key}
                        onClick={() => navigate(`/master/${item.key}`)}
                        className={segItemClass(item.key === active.key)}
                    >
                        <Icon aria-hidden='true' className={`fa-solid ${item.icon} text-sm`} />
                        {item.label}
                    </button>
                ))}
            </div>
            <div key={active.key} className='rise' style={{ '--i': 1 }}>
                <Component />
            </div>
        </div>
    )
}

export default Master
