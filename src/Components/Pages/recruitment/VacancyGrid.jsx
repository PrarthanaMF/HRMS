import React from 'react'
import { useSelector } from 'react-redux'
import { selectFilteredVacancies } from '../../../Store/Redux/Recruitment/VacancySlice'
import VacancyStatusBadge from './VacancyStatusBadge'
import { formatTimestamp } from '../../../Utils/formatDate'
import { Pagination, usePagination } from '../../Common/Pagination'
import { theadClass, thClass, rowClass, rowPrimary, rowIcon, touchIcon, metaLabel, fromLg, fromXl } from './ui'

import Icon from '../../Common/Icon'
const ActionButtons = ({ vacancy, onView, onUpdate }) => (
    <div className='flex flex-wrap items-center justify-center gap-2'>
        <button
            onClick={() => onView(vacancy)}
            title='View full details'
            aria-label='View full details'
            className={rowIcon}
        >
            <Icon className="fa-solid fa-eye text-[12px]" />
        </button>
        {/* Update stays visible but is disabled once the hiring request is closed */}
        <button
            onClick={() => onUpdate(vacancy)}
            disabled={vacancy.status === 'Closed'}
            title={vacancy.status === 'Closed' ? 'This hiring request is closed' : 'Update'}
            className={rowPrimary}
        >
            Update
        </button>
    </div>
)

const td = 'px-3 py-2.5 text-[13px] text-slate-600'

