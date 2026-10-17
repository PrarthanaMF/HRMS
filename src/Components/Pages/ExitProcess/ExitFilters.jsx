import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter, resetFilters, selectExitFilters } from '../../../Store/Redux/ExitProcess/ExitSlice'
import { EXIT_FILTER_OPTIONS } from '../../../Utils/mockExits'
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

const ExitFilters = () => {
    const dispatch = useDispatch()
    const filters = useSelector(selectExitFilters)

    const update = (key, value) => dispatch(setFilter({ key, value }))

    return (
        <div className='rise glass-panel rounded-2xl p-3.5 md:p-4 mb-3 md:mb-4' style={{ '--i': 1 }}>

            {/* Search + Reset */}
            <div className='flex flex-col sm:flex-row gap-2.5 md:gap-3 mb-3 md:mb-4'>
                <div className='relative flex-1'>
                    <Icon aria-hidden="true" className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder='Search by employee ID or name'
                        aria-label='Search exit records by employee ID or name'
                        className='h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6485]'
                    />
                </div>
                <button
                    onClick={() => dispatch(resetFilters())}
                    type='button'
                    className={`${secondaryButton} cursor-pointer`}
                >
                    <Icon className="fa-solid fa-rotate-left text-xs" />
                    Reset
                </button>
            </div>

            {/* Filter dropdowns */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3'>
                <FilterSelect label='Branch'        value={filters.branch}       options={EXIT_FILTER_OPTIONS.branch}       onChange={(v) => update('branch', v)} />
                <FilterSelect label='Status'        value={filters.status}       options={EXIT_FILTER_OPTIONS.status}       onChange={(v) => update('status', v)} />
                <FilterSelect label='Department'    value={filters.department}   options={EXIT_FILTER_OPTIONS.department}   onChange={(v) => update('department', v)} />
                <FilterSelect label='Removal type'  value={filters.removalType}  options={EXIT_FILTER_OPTIONS.removalType}  onChange={(v) => update('removalType', v)} />
            </div>
        </div>
    )
}

export default ExitFilters