import React from 'react'
import { Link } from 'react-router-dom'

import Icon from '../../Common/Icon'

const cn = (...values) => values.filter(Boolean).join(' ')

const StatusBadge = ({ status }) => (
    <span className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200',
    )}>
        <span aria-hidden='true' className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
        {status}
    </span>
)

const Initials = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return (
        <div aria-hidden='true' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f4e6b] to-[#2b6485] text-[11px] font-semibold text-white shadow-[0_6px_14px_-8px_rgb(8_26_46/0.9)] ring-1 ring-white/30'>
            {initials}
        </div>
    )
}

const headerRow = 'bg-[#edf1f4] border-b border-[var(--line)]'
const th = 'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500'
const pagerButton = 'press inline-flex h-8 min-w-8 pointer-coarse:h-10 pointer-coarse:min-w-10 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 px-2 text-xs font-semibold text-slate-600 hover:border-[#cfdce5] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] disabled:cursor-not-allowed disabled:opacity-40'
const infoButton = 'press inline-flex h-8 pointer-coarse:h-10 pointer-coarse:min-w-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 text-xs font-semibold text-[var(--brand-600)] hover:border-[#cfdce5] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'

// Placeholder rows shaped like the table while the first page loads
const TableSkeleton = () => (
    <div role='status' aria-label='Loading employees' className='glass-strong overflow-hidden rounded-2xl'>
        <div className={`${headerRow} h-11`} />
        <div className='divide-y divide-slate-100/80'>
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className='flex items-center gap-4 px-4 py-3'>
                    <div className='skeleton hidden h-3 w-14 md:block' />
                    <div className='skeleton h-9 w-9 shrink-0 rounded-xl' />
                    <div className='min-w-0 flex-1 space-y-2'>
                        <div className='skeleton h-3 w-40 max-w-full' />
                        <div className='skeleton h-2.5 w-56 max-w-full' />
                    </div>
                    <div className='skeleton hidden h-3 w-24 md:block' />
                    <div className='skeleton hidden h-3 w-24 lg:block' />
                    <div className='skeleton h-5 w-14 rounded-md' />
                </div>
            ))}
        </div>
    </div>
)

