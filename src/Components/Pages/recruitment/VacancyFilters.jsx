import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setVacancyFilter, resetVacancyFilters, selectVacancyFilters } from '../../../Store/Redux/Recruitment/VacancySlice'
import { VACANCY_FILTER_OPTIONS } from '../../../Utils/mockRecruitment'
import SearchableSelect from '../../Common/SearchableSelect'
import { secondaryButton } from '../../Common/PageHeader'
import { inputClass } from './ui'

import Icon from '../../Common/Icon'
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

const VacancyFilters = () => {
    const dispatch = useDispatch()
    const filters = useSelector(selectVacancyFilters)

    const update = (key, value) => dispatch(setVacancyFilter({ key, value }))

    return (
        <div className='glass-panel rounded-2xl p-3.5 md:p-4 mb-3 md:mb-4'>

            {/* Search + Reset */}
            <div className='flex flex-col sm:flex-row gap-2.5 md:gap-3 mb-3 md:mb-4'>
                <div className='relative flex-1'>
                    <Icon className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        aria-label='Search vacancies'
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder='Search by ID, designation or requestor'
                        className={`${inputClass} pl-10`}
                    />
                </div>
                <button
                    onClick={() => dispatch(resetVacancyFilters())}
                    className={secondaryButton}
                >
                    <Icon className="fa-solid fa-rotate-left text-xs" />
                    Reset
                </button>
            </div>

            {/* Filter dropdowns */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3'>
                <FilterSelect label='Branch' value={filters.branch} options={VACANCY_FILTER_OPTIONS.branch} onChange={(v) => update('branch', v)} />
                <FilterSelect label='Designation' value={filters.designation} options={VACANCY_FILTER_OPTIONS.designation} onChange={(v) => update('designation', v)} />
                <FilterSelect label='Salary range' value={filters.salaryRange} options={VACANCY_FILTER_OPTIONS.salaryRange} onChange={(v) => update('salaryRange', v)} />
                <FilterSelect label='Experience' value={filters.experienceRequired} options={VACANCY_FILTER_OPTIONS.experienceRequired} onChange={(v) => update('experienceRequired', v)} />
                <FilterSelect label='Status' value={filters.status} options={VACANCY_FILTER_OPTIONS.status} onChange={(v) => update('status', v)} />
            </div>
        </div>
    )
}

export default VacancyFilters
