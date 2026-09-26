import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const TABS = [
    { key: 'dashboard',   label: 'Exit Dashboard',    icon: 'fa-chart-line',    path: '/exit' },
    { key: 'feedback',    label: 'Employee Feedback', icon: 'fa-comment-dots',  path: '/exit/feedback' },
    { key: 'attrition',   label: 'Attrition Report',  icon: 'fa-chart-pie',     path: '/exit/attrition' },
    { key: 'resignation', label: 'Resignation Form',  icon: 'fa-file-signature',path: '/exit/resignation' },
]

const ExitProcess = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine which tab is active
    const isFeedback    = location.pathname.startsWith('/exit/feedback')
    const isAttrition   = location.pathname.startsWith('/exit/attrition')
    const isResignation = location.pathname.startsWith('/exit/resignation')

    return (
        <div className='w-full max-w-7xl mx-auto px-4 md:px-6 py-6'>

            {/* Tabs bar — always visible */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5'>

                <div className='flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm w-fit overflow-x-auto hide-scrollbar'>
                    {TABS.map((tab) => {
                        const active =
                            tab.key === 'dashboard'   ? (!isFeedback && !isAttrition && !isResignation) :
                            tab.key === 'feedback'    ? isFeedback :
                            tab.key === 'attrition'   ? isAttrition :
                            isResignation
                        return (
                            <button
                                key={tab.key}
                                onClick={() => navigate(tab.path)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                                    active ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <i className={`fa-solid ${tab.icon} mr-2 text-xs`}></i>
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

            </div>

            <Outlet />
        </div>
    )
}

export default ExitProcess