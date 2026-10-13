// One employee's leave balances for a year: opening (set by HR or carried forward), accrued,
// adjustments, used, pending, available. HR sets opening balances (e.g. at go-live) and adjusts.
import React, { useState } from 'react'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import SearchableSelect from '../../Common/SearchableSelect'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import { Button, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

const OPENING_SOURCE = { SET_BY_HR: 'set by HR', CARRIED_FORWARD: 'carried forward', NONE: '' }

function BalanceChange({ mode, employee, year, row, onSaved, onClose }) {
    const [value, setValue] = useState(mode === 'opening' && row.openingSource === 'SET_BY_HR' ? String(row.opening) : '')
    const [reason, setReason] = useState('')
    const { busy, error, run } = useAction()
    const base = { employee, leaveType: row.leaveType._id, year }

    const save = (event) => {
        event.preventDefault()
        run(async () => {
            if (mode === 'opening') {
                await api.put('/leave-balances/opening', { ...base, opening: value === '' ? null : Number(value) })
                onSaved(`${row.leaveType.code} opening balance ${value === '' ? 'set back to automatic carry forward' : `set to ${value}`}.`)
            } else {
                await api.post('/leave-balances/adjustments', { ...base, days: Number(value), reason: reason.trim() })
                onSaved(`${row.leaveType.code} adjusted by ${value} day(s).`)
            }
        })
    }

    return (
        <RequestModal open title={mode === 'opening' ? `Opening balance · ${row.leaveType.code}` : `Adjust · ${row.leaveType.code}`} subtitle={`${year}`} icon='fa-solid fa-scale-balanced' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                {mode === 'opening' ? (
                    <Field label='Opening balance (days)' hint='Half days allowed (e.g. 4.5). Leave empty to go back to automatic carry forward from last year.'>
                        <input type='number' step={0.5} value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
                    </Field>
                ) : <>
                    <Field label='Days to add (use a minus sign to remove)' hint='Half days allowed, e.g. 1, -0.5'>
                        <input required type='number' step={0.5} value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label='Reason (kept with the balance)'><input required maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} /></Field>
                </>}
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function LeaveBalancesTab() {
    const { options } = useEmployeeOptions()
    const [employee, setEmployee] = useState('')
    const [year, setYear] = useState(new Date().getFullYear())
    const [changing, setChanging] = useState(null)
    const [notice, setNotice] = useState('')
    const balances = useLoad(() => (employee ? api.get('/leave-balances', { employee, year }) : Promise.resolve(null)), [employee, year])

    const saved = (message) => { setChanging(null); setNotice(message); balances.reload() }

    return (
        <div className='space-y-3'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
                <Field label='Employee'>
                    <SearchableSelect name='employee' value={employee} onChange={(e) => { setNotice(''); setEmployee(e.target.value) }} options={options?.managers || []} placeholder='Choose an employee' bare />
                </Field>
                <Field label='Year'><input type='number' min={2000} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass} /></Field>
            </div>
            <Notice message={notice} />
            {!employee ? <p className='p-6 text-sm text-slate-500'>Choose an employee to see their leave balances.</p>
                : balances.loading || balances.error ? <LoadState {...balances} /> : (
                <Table
                    rows={balances.data.balances}
                    rowKey={(row) => row.leaveType._id}
                    empty='No active leave types. Add them on the Leave Types tab.'
                    columns={[
                        { key: 'type', label: 'Leave type', render: (r) => <>{r.leaveType.name} <span className='font-mono text-xs text-slate-400'>{r.leaveType.code}</span>{r.notAvailableReason && <p className='text-[11px] text-amber-700'>{r.notAvailableReason}</p>}</> },
                        { key: 'opening', label: 'Opening', render: (r) => <>{r.opening}{OPENING_SOURCE[r.openingSource] && <p className='text-[11px] text-slate-400'>{OPENING_SOURCE[r.openingSource]}</p>}</> },
                        { key: 'accrued', label: 'Accrued' },
                        { key: 'adjustments', label: 'Adjusted', render: (r) => <span title={(r.adjustmentHistory || []).map((a) => `${a.days > 0 ? '+' : ''}${a.days}: ${a.reason}`).join('\n')}>{r.adjustments}</span> },
                        { key: 'used', label: 'Used' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'available', label: 'Available', render: (r) => r.limited ? <strong>{r.available}</strong> : 'No limit' },
                        { key: 'actions', label: '', className: 'text-right', render: (r) => (
                            <div className='flex justify-end gap-2'>
                                <Button onClick={() => { setNotice(''); setChanging({ mode: 'opening', row: r }) }}>Opening</Button>
                                <Button onClick={() => { setNotice(''); setChanging({ mode: 'adjust', row: r }) }}>Adjust</Button>
                            </div>
                        ) },
                    ]}
                />
            )}
            {changing && <BalanceChange {...changing} employee={employee} year={year} onSaved={saved} onClose={() => setChanging(null)} />}
        </div>
    )
}
