import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, resetFilters, selectFilters } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { FILTER_OPTIONS } from '../../../Utils/mockEmployees'

const FilterSelect = ({ label, value, options, onChange }) => (
    <div className='flex flex-col gap-1'>
        <label className='text-[10px] font-semibold uppercase text-slate-400 tracking-wide'>{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className='text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100 cursor-pointer'
        >
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
)

const WorkforceFilters = () => {
    const dispatch = useDispatch()
    const filters = useSelector(selectFilters)

    const update = (key, value) => dispatch(setFilter({ key, value }))

    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4'>

            {/* Search + Reset */}
            <div className='flex flex-col sm:flex-row gap-3 mb-4'>
                <div className='relative flex-1'>
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder='Search by Employee ID or Name...'
                        className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
                    />
                </div>
                <button
                    onClick={() => dispatch(resetFilters())}
                    className='flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                >
                    <i className="fa-solid fa-rotate-left text-xs"></i>
                    Reset
                </button>
            </div>

            {/* Filter dropdowns */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
                <FilterSelect label='Branch' value={filters.branch} options={FILTER_OPTIONS.branch} onChange={(v) => update('branch', v)} />
                <FilterSelect label='Status' value={filters.status} options={FILTER_OPTIONS.status} onChange={(v) => update('status', v)} />
                <FilterSelect label='Department' value={filters.department} options={FILTER_OPTIONS.department} onChange={(v) => update('department', v)} />
                <FilterSelect label='Designation' value={filters.designation} options={FILTER_OPTIONS.designation} onChange={(v) => update('designation', v)} />
                <FilterSelect label='Company' value={filters.company} options={FILTER_OPTIONS.company} onChange={(v) => update('company', v)} />
                <FilterSelect label='Reporting Manager' value={filters.reportingManager} options={FILTER_OPTIONS.reportingManager} onChange={(v) => update('reportingManager', v)} />
            </div>
        </div>
    )
}

export default WorkforceFilters