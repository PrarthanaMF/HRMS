import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

import Icon from '../Components/Common/Icon'
import PageHeader, { segClass, segItemClass, primaryButton } from '../Components/Common/PageHeader'
const TABS = [
    { key: 'dashboard', label: 'Exit dashboard',    icon: 'fa-chart-line',   path: '/exit-process' },
    { key: 'feedback',  label: 'Employee feedback', icon: 'fa-comment-dots', path: '/exit-process/feedback' },
    { key: 'attrition', label: 'Attrition report',  icon: 'fa-chart-pie',    path: '/exit-process/attrition' },
]

const ExitProcess = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const isFeedback    = location.pathname.startsWith('/exit-process/feedback')
    const isAttrition   = location.pathname.startsWith('/exit-process/attrition')
    const isResignation = location.pathname.startsWith('/exit-process/resignation')
    const isDetailView  = location.pathname.startsWith('/exit-process/records/')

    const showTabs = !isResignation && !isDetailView

    return (
        <div className='w-full'>

            {showTabs && (
                <>
                    <PageHeader
                        icon='fa-solid fa-person-running'
                        title='Exit process'
                        description='Track resignations through each clearance stage, read exit feedback and follow attrition.'
                        actions={
                            <button
                                type='button'
                                onClick={() => navigate('/exit-process/resignation')}
                                className={`${primaryButton} w-full sm:w-auto cursor-pointer`}
                            >
                                <Icon className="fa-solid fa-file-signature text-sm" />
                                Resignation form
                            </button>
                        }
                    />

                    <nav aria-label='Exit process sections' className='mb-4 md:mb-5'>
                        <div className={segClass}>
                            {TABS.map((tab) => {
                                const active =
                                    tab.key === 'dashboard' ? (!isFeedback && !isAttrition) :
                                    tab.key === 'feedback'  ? isFeedback :
                                    isAttrition
                                return (
                                    <button
                                        key={tab.key}
                                        type='button'
                                        onClick={() => navigate(tab.path)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`${segItemClass(active)} cursor-pointer`}
                                    >
                                        <Icon className={`fa-solid ${tab.icon} text-sm`} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </nav>
                </>
            )}

            <Outlet />
        </div>
    )
}

export default ExitProcess
