import React, { useId, useRef, useState } from 'react'
import { api, download } from '../../api/client'
import { RequestModal } from '../Pages/Attendance/AttendanceForms'

import Icon from './Icon'
/*
 * Bulk upload from a spreadsheet for endpoints that follow the backend's import contract
 * (employees, holidays): download the template, check the file first ("Check only" saves
 * nothing), then import. The result lists counts and the rows that need fixing.
 *
 * config: { title, help, template, upload, whoLabel, who(row) }
 */
const MAX_BYTES = 5 * 1024 * 1024

const button = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
const secondary = `${button} border-slate-200 bg-white text-[#1f4e6b] hover:bg-[#f2f5f7]`
const primary = `${button} border-[#1f4e6b] bg-[#1f4e6b] text-white hover:bg-[#163a58]`

export function SpreadsheetImportModal({ open, config, onClose, onImported }) {
    const inputId = useId()
    const fileInput = useRef(null)
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const reset = () => {
        setFile(null)
        setResult(null)
        setError('')
        if (fileInput.current) fileInput.current.value = ''
    }
    const close = () => {
        if (busy) return
        reset()
        onClose()
    }

    const choose = (event) => {
        const selected = event.target.files?.[0] || null
        setResult(null)
        setError('')
        if (selected && !/\.(csv|xlsx)$/i.test(selected.name)) {
            setFile(null)
            event.target.value = ''
            setError('Choose a CSV or Excel (.xlsx) file.')
            return
        }
        if (selected && (!selected.size || selected.size > MAX_BYTES)) {
            setFile(null)
            event.target.value = ''
            setError('Choose a non-empty file no larger than 5 MB.')
            return
        }
        setFile(selected)
    }

    const run = async (work) => {
        setBusy(true)
        setError('')
        try {
            return await work()
        } catch (cause) {
            setError(cause?.message || 'Something went wrong. Please try again.')
            return undefined
        } finally {
            setBusy(false)
        }
    }

    const send = (dryRun) => run(async () => {
        const form = new FormData()
        form.append('file', file)
        form.append('dryRun', String(dryRun))
        const data = await api.post(config.upload, form)
        setResult(data)
        if (!dryRun) onImported?.(data)
    })

    return (
        <RequestModal open={open} title={config.title} subtitle={config.help} icon='fa-solid fa-file-import' onClose={close}>
            <div className='space-y-3 p-4 sm:p-5' aria-busy={busy}>
                <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dce6ed] bg-gradient-to-r from-[#f2f5f7] to-white/60 p-3'>
                    <p className='text-xs text-slate-600'>Start from the template so the columns match.</p>
                    <button type='button' onClick={() => run(() => download(config.template))} disabled={busy} className={secondary}>
                        <Icon aria-hidden='true' className='fa-solid fa-download' />Template
                    </button>
                </div>

                <div>
                    <label htmlFor={inputId} className='mb-1.5 block text-xs font-semibold text-slate-700'>Spreadsheet</label>
                    <input
                        id={inputId}
                        ref={fileInput}
                        type='file'
                        accept='.xlsx,.csv'
                        disabled={busy}
                        onChange={choose}
                        aria-describedby={`${inputId}-help`}
                        className='block w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f2f5f7] file:px-3 file:py-2 file:font-semibold file:text-[#1f4e6b] disabled:opacity-50'
                    />
                    <p id={`${inputId}-help`} className='mt-1 text-[11px] text-slate-500'>Excel (.xlsx) or CSV, up to 5 MB</p>
                </div>

                {error && <p role='alert' className='rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800'>{error}</p>}

                {result && (
                    <div className='space-y-2'>
                        <p role='status' className={`rounded-lg border p-3 text-xs ${result.failed ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                            {result.dryRun ? 'Checked, nothing saved: ' : 'Imported: '}
                            {result.totalRows} row(s) — {result.created} new, {result.updated} updated, {result.unchanged} unchanged, {result.failed} with problems.
                            {result.dryRun && !result.failed && ' Everything looks fine; click Import to save.'}
                        </p>
                        {result.rowErrors?.length > 0 && (
                            <div className='max-h-56 overflow-y-auto rounded-xl border border-slate-200'>
                                {/* Phones: one card per row that needs fixing */}
                                <ul className='divide-y divide-slate-100 md:hidden' aria-label='Rows that need fixing'>
                                    {result.rowErrors.map((row) => (
                                        <li key={`${row.rowNumber}-${row.message}`} className='p-3'>
                                            <p className='text-xs font-semibold text-slate-800 tabular-nums'>Row {row.rowNumber}</p>
                                            <dl className='mt-1.5 grid gap-1.5 text-xs'>
                                                <div className='min-w-0'><dt className='text-[11px] font-medium text-slate-500'>{config.whoLabel}</dt><dd className='text-slate-700 [overflow-wrap:anywhere]'>{config.who(row) || '—'}</dd></div>
                                                <div className='min-w-0'><dt className='text-[11px] font-medium text-slate-500'>Problem</dt><dd className='text-slate-700 [overflow-wrap:anywhere]'>{row.message}</dd></div>
                                            </dl>
                                        </li>
                                    ))}
                                </ul>
                                <table className='hidden w-full text-xs [overflow-wrap:anywhere] md:table'>
                                    <caption className='sr-only'>Rows that need fixing</caption>
                                    <thead className='sticky top-0 bg-[#edf1f4] border-b border-[var(--line)] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500'>
                                        <tr>
                                            <th scope='col' className='w-14 px-3 py-2 font-semibold'>Row</th>
                                            <th scope='col' className='w-40 px-3 py-2 font-semibold'>{config.whoLabel}</th>
                                            <th scope='col' className='px-3 py-2 font-semibold'>Problem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.rowErrors.map((row) => (
                                            <tr key={`${row.rowNumber}-${row.message}`} className='border-b border-slate-100 last:border-0'>
                                                <td className='px-3 py-2 align-top tabular-nums text-slate-700'>{row.rowNumber}</td>
                                                <td className='px-3 py-2 align-top text-slate-700'>{config.who(row) || '—'}</td>
                                                <td className='px-3 py-2 align-top text-slate-700'>{row.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className='flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3'>
                    <button type='button' onClick={close} disabled={busy} className={secondary}>{result && !result.dryRun ? 'Done' : 'Cancel'}</button>
                    <button type='button' onClick={() => send(true)} disabled={!file || busy} className={secondary}>Check only</button>
                    <button type='button' onClick={() => send(false)} disabled={!file || busy} className={primary}>
                        {busy && <Icon aria-hidden='true' className='fa-solid fa-spinner animate-spin' />}
                        {busy ? 'Working…' : 'Import'}
                    </button>
                </div>
            </div>
        </RequestModal>
    )
}

export const EMPLOYEE_IMPORT = {
    title: 'Import Employees',
    help: 'Adds new employees and updates existing ones (matched by Employee ID, otherwise by biometric code). Blank cells keep the current value. Salary is not imported.',
    template: '/employees/import/template',
    upload: '/employees/import',
    whoLabel: 'Biometric code',
    who: (row) => row.biometricCode || row.name,
}

export const HOLIDAY_IMPORT = {
    title: 'Import Holidays',
    help: "Company, branch or employee holidays for the year. Rows with the same date and name update the existing holiday.",
    template: '/holidays/import/template',
    upload: '/holidays/import',
    whoLabel: 'Holiday',
    who: (row) => row.name,
}
