// Small shared pieces for the Master (HR set-up) screens
import React, { useCallback, useEffect, useState } from 'react'

export const cn = (...classes) => classes.filter(Boolean).join(' ')

const buttonBase = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A7DC0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
export const buttonClass = {
    primary: `${buttonBase} border-[#062139] bg-[#062139] text-white hover:bg-[#0a2f52]`,
    secondary: `${buttonBase} border-slate-200 bg-white text-[#1B4A7B] hover:bg-[#F0F6FA]`,
    danger: `${buttonBase} border-red-200 bg-white text-red-700 hover:bg-red-50`,
}
export const inputClass = 'min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A7DC0]'

export const Button = ({ variant = 'secondary', className, ...props }) => (
    <button type='button' className={cn(buttonClass[variant], className)} {...props} />
)

// Labelled input / select / textarea
export const Field = ({ label, hint, className, children }) => (
    <label className={cn('grid gap-1.5 text-xs font-medium text-slate-600', className)}>
        {label}
        {children}
        {hint && <span className='text-[11px] font-normal text-slate-400'>{hint}</span>}
    </label>
)

export const Check = ({ label, checked, onChange }) => (
    <label className='flex items-center gap-2 text-xs font-medium text-slate-600'>
        <input type='checkbox' checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} className='h-4 w-4 accent-[#062139]' />
        {label}
    </label>
)

export const ErrorBanner = ({ message }) => message
    ? <p role='alert' className='rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800'>{message}</p>
    : null

export const Notice = ({ message }) => message
    ? <p role='status' className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800'>{message}</p>
    : null

export const Card = ({ children, className }) => (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white', className)}>{children}</div>
)

// Simple table: columns = [{ key, label, render?, className? }]
export const Table = ({ columns, rows, empty = 'Nothing here yet.', rowKey = (row) => row._id }) => (
    <Card>
        <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
                <thead className='bg-[#062139] text-left text-[11px] uppercase tracking-wide text-slate-200'>
                    <tr>{columns.map((column) => <th key={column.key} className={cn('px-3 py-2.5 font-semibold', column.className)}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length ? rows.map((row) => (
                        <tr key={rowKey(row)} className='border-b border-slate-100 last:border-0 hover:bg-slate-50/60'>
                            {columns.map((column) => <td key={column.key} className={cn('px-3 py-2.5 align-top text-[13px] text-slate-700', column.className)}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length} className='p-8 text-center text-sm text-slate-500'>{empty}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </Card>
)

export const Badge = ({ tone = 'slate', children }) => {
    const tones = {
        green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        slate: 'border-slate-200 bg-slate-100 text-slate-600',
        amber: 'border-amber-200 bg-amber-50 text-amber-800',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
    }
    return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold', tones[tone])}>{children}</span>
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

export const LoadState = ({ loading, error }) => loading
    ? <p role='status' className='p-6 text-sm text-slate-500'>Loading…</p>
    : <ErrorBanner message={error} />
