import React from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'

import Icon from '../Components/Common/Icon'
import PageHeader, { segClass, segItemClass, primaryButton } from '../Components/Common/PageHeader'

const TABS = [
    { key: 'vacancies', label: 'Current vacancy', shortLabel: 'Vacancy', icon: 'fa-briefcase', path: '/recruitment/vacancy' },
    { key: 'tracker', label: 'Recruitment tracker', shortLabel: 'Tracker', icon: 'fa-diagram-project', path: '/recruitment/tracker' },
    { key: 'mis', label: 'MIS reports', shortLabel: 'MIS', icon: 'fa-chart-pie', path: '/recruitment/mis' },
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
        <div className='w-full'>

            {/* Hiring Request is available from every tab (Current Vacancy, Tracker, MIS Reports) —
                only hidden while the Hiring Request form itself is open. */}
            <PageHeader
                icon='fa-solid fa-people-pulling'
                title='Recruitment'
                description='Raise hiring requests, track candidates through each interview stage and review hiring reports.'
                actions={!isForm && (
                    <button onClick={() => navigate('/recruitment/add')} className={primaryButton}>
                        <Icon className="fa-solid fa-user-plus text-xs" />
                        Hiring request
                    </button>
                )}
            />

            {/* Tabs + the Tracker's Active / History toggle */}
            <div className='rise mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between' style={{ '--i': 1 }}>
                <div aria-label='Recruitment sections' className={segClass}>
                    {TABS.map((tab) => {
                        const active = tab.key === 'mis' ? isMis : tab.key === 'tracker' ? isTracker : isVacancies
                        return (
                            <button
                                key={tab.key}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => navigate(tab.path)}
                                className={segItemClass(active)}
                            >
                                <Icon className={`fa-solid ${tab.icon} text-xs`} />
                                <span className='sm:hidden'>{tab.shortLabel}</span>
                                <span className='hidden sm:inline'>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Active / History — Recruitment Tracker only. Active = every stage still in
                    progress; History = candidates who have reached Join or Reject. */}
                {isTracker && (
                    <div role='group' aria-label='Candidate view' className={segClass}>
                        {TRACKER_VIEWS.map((v) => (
                            <button
                                key={v.key}
                                aria-pressed={trackerView === v.key}
                                onClick={() => setTrackerView(v.key)}
                                className={segItemClass(trackerView === v.key)}
                            >
                                <Icon className={`fa-solid ${v.icon} text-xs`} />
                                {v.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Child route renders here */}
            <Outlet />

        </div>
    )
}

export default Recruitment