const VacancyGrid = ({ onView, onUpdate, onViewCandidates }) => {
    const allVacancies = useSelector(selectFilteredVacancies)
    const paging = usePagination(allVacancies, { resetKey: allVacancies.length })
    const vacancies = paging.pageItems

    if (allVacancies.length === 0) {
        return (
            <div className='glass-panel rounded-2xl px-6 py-12 text-center'>
                <span aria-hidden='true' className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
                    <Icon className="fa-solid fa-briefcase text-xl" />
                </span>
                <p className='text-sm font-medium text-[var(--ink)]'>No vacancies match your filters.</p>
                <p className='mt-1 text-[13px] text-slate-500'>Change a filter or press Reset to see every hiring request.</p>
            </div>
        )
    }

    return (
        <>
            {/* ============ DESKTOP TABLE ============ */}
            <div className='hidden md:block glass-strong rounded-2xl overflow-hidden'>
                {/* The table fits its box at every width: tablets show the essentials, more columns join from lg / xl */}
                <div>
                    <table className='w-full text-sm [overflow-wrap:anywhere]'>
                        <thead className={theadClass}>
                            <tr>
                                <th className={thClass}>S.No</th>
                                <th className={thClass}>Designation</th>
                                <th className={thClass}>Branch</th>
                                <th className={thClass}>Vacancies</th>
                                <th className={thClass}>Candidates</th>
                                <th className={`${thClass} ${fromXl}`}>Salary range</th>
                                <th className={`${thClass} ${fromLg}`}>Experience</th>
                                <th className={`${thClass} ${fromLg}`}>Target date</th>
                                <th className={`${thClass} ${fromXl}`}>Requested by</th>
                                <th className={`${thClass} ${fromXl}`}>Timestamp</th>
                                <th className={thClass}>Status</th>
                                <th className={`${thClass} text-center`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vacancies.map((v) => (
                                <tr key={v._id} className={rowClass}>
                                    <td className='px-3 py-2.5'>
                                        <span className='text-xs font-semibold text-slate-700 tabular-nums'>{v.jobId}</span>
                                    </td>
                                    <td className='px-3 py-2.5'>
                                        <button
                                            onClick={() => onView(v)}
                                            title='View details'
                                            className='rounded text-left text-[13px] font-medium text-[var(--ink)] hover:text-[var(--brand-600)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                                        >
                                            {v.designation}
                                        </button>
                                    </td>
                                    <td className={td}>{v.branch}</td>
                                    <td className={`${td} tabular-nums`}>{v.openings || '—'}</td>
                                    <td className='px-3 py-2.5'>
                                        <button
                                            onClick={() => onViewCandidates(v)}
                                            title='View candidate details'
                                            className='press inline-flex h-7 items-center gap-1.5 rounded-md bg-[#f2f5f7] px-2 text-xs font-medium text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60 tabular-nums hover:bg-[var(--brand-600)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                                        >
                                            <Icon className="fa-solid fa-users text-[10px] opacity-70" />
                                            {(v.candidates || []).length}
                                        </button>
                                    </td>
                                    <td className={`${td} ${fromXl}`}>{v.salaryRange || '—'}</td>
                                    <td className={`${td} ${fromLg}`}>{v.experienceRequired || '—'}</td>
                                    <td className={`${td} ${fromLg} tabular-nums`}>{v.targetDate || '—'}</td>
                                    <td className={`${td} ${fromXl}`}>{v.requestorName || '—'}</td>
                                    <td className={`${td} ${fromXl} tabular-nums`}>{formatTimestamp(v.requestedOn)}</td>
                                    <td className='px-3 py-2.5'><VacancyStatusBadge status={v.status} /></td>
                                    <td className='px-3 py-2.5'>
                                        <div className='flex items-center justify-center'>
                                            <ActionButtons vacancy={v} onView={onView} onUpdate={onUpdate} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className='px-4 py-3 border-t border-slate-100 bg-white/50'>
                    <Pagination
                        page={paging.page}
                        pages={paging.pages}
                        pageSize={paging.pageSize}
                        total={paging.total}
                        onPage={paging.setPage}
                        onPageSize={paging.setPageSize}
                        label='vacancies'
                    />
                </div>
            </div>

            {/* ============ MOBILE CARDS ============ */}
            <div className='md:hidden'>
                <div className='space-y-3'>
                    {vacancies.map((v) => (
                        <div key={v._id} className='glass-panel rounded-2xl p-4'>

                            {/* Top row: ID chip + View / Update actions */}
                            <div className='flex items-center justify-between gap-2'>
                                <span className='inline-flex items-center h-7 px-2 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 tabular-nums'>
                                    {v.jobId}
                                </span>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => onView(v)}
                                        title='View full details'
                                        aria-label='View full details'
                                        className={touchIcon}
                                    >
                                        <Icon className="fa-solid fa-eye text-[13px]" />
                                    </button>
                                    <button
                                        onClick={() => onUpdate(v)}
                                        disabled={v.status === 'Closed'}
                                        title={v.status === 'Closed' ? 'This hiring request is closed' : 'Update'}
                                        className='press gradient-brand inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                        <Icon className="fa-solid fa-pen-to-square text-[12px]" />
                                        Update
                                    </button>
                                </div>
                            </div>

                            {/* Designation: headline field, tap to view */}
                            <button onClick={() => onView(v)} className='text-left block w-full mt-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                                <p className={metaLabel}>Designation</p>
                                <h3 className='text-base font-semibold text-[var(--ink)] leading-snug truncate mt-0.5'>{v.designation}</h3>
                            </button>

                            {/* Details grid */}
                            <div className='grid grid-cols-2 gap-x-3 gap-y-3 mt-4 pt-3.5 border-t border-slate-100'>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Branch</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.branch || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Status</p>
                                    <div className='mt-0.5'><VacancyStatusBadge status={v.status} /></div>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Vacancies</p>
                                    <p className='text-[13px] text-slate-800 font-medium mt-0.5 tabular-nums'>{v.openings || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Candidates</p>
                                    <button
                                        onClick={() => onViewCandidates(v)}
                                        title='View candidate details'
                                        className='press -ml-2 inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-[var(--brand-600)] tabular-nums hover:bg-[#f2f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                                    >
                                        <Icon className="fa-solid fa-users text-[11px] text-slate-400" />
                                        {(v.candidates || []).length}
                                        <Icon className="fa-solid fa-chevron-right text-[9px] text-slate-400" />
                                    </button>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Experience</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.experienceRequired || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Target date</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5 tabular-nums'>{v.targetDate || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Salary range</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.salaryRange || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Requested by</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.requestorName || '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-4 mb-2'>
                    <Pagination
                        page={paging.page}
                        pages={paging.pages}
                        pageSize={paging.pageSize}
                        total={paging.total}
                        onPage={paging.setPage}
                        onPageSize={paging.setPageSize}
                        label='vacancies'
                    />
                </div>
            </div>
        </>
    )
}

export default VacancyGrid
