// Bulk uploads from a spreadsheet: employees, holidays and attendance. Download the template, fill it,
// check it first ("Check only" saves nothing), then import. Holidays can also be managed one by one here.
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { api, download } from '../../../api/client'
import { forgetContext } from '../../../api/attendance'
import { invalidateAttendance } from '../../../Store/Redux/Attendance/AttendanceSlice'
import { HolidayManager } from '../../../Pages/AttendanceHolidays'
import { Button, Card, ErrorBanner, Table, inputClass, useAction } from './ui'

const IMPORTS = [
    {
        key: 'employees',
        title: 'Employees',
        help: 'Adds new employees and updates existing ones (matched by Employee ID, otherwise by biometric code). Blank cells keep the current value. Salary is not imported.',
        template: '/employees/import/template',
        upload: '/employees/import',
    },
    {
        key: 'holidays',
        title: 'Holidays',
        help: 'Company, branch or employee holidays for the year. Rows with the same date and name update the existing holiday.',
        template: '/holidays/import/template',
        upload: '/holidays/import',
        manage: true,
    },
]

const fileInputClass = `${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs`

function ImportCard({ config }) {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [managing, setManaging] = useState(false)
    const { busy, error, run } = useAction()

    const send = (dryRun) => run(async () => {
        const form = new FormData()
        form.append('file', file)
        form.append('dryRun', String(dryRun))
        setResult(await api.post(config.upload, form))
    })

    return (
        <Card className='space-y-3 p-4'>
            <div className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0'>
                    <h3 className='text-sm font-bold text-slate-800'>{config.title}</h3>
                    <p className='mt-1 max-w-2xl text-xs text-slate-500'>{config.help}</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                    {config.manage && (
                        <Button onClick={() => setManaging((open) => !open)} aria-expanded={managing}><i className='fa-regular fa-calendar' />Manage Holidays</Button>
                    )}
                    <Button onClick={() => run(() => download(config.template))} disabled={busy}><i className='fa-solid fa-download' />Template</Button>
                </div>
            </div>
            {managing && <HolidayManager onClose={() => setManaging(false)} />}
            <input type='file' accept='.xlsx,.csv' disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null) }} className={fileInputClass} />
            <p className='text-[11px] text-slate-400'>Excel (.xlsx) or CSV, up to 5 MB</p>
            <ErrorBanner message={error} />
            <div className='flex flex-wrap gap-2'>
                <Button onClick={() => send(true)} disabled={!file || busy}>Check only</Button>
                <Button variant='primary' onClick={() => send(false)} disabled={!file || busy}>{busy ? 'Working…' : 'Import'}</Button>
            </div>
            {result && (
                <div className='space-y-2'>
                    <p role='status' className={`rounded-lg border p-3 text-xs ${result.failed ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                        {result.dryRun ? 'Checked, nothing saved: ' : 'Imported: '}
                        {result.totalRows} row(s) — {result.created} new, {result.updated} updated, {result.unchanged} unchanged, {result.failed} with problems.
                        {result.dryRun && !result.failed && ' Everything looks fine; click Import to save.'}
                    </p>
                    {result.rowErrors?.length > 0 && (
                        <Table
                            rows={result.rowErrors}
                            rowKey={(row) => `${row.rowNumber}-${row.message}`}
                            columns={[
                                { key: 'rowNumber', label: 'Row' },
                                { key: 'who', label: config.key === 'employees' ? 'Biometric code' : 'Holiday', render: (row) => row.biometricCode || row.name || '—' },
                                { key: 'message', label: 'Problem' },
                            ]}
                        />
                    )}
                </div>
            )}
        </Card>
    )
}

// The backend has no check-only mode or template for attendance: the import saves straight away
function AttendanceImportCard() {
    const dispatch = useDispatch()
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const { busy, error, run } = useAction()

    const send = () => run(async () => {
        const form = new FormData()
        form.append('file', file)
        const batch = await api.post('/attendance/import', form)
        forgetContext()
        dispatch(invalidateAttendance())
        setResult(batch)
    })

    const problems = [...(result?.rowErrors || []), ...(result?.rowWarnings || [])]

    return (
        <Card className='space-y-3 p-4'>
            <div className='min-w-0'>
                <h3 className='text-sm font-bold text-slate-800'>Attendance</h3>
                <p className='mt-1 max-w-2xl text-xs text-slate-500'>The biometric device's daily export, or the HRMS attendance sheet (Employee Code, Date, Status, optional Check In / Check Out). Rows are matched to employees by biometric code. Days corrected by hand are kept. The import saves straight away.</p>
            </div>
            <input type='file' accept='.xlsx,.csv' disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null) }} className={fileInputClass} />
            <p className='text-[11px] text-slate-400'>Excel (.xlsx) or CSV, up to 5 MB</p>
            <ErrorBanner message={error} />
            <div className='flex flex-wrap gap-2'>
                <Button variant='primary' onClick={send} disabled={!file || busy}>{busy ? 'Importing…' : 'Import Attendance'}</Button>
            </div>
            {result && (
                <div className='space-y-2'>
                    <p role='status' className={`rounded-lg border p-3 text-xs ${result.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                        {result.status === 'FAILED' ? 'Nothing imported: ' : `${result.format === 'BIOMETRIC' ? 'Biometric export' : 'Attendance sheet'} imported: `}
                        {result.totalRows} row(s) — {result.createdCount} new, {result.updatedCount} updated, {result.unchangedCount} unchanged, {result.skippedCount} skipped, {result.failedCount} with problems.
                        {result.unmatchedCodes?.length > 0 && ` Device codes not matched to anyone: ${result.unmatchedCodes.join(', ')}.`}
                    </p>
                    {problems.length > 0 && (
                        <Table
                            rows={problems}
                            rowKey={(row) => `${row.rowNumber}-${row.message}`}
                            columns={[
                                { key: 'rowNumber', label: 'Row' },
                                { key: 'employeeCode', label: 'Employee code' },
                                { key: 'message', label: 'Problem' },
                            ]}
                        />
                    )}
                </div>
            )}
        </Card>
    )
}

export default function ImportsTab() {
    return (
        <div className='space-y-4'>
            {IMPORTS.map((config) => <ImportCard key={config.key} config={config} />)}
            <AttendanceImportCard />
        </div>
    )
}