const WorkforceTable = ({ employees, pagination, loading, error, page, onPage }) => {
    if (error) {
        return (
            <div role='alert' className='flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-800'>
                <Icon aria-hidden='true' className='fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-red-600' />
                {error.message || 'Unable to load employees.'}
            </div>
        )
    }

    if (loading && employees.length === 0) {
        return <TableSkeleton />
    }

    if (employees.length === 0) {
        return (
            <div className='glass-panel flex flex-col items-center rounded-2xl px-6 py-12 text-center'>
                <span aria-hidden='true' className='mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/70'>
                    <Icon className="fa-solid fa-users-slash text-xl" />
                </span>
                <p className='text-sm font-semibold text-[var(--ink)]'>No employees match these filters.</p>
                <p className='mt-1 max-w-sm text-[13px] text-slate-500'>Try a shorter search, or reset the filters to see everyone.</p>
            </div>
        )
    }

    return (
        <div className='glass-strong overflow-hidden rounded-2xl'>

            {/* ============ DESKTOP TABLE ============ */}
            <div className='hidden md:block'>
                <table className='w-full table-fixed text-sm'>
                    <thead className={headerRow}>
                        <tr>
                            <th scope='col' className={cn(th, 'w-24')}>ID</th>
                            <th scope='col' className={th}>Employee</th>
                            <th scope='col' className={th}>Department</th>
                            <th scope='col' className={cn(th, 'hidden lg:table-cell')}>Designation</th>
                            <th scope='col' className={cn(th, 'hidden xl:table-cell')}>Branch</th>
                            <th scope='col' className={cn(th, 'w-24')}>Status</th>
                            <th scope='col' className={cn(th, 'w-14 text-right')}><span className='sr-only'>Details</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp._id} className='border-b border-slate-100/80 transition-colors last:border-0 hover:bg-[#f2f5f7]/60'>
                                <td className='whitespace-nowrap px-4 py-3'>
                                    <span className='font-mono text-xs font-semibold tabular-nums text-slate-700'>{emp.empId}</span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2.5'>
                                        <Initials name={emp.name} />
                                        <div className='min-w-0'>
                                            <p className='truncate text-sm font-medium text-[var(--ink)]'>{emp.name}</p>
                                            <p className='truncate text-xs text-slate-500'>{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-[13px] text-slate-600 [overflow-wrap:anywhere]'>{emp.department}</td>
                                <td className='hidden px-4 py-3 text-[13px] text-slate-600 lg:table-cell'>{emp.designation}</td>
                                <td className='hidden px-4 py-3 text-[13px] text-slate-600 xl:table-cell'>{emp.branch}</td>
                                <td className='whitespace-nowrap px-4 py-3'><StatusBadge status={emp.status} /></td>
                                <td className='px-4 py-3 text-right'>
                                    <Link
                                        to={`/workforce/${emp._id}`}
                                        aria-label={`Open ${emp.name}`}
                                        title='Open employee'
                                        className={cn(infoButton, 'w-8 px-0')}
                                    >
                                        <Icon aria-hidden='true' className="fa-solid fa-arrow-right text-sm" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ============ MOBILE CARDS ============ */}
            <ul className='divide-y divide-slate-100/80 md:hidden'>
                {employees.map((emp) => (
                    <li key={emp._id} className='flex items-start gap-3 p-4'>

                        <Initials name={emp.name} />

                        <div className='min-w-0 flex-1'>
                            {/* Name + status */}
                            <div className='flex items-start justify-between gap-2'>
                                <div className='min-w-0'>
                                    <p className='truncate text-sm font-semibold text-[var(--ink)]'>{emp.name}</p>
                                    <p className='truncate text-xs text-slate-500'>
                                        <span className='font-mono tabular-nums'>{emp.empId}</span>
                                        {emp.branch && <span>, {emp.branch}</span>}
                                    </p>
                                </div>
                                <StatusBadge status={emp.status} />
                            </div>

                            {/* Department + designation */}
                            <dl className='mt-2.5 grid grid-cols-2 gap-2 text-xs'>
                                <div className='min-w-0'>
                                    <dt className='text-[11px] text-slate-500'>Department</dt>
                                    <dd className='truncate text-slate-700'>{emp.department || '—'}</dd>
                                </div>
                                <div className='min-w-0'>
                                    <dt className='text-[11px] text-slate-500'>Designation</dt>
                                    <dd className='truncate text-slate-700'>{emp.designation || '—'}</dd>
                                </div>
                            </dl>

                            {/* Opens the employee page */}
                            <Link
                                to={`/workforce/${emp._id}`}
                                aria-label={`Open ${emp.name}`}
                                className={cn(infoButton, 'ml-auto mt-3 flex h-10 w-fit')}
                            >
                                Open
                                <Icon aria-hidden='true' className="fa-solid fa-arrow-right text-sm" />
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Footer: server-side pages */}
            <nav aria-label='Pagination' className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3'>
                <p className='text-xs text-slate-500' aria-live='polite'>
                    Showing <span className='font-semibold tabular-nums text-slate-700'>{employees.length}</span> of{' '}
                    <span className='font-semibold tabular-nums text-slate-700'>{pagination?.total ?? employees.length}</span> employees
                    {loading && <span className='ml-2 text-slate-400'>Updating…</span>}
                </p>
                {pagination?.pages > 1 && (
                    <div className='flex items-center gap-1.5'>
                        <button type='button' disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label='Previous page' className={pagerButton}>
                            <Icon aria-hidden='true' className='fa-solid fa-chevron-left text-[10px]' />
                        </button>
                        <span className='px-1.5 text-xs tabular-nums text-slate-500'>Page <span className='font-semibold text-slate-700'>{page}</span> of {pagination.pages}</span>
                        <button type='button' disabled={page >= pagination.pages} onClick={() => onPage(page + 1)} aria-label='Next page' className={pagerButton}>
                            <Icon aria-hidden='true' className='fa-solid fa-chevron-right text-[10px]' />
                        </button>
                    </div>
                )}
            </nav>
        </div>
    )
}

export default WorkforceTable
