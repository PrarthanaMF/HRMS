import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, resetFilters, selectFilters } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import SearchableSelect from '../../Common/SearchableSelect'

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
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 md:p-4 mb-3 md:mb-4'>

            {/* Search + Reset */}
            <div className='flex flex-col sm:flex-row gap-2.5 md:gap-3 mb-3 md:mb-4'>
                <div className='relative flex-1'>
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder='Search by name, Employee ID, biometric code, phone or email...'
                        className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
                    />
                </div>
                <button
                    onClick={() => { dispatch(resetFilters()); onChange?.() }}
                    className='flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'
                >
                    <i className="fa-solid fa-rotate-left text-xs"></i>
                    Reset
                </button>
            </div>

            {/* Filter dropdowns */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3'>
                <FilterSelect label='Branch'            value={filters.branchId}           options={[ALL, ...(options?.branches || [])]}  onChange={(v) => update('branchId', v)} />
                <FilterSelect label='Status'            value={filters.status}             options={['Active', 'Inactive']}               onChange={(v) => update('status', v)} />
                <FilterSelect label='Department'        value={filters.department}         options={withAll(options?.values.department)}   onChange={(v) => update('department', v)} />
                <FilterSelect label='Designation'       value={filters.designation}        options={withAll(options?.values.designation)}  onChange={(v) => update('designation', v)} />
                <FilterSelect label='Company'           value={filters.company}            options={withAll(options?.values.company)}      onChange={(v) => update('company', v)} />
                <FilterSelect label='Reporting Manager' value={filters.reportingManagerId} options={[ALL, ...(options?.managers || [])]}  onChange={(v) => update('reportingManagerId', v)} />
            </div>
        </div>
    )
}

export default WorkforceFilters
