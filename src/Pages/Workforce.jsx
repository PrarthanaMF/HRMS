import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { HR_ROLES } from '../Utils/roles'
import { employeesChanged } from '../Store/Redux/Workforce/EmployeeSlice'
import { EMPLOYEE_IMPORT, SpreadsheetImportModal } from '../Components/Common/SpreadsheetImport'

import Icon from '../Components/Common/Icon'
import PageHeader, { primaryButton, secondaryButton, segClass, segItemClass } from '../Components/Common/PageHeader'
const TABS = [
    { key: 'employees', label: 'Employee list', icon: 'fa-users', path: '/workforce' },
    { key: 'mis', label: 'MIS reports', icon: 'fa-chart-pie', path: '/workforce/mis' },
]

const Workforce = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const [importOpen, setImportOpen] = useState(false)
    // Branch managers can look; only HR adds or edits employees
    const canEdit = HR_ROLES.includes(useSelector(state => state.auth.value)?.role)

    const isMis = location.pathname.startsWith('/workforce/mis')
    // The add / edit forms and the employee page bring their own header, so this one steps aside:
    // anything under /workforce other than the list itself and the MIS tab
    const subPath = location.pathname.replace(/^\/workforce\/?/, '').replace(/\/$/, '')
    const isForm = subPath !== '' && !isMis

    return (
        <div className='w-full'>

            {!isForm && (
                <>
                    <PageHeader
                        icon='fa-solid fa-user-group'
                        title='Employees'
                        description={isMis
                            ? 'Headcount and workforce reports across branches and departments.'
                            : 'Everyone on the payroll. Search, filter and open an employee to see their full record.'}
                        actions={!isMis && canEdit && (
                            <>
                                <button type='button' onClick={() => setImportOpen(true)} className={secondaryButton}>
                                    <Icon aria-hidden='true' className='fa-solid fa-file-import text-sm' />
                                    Import employees
                                </button>
                                <button type='button' onClick={() => navigate('/workforce/add')} className={primaryButton}>
                                    <Icon aria-hidden='true' className='fa-solid fa-plus text-sm' />
                                    Add employee
                                </button>
                            </>
                        )}
                    />

                    <nav aria-label='Employees sections' className={`${segClass} mb-4`}>
                        {TABS.map((tab) => {
                            const active = tab.key === 'mis' ? isMis : !isMis
                            return (
                                <button
                                    key={tab.key}
                                    type='button'
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => navigate(tab.path)}
                                    className={segItemClass(active)}
                                >
                                    <Icon aria-hidden='true' className={`fa-solid ${tab.icon} text-sm`} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </>
            )}

            <Outlet />

            {canEdit && (
                <SpreadsheetImportModal
                    open={importOpen}
                    config={EMPLOYEE_IMPORT}
                    onClose={() => setImportOpen(false)}
                    onImported={() => dispatch(employeesChanged())}
                />
            )}
        </div>
    )
}

export default Workforce
