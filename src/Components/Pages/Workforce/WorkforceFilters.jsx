import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, resetFilters, selectFilters } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import SearchableSelect from '../../Common/SearchableSelect'

import Icon from '../../Common/Icon'
import { secondaryButton } from '../../Common/PageHeader'
const FilterSelect = ({ label, value, options, onChange }) => (
    <SearchableSelect
        label={label}
        name={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        compact
    />
)

const ALL = { value: 'All', label: 'All' }
const withAll = (values = []) => ['All', ...values]

const WorkforceFilters = ({ onChange }) => {
    const dispatch = useDispatch()
    const filters = useSelector(selectFilters)
    const { options } = useEmployeeOptions()

    // Any filter change goes back to the first page
    const update = (key, value) => {
        dispatch(setFilter({ key, value }))
        onChange?.()
    }

    return (
        <section aria-label='Employee filters' className='rise glass-panel mb-4 rounded-2xl p-3.5 md:p-4' style={{ '--i': 1 }}>

            {/* Search + Reset */}
            <div className='mb-3 flex flex-col gap-2.5 sm:flex-row'>
                <div className='relative min-w-0 flex-1'>
                    <Icon aria-hidden='true' className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                        type="search"
                        aria-label='Search employees'
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder='Search by name, employee ID, biometric code, phone or email'
                        className='h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6485]'
                    />
                </div>
                <button
                    type='button'
                    onClick={() => { dispatch(resetFilters()); onChange?.() }}
                    className={secondaryButton}
                >
                    <Icon aria-hidden='true' className="fa-solid fa-rotate-left text-sm" />
                    Reset filters
                </button>
            </div>

            {/* Filter dropdowns */}
            <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'>
                <FilterSelect label='Branch'            value={filters.branchId}           options={[ALL, ...(options?.branches || [])]}  onChange={(v) => update('branchId', v)} />
                <FilterSelect label='Status'            value={filters.status}             options={['Active', 'Inactive']}               onChange={(v) => update('status', v)} />
                <FilterSelect label='Department'        value={filters.department}         options={withAll(options?.values.department)}   onChange={(v) => update('department', v)} />
                <FilterSelect label='Designation'       value={filters.designation}        options={withAll(options?.values.designation)}  onChange={(v) => update('designation', v)} />
                <FilterSelect label='Company'           value={filters.company}            options={withAll(options?.values.company)}      onChange={(v) => update('company', v)} />
                <FilterSelect label='Reporting manager' value={filters.reportingManagerId} options={[ALL, ...(options?.managers || [])]}  onChange={(v) => update('reportingManagerId', v)} />
            </div>
        </section>
    )
}

export default WorkforceFilters
