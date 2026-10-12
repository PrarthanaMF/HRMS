import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const TABS = [
    { key: 'dashboard', label: 'Exit Dashboard',    icon: 'fa-chart-line',   path: '/exit-process' },
    { key: 'feedback',  label: 'Employee Feedback', icon: 'fa-comment-dots', path: '/exit-process/feedback' },
    { key: 'attrition', label: 'Attrition Report',  icon: 'fa-chart-pie',    path: '/exit-process/attrition' },
]

const ExitProcess = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isFeedback    = location.pathname.startsWith('/exit-process/feedback')
    const isAttrition   = location.pathname.startsWith('/exit-process/attrition')
    const isResignation = location.pathname.startsWith('/exit-process/resignation')
    const isDetailView  = location.pathname.startsWith('/exit-process/records/')   // ← NEW

    const showTabs = !isResignation && !isDetailView

    return (
        <div className='w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6'>

            {showTabs && (
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-5'>

                    <div className='bg-white rounded-lg p-1 border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar w-full sm:w-fit'>
                        <div className='flex items-center gap-0.5 min-w-max sm:min-w-0'>
                            {TABS.map((tab) => {
                                const active =
                                    tab.key === 'dashboard' ? (!isFeedback && !isAttrition) :
                                    tab.key === 'feedback'  ? isFeedback :
                                    isAttrition
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => navigate(tab.path)}
                                        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                                            active ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <i className={`fa-solid ${tab.icon} text-[10px] sm:text-xs`}></i>
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/exit-process/resignation')}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow-md cursor-pointer shrink-0'
                    >
                        <i className="fa-solid fa-file-signature text-[11px] sm:text-xs"></i>
                        Resignation Form
                    </button>

                </div>
            )}

            <Outlet />
        </div>
    )
}

export default ExitProcess