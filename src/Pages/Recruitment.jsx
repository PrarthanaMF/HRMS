import React from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'

const TABS = [
    { key: 'vacancies', label: 'Current Vacancy', shortLabel: 'Vacancy', icon: 'fa-briefcase', path: '/recruitment/vacancy' },
    { key: 'tracker', label: 'Recruitment Tracker', shortLabel: 'Tracker', icon: 'fa-diagram-project', path: '/recruitment/tracker' },
    { key: 'mis', label: 'MIS Reports', shortLabel: 'MIS', icon: 'fa-chart-pie', path: '/recruitment/mis' },
]

// Recruitment Tracker's own Active / History toggle. Lives here (not inside the
// Tracker component) because it sits in the shared page header next to the tabs —
// driven by a ?view= query param so the Tracker page can read it back.
const TRACKER_VIEWS = [
    { key: 'active', label: 'Active', icon: 'fa-list-check' },
    { key: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
]

const Recruitment = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()

    const isMis = location.pathname.startsWith('/recruitment/mis')
    const isTracker = location.pathname.startsWith('/recruitment/tracker')
    const isForm = location.pathname.startsWith('/recruitment/add') || location.pathname.startsWith('/recruitment/edit')
    const isVacancies = location.pathname.startsWith('/recruitment/vacancy')

    // Only meaningful on the Tracker tab; defaults to Active.
    const trackerView = searchParams.get('view') === 'history' ? 'history' : 'active'
    const setTrackerView = (view) => {
        const next = new URLSearchParams(searchParams)
        if (view === 'active') next.delete('view')
        else next.set('view', view)
        setSearchParams(next)
    }

    return (
        <div className='w-full px-4 md:px-6 py-6'>

            {/* Tabs + Hiring Request button */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5'>

                <div className='flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-sm w-full sm:w-fit'>
                    {TABS.map((tab) => {
                        const active = tab.key === 'mis' ? isMis : tab.key === 'tracker' ? isTracker : isVacancies
                        return (
                            <button
                                key={tab.key}
                                onClick={() => navigate(tab.path)}
                                className={`flex-1 sm:flex-initial px-2 sm:px-4 py-2 rounded-md text-[12px] sm:text-sm font-medium transition whitespace-nowrap ${active ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <i className={`fa-solid ${tab.icon} mr-1 sm:mr-2 text-xs`}></i>
                                <span className='sm:hidden'>{tab.shortLabel}</span>
                                <span className='hidden sm:inline'>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className='flex items-center gap-3 w-full sm:w-auto'>
                    {/* Active / History — Recruitment Tracker only. Active = every stage still in
                        progress; History = candidates who have reached Join or Reject. */}
                    {isTracker && (
                        <div className='flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-sm'>
                            {TRACKER_VIEWS.map((v) => (
                                <button
                                    key={v.key}
                                    onClick={() => setTrackerView(v.key)}
                                    className={`px-3 py-2 rounded-md text-[12px] sm:text-sm font-medium transition whitespace-nowrap ${trackerView === v.key ? 'bg-[#062139] text-white' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <i className={`fa-solid ${v.icon} mr-1.5 text-xs`}></i>
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Hiring Request is available from every tab (Current Vacancy, Tracker, MIS Reports) —
                        only hidden while the Hiring Request form itself is open. Same simple standalone
                        button style as "Add Employee" on the Workforce page — no extra frame. */}
                    {!isForm && (
                        <button
                            onClick={() => navigate('/recruitment/add')}
                            className='flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-[13px] rounded-lg text-[12px] sm:text-sm font-semibold transition shadow-sm hover:shadow-md'
                        >
                            <i className="fa-solid fa-user-plus text-xs"></i>
                            Hiring Request
                        </button>
                    )}
                </div>
            </div>

            {/* Child route renders here */}
            <Outlet />

        </div>
    )
}

export default Recruitment