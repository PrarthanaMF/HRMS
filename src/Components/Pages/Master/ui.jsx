// Small shared pieces for the Master (HR set-up) screens
import React, { useCallback, useEffect, useState } from 'react'
import { PAGE_SIZES, Pagination, usePagination } from '../../Common/Pagination'
import Icon from '../../Common/Icon'

export const cn = (...classes) => classes.filter(Boolean).join(' ')

// Row-size buttons (h-8, 40px on touch screens) and page/form-size buttons (h-10)
const buttonSizes = {
    sm: 'h-8 rounded-lg px-2.5 text-xs pointer-coarse:h-10',
    md: 'h-10 rounded-xl px-4 text-[13px]',
}
const buttonBase = 'press inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
const buttonTones = {
    primary: 'border-transparent gradient-brand text-white shadow-[0_10px_22px_-12px_rgb(8_26_46/0.95)] hover:brightness-110',
    secondary: 'border-white/80 bg-white/70 text-[var(--brand-600)] shadow-sm backdrop-blur hover:border-[#cfdce5] hover:bg-white',
    danger: 'border-red-200 bg-white/80 text-red-700 hover:border-red-300 hover:bg-red-50',
}
const makeButtons = (size) => Object.fromEntries(Object.entries(buttonTones).map(([tone, cls]) => [tone, `${buttonBase} ${buttonSizes[size]} ${cls}`]))
export const buttonClass = makeButtons('sm')
const buttonClassMd = makeButtons('md')
export const inputClass = 'h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6485] [&:is(textarea)]:h-auto [&:is(textarea)]:py-2'

// size='md' for page actions and form footers; the default small size is for table rows
export const Button = ({ variant = 'secondary', size = 'sm', className, ...props }) => (
    <button type='button' className={cn((size === 'md' ? buttonClassMd : buttonClass)[variant], className)} {...props} />
)

// Labelled input / select / textarea
export const Field = ({ label, hint, className, children }) => (
    <label className={cn('grid min-w-0 gap-1.5 text-[13px] font-medium text-slate-700', className)}>
        {label}
        {children}
        {hint && <span className='text-xs font-normal text-slate-500'>{hint}</span>}
    </label>
)

export const Check = ({ label, checked, onChange }) => (
    <label className='flex min-h-10 cursor-pointer items-center gap-2 text-[13px] font-medium text-slate-700'>
        <input type='checkbox' checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} className='h-4 w-4 shrink-0 accent-[#1f4e6b]' />
        {label}
    </label>
)

export const ErrorBanner = ({ message }) => message
    ? (
        <p role='alert' className='flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/90 p-3 text-[13px] text-red-800'>
            <Icon aria-hidden='true' className='fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-red-600' />
            {message}
        </p>
    )
    : null

export const Notice = ({ message }) => message
    ? (
        <p role='status' className='flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-[13px] text-emerald-800'>
            <Icon aria-hidden='true' className='fa-solid fa-circle-check mt-0.5 shrink-0 text-emerald-600' />
            {message}
        </p>
    )
    : null

export const Card = ({ children, className }) => (
    <div className={cn('glass-panel overflow-hidden rounded-2xl', className)}>{children}</div>
)

// Icon tile + one sentence + the next step
export const EmptyState = ({ icon = 'fa-folder-open', children }) => (
    <div className='flex flex-col items-center px-6 py-10 text-center'>
        <span aria-hidden='true' className='mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/70'>
            <Icon className={`fa-solid ${icon} text-lg`} />
        </span>
        <p className='max-w-md text-[13px] text-slate-600'>{children}</p>
    </div>
)

// Simple table: columns = [{ key, label, render?, className? }]
// Pages through long lists; `pageSize={0}` shows every row (e.g. short result tables)
export const Table = ({ columns, rows, empty = 'Nothing here yet.', rowKey = (row) => row._id, pageSize = 20, label = 'rows' }) => {
    const paging = usePagination(rows, { pageSize: pageSize || Math.max(rows.length, 1) })
    const shown = pageSize ? paging.pageItems : rows
    const cell = (column, row) => (column.render ? column.render(row) : row[column.key] ?? '—')
    // Phones: each row as a card — first column as its title, labelled fields, then the
    // unlabelled (action) columns at the bottom so buttons stay on screen
    const [titleColumn, ...restColumns] = columns
    const fieldColumns = restColumns.filter((column) => column.label)
    const actionColumns = restColumns.filter((column) => !column.label)
    return (
        <div className='glass-strong overflow-hidden rounded-2xl'>
            <ul className='divide-y divide-slate-100/80 md:hidden'>
                {shown.length ? shown.map((row) => (
                    <li key={rowKey(row)} className='p-4'>
                        <div className='text-[14px] font-semibold text-[var(--ink)]'>{cell(titleColumn, row)}</div>
                        {fieldColumns.length > 0 && (
                            <dl className='mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5'>
                                {fieldColumns.map((column) => (
                                    <div key={column.key} className='min-w-0'>
                                        <dt className='text-[12px] font-medium text-slate-500'>{column.label}</dt>
                                        <dd className='mt-0.5 break-words text-[13px] tabular-nums text-slate-700'>{cell(column, row)}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {actionColumns.map((column) => (
                            <div key={column.key} className='mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3'>{cell(column, row)}</div>
                        ))}
                    </li>
                )) : <li><EmptyState>{empty}</EmptyState></li>}
            </ul>
            {/* Tablets and up: the table fits its box — long values wrap, headers wrap until lg,
                and a row's buttons wrap under each other rather than widening the table */}
            <div className='hidden md:block'>
                <table className='w-full text-sm'>
                    <thead className='bg-[#edf1f4] border-b border-[var(--line)] text-left'>
                        <tr>{columns.map((column) => <th key={column.key} scope='col' className={cn('px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 first:pl-4 last:pr-4 lg:whitespace-nowrap', column.className)}>{column.label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {shown.length ? shown.map((row) => (
                            <tr key={rowKey(row)} className='border-b border-slate-100/80 transition-colors last:border-0 hover:bg-[#f2f5f7]/60'>
                                {columns.map((column) => <td key={column.key} className={cn('px-3 py-2.5 align-top text-[13px] tabular-nums text-slate-700 [overflow-wrap:anywhere] first:pl-4 last:pr-4', !column.label && '[&>div]:flex-wrap', column.className)}>{cell(column, row)}</td>)}
                            </tr>
                        )) : (
                            <tr><td colSpan={columns.length}><EmptyState>{empty}</EmptyState></td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pageSize > 0 && rows.length > PAGE_SIZES[0] && (
                <Pagination
                    className='border-t border-slate-100 px-4 py-3'
                    page={paging.page}
                    pages={paging.pages}
                    pageSize={paging.pageSize}
                    total={paging.total}
                    onPage={paging.setPage}
                    onPageSize={paging.setPageSize}
                    label={label}
                />
            )}
        </div>
    )
}

export const Badge = ({ tone = 'slate', children }) => {
    const tones = {
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        slate: 'bg-slate-100 text-slate-600 ring-slate-200',
        amber: 'bg-amber-50 text-amber-800 ring-amber-200',
        blue: 'bg-sky-50 text-[var(--brand-600)] ring-[#cfdce5]',
    }
    return <span className={cn('inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset', tones[tone])}>{children}</span>
}

// Load data with loading / error state and a reload function
export function useLoad(loader, deps) {
    const [state, setState] = useState({ data: null, loading: true, error: '' })
    const [revision, setRevision] = useState(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const load = useCallback(loader, deps)

    useEffect(() => {
        let active = true
        setState((previous) => ({ ...previous, loading: true, error: '' }))
        load().then(
            (data) => { if (active) setState({ data, loading: false, error: '' }) },
            (error) => { if (active) setState({ data: null, loading: false, error: error.message || 'Unable to load.' }) },
        )
        return () => { active = false }
    }, [load, revision])

    return { ...state, reload: () => setRevision((value) => value + 1) }
}

// Run a save / delete, keeping busy and error state for the form
export function useAction() {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const run = async (action) => {
        setBusy(true)
        setError('')
        try {
            return await action()
        } catch (cause) {
            setError(cause.message || 'Something went wrong.')
            return undefined
        } finally {
            setBusy(false)
        }
    }
    return { busy, error, setError, run }
}

// Loading: skeleton rows shaped like a table; otherwise the error, if any
export const LoadState = ({ loading, error }) => loading
    ? (
        <div role='status' aria-label='Loading' className='glass-strong overflow-hidden rounded-2xl'>
            <div className='h-11 bg-[#edf1f4] border-b border-[var(--line)]' />
            <div className='divide-y divide-slate-100/80'>
                {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className='flex items-center gap-4 px-4 py-3.5'>
                        <div className='skeleton h-3 w-32' />
                        <div className='skeleton h-3 flex-1' />
                        <div className='skeleton hidden h-3 w-24 sm:block' />
                        <div className='skeleton h-5 w-14 rounded-md' />
                    </div>
                ))}
            </div>
        </div>
    )
    : <ErrorBanner message={error} />
