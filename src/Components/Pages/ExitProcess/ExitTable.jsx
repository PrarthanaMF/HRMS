import React from 'react'
import { useSelector } from 'react-redux'
import { selectFilteredExits } from '../../../Store/Redux/ExitProcess/ExitSlice'
import { Pagination, usePagination } from '../../Common/Pagination'

import Icon from '../../Common/Icon'

// Each status keeps its colour meaning; badges are tags (rounded-md + inset ring), not pills
const STATUS_STYLES = {
    'Pending HR':      { badge: 'bg-amber-50 text-amber-800 ring-amber-200',       dot: 'bg-amber-500' },
    'HR Reviewing':    { badge: 'bg-blue-50 text-[#1f4e6b] ring-blue-200',          dot: 'bg-blue-500' },
    'F&F Initiated':   { badge: 'bg-indigo-50 text-indigo-800 ring-indigo-200',    dot: 'bg-indigo-500' },
    'F&F Pending':     { badge: 'bg-violet-50 text-violet-800 ring-violet-200',    dot: 'bg-violet-500' },
    'No Due Cleared':  { badge: 'bg-teal-50 text-teal-800 ring-teal-200',          dot: 'bg-teal-500' },
    'Withdrawn':       { badge: 'bg-slate-50 text-slate-600 ring-slate-200',       dot: 'bg-slate-400' },
    'Exited':          { badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
}
const FALLBACK = { badge: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400' }

const StatusBadge = ({ status }) => {
    const tone = STATUS_STYLES[status] || FALLBACK
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone.badge}`}>
            <span aria-hidden='true' className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}></span>
            {status}
        </span>
    )
}

const Initials = ({ name }) => {
    const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return (
        <div aria-hidden='true' className='gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold text-white ring-1 ring-white/20'>
            {initials}
        </div>
    )
}

const th = 'px-4 py-3 font-semibold lg:whitespace-nowrap'
const fromLg = 'hidden lg:table-cell'
const fromXl = 'hidden xl:table-cell'
const rowButton = 'press inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 text-xs font-semibold text-[var(--brand-600)] transition-colors hover:border-[#cfdce5] hover:bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'

const ExitTable = ({ onMoreInfo }) => {
    const allExits = useSelector(selectFilteredExits)
    const paging = usePagination(allExits, { resetKey: allExits.length })
    const exits = paging.pageItems

    if (allExits.length === 0) {
        return (
            <div className='glass-panel rounded-2xl px-6 py-12 text-center'>
                <span aria-hidden='true' className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E3EEF6] to-[#CFE2F0] text-[var(--brand-600)] ring-1 ring-inset ring-white'>
                    <Icon className="fa-solid fa-person-running text-2xl" />
                </span>
                <p className='text-sm font-medium text-[var(--ink)]'>No exit records match your filters</p>
                <p className='mt-1 text-[13px] text-slate-500'>Clear the search or reset the filters to see every record.</p>
            </div>
        )
    }

    return (
        <div className='glass-strong rounded-2xl overflow-hidden'>

            {/* Desktop table */}
            {/* Tablets show the essentials; ID, branch, designation and resignation date join from lg / xl */}
            <div className='hidden md:block max-h-[600px] overflow-y-auto'>
                <table className='w-full text-sm [overflow-wrap:anywhere]'>
                    <caption className='sr-only'>Exit records</caption>
                    <thead className='sticky top-0 z-10 bg-[#edf1f4] border-b border-[var(--line)]'>
                        <tr className='text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500'>
                            <th scope='col' className={`${th} ${fromLg}`}>Employee ID</th>
                            <th scope='col' className={th}>Employee</th>
                            <th scope='col' className={th}>Department</th>
                            <th scope='col' className={`${th} ${fromXl}`}>Designation</th>
                            <th scope='col' className={`${th} ${fromLg}`}>Branch</th>
                            <th scope='col' className={`${th} ${fromXl}`}>Resignation date</th>
                            <th scope='col' className={th}>Last working date</th>
                            <th scope='col' className={th}>Status</th>
                            <th scope='col' className={`${th} text-right`}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exits.map((e) => (
                            <tr key={e._id} className='border-b border-slate-100 last:border-0 transition-colors hover:bg-[#f2f5f7]/60'>
                                <td className={`px-4 py-3 ${fromLg}`}>
                                    <span className='font-mono text-xs font-semibold tabular-nums text-slate-700'>{e.empId}</span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2.5'>
                                        <Initials name={e.name} />
                                        <div className='min-w-0'>
                                            <p className='text-sm font-medium text-[var(--ink)]'>{e.name}</p>
                                            <p className='text-xs text-slate-500'><span className='font-mono tabular-nums lg:hidden'>{e.empId} · </span>{e.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-slate-600 text-[13px]'>{e.department}</td>
                                <td className={`px-4 py-3 text-slate-600 text-[13px] ${fromXl}`}>{e.designation}</td>
                                <td className={`px-4 py-3 text-slate-600 text-[13px] ${fromLg}`}>{e.branch}</td>
                                <td className={`px-4 py-3 text-slate-600 text-[13px] tabular-nums ${fromXl}`}>{e.resignationDate}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] tabular-nums'>{e.lastWorkingDate}</td>
                                <td className='px-4 py-3'>
                                    <StatusBadge status={e.status} />
                                </td>
                                <td className='px-4 py-3 text-right'>
                                    <button
                                        type='button'
                                        onClick={() => onMoreInfo(e)}
                                        className={rowButton}
                                        title='View full details'
                                        aria-label={`View details for ${e.name}`}
                                    >
                                        <Icon className="fa-solid fa-eye text-xs" />
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className='md:hidden divide-y divide-slate-100'>
                {exits.map((e) => (
                    <div key={e._id} className='p-4 flex items-start gap-3'>
                        <Initials name={e.name} />
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2 mb-1'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-[var(--ink)] truncate'>{e.name}</p>
                                    <p className='text-xs text-slate-500 truncate'><span className='font-mono tabular-nums'>{e.empId}</span>, {e.branch}</p>
                                </div>
                                <StatusBadge status={e.status} />
                            </div>
                            <dl className='grid grid-cols-2 gap-2 mt-2 text-xs'>
                                <div className='min-w-0'>
                                    <dt className='text-[11px] text-slate-500'>Department</dt>
                                    <dd className='text-slate-700 truncate'>{e.department}</dd>
                                </div>
                                <div className='min-w-0'>
                                    <dt className='text-[11px] text-slate-500'>Last working date</dt>
                                    <dd className='text-slate-700 tabular-nums truncate'>{e.lastWorkingDate}</dd>
                                </div>
                            </dl>
                            <div className='mt-3 flex justify-end'>
                                <button
                                    type='button'
                                    onClick={() => onMoreInfo(e)}
                                    className={`${rowButton} h-10 px-3`}
                                >
                                    <Icon className="fa-solid fa-eye text-xs" />
                                    View full details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='px-4 py-3 border-t border-slate-200/70 bg-white/50'>
                <Pagination
                    page={paging.page}
                    pages={paging.pages}
                    pageSize={paging.pageSize}
                    total={paging.total}
                    onPage={paging.setPage}
                    onPageSize={paging.setPageSize}
                    label='exit records'
                />
            </div>
        </div>
    )
}

export default ExitTable
