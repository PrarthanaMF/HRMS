// Leave types HR sets up (CL, SL, EL, LOP...): quota, accrual, carry forward and who can use them.
// Deleting a type already used by requests deactivates it instead.
import React, { useState } from 'react'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import { DROPDOWN_OPTIONS } from '../../../Utils/employeeSchema'
import { Badge, Button, Check, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

const GENDERS = [['MALE', 'Male'], ['FEMALE', 'Female'], ['OTHER', 'Other']]

const numberOrNull = (value) => (value === '' || value === null ? null : Number(value))
const toggle = (list, value, on) => (on ? [...new Set([...list, value])] : list.filter((item) => item !== value))

const BLANK = {
    name: '', code: '', paid: true, annualQuota: 0, accrual: 'YEARLY', prorateForNewJoiners: true,
    carryForward: false, maxCarryForward: '', maxConsecutiveDays: '', minNoticeDays: 0, allowPastDates: false,
    allowHalfDay: true, minServiceMonths: 0, allowNegativeBalance: false, description: '', isActive: true,
    applicableTo: { categories: [], branches: [], genders: [], employmentStatuses: [] },
}

function LeaveTypeForm({ type, branches, onSaved, onClose }) {
    const isNew = !type
    const [form, setForm] = useState(() => ({
        ...BLANK, ...(type || {}),
        maxCarryForward: type?.maxCarryForward ?? '', maxConsecutiveDays: type?.maxConsecutiveDays ?? '',
        categoriesText: (type?.applicableTo?.categories || []).join(', '),
        applicableTo: { ...BLANK.applicableTo, ...(type?.applicableTo || {}) },
    }))
    const { busy, error, run } = useAction()
    const set = (key) => (value) => setForm((previous) => ({ ...previous, [key]: value }))
    const setApplies = (key, value) => setForm((previous) => ({ ...previous, applicableTo: { ...previous.applicableTo, [key]: value } }))

    const save = (event) => {
        event.preventDefault()
        const body = {
            name: form.name.trim(), code: form.code.trim().toUpperCase(), paid: form.paid,
            annualQuota: Number(form.annualQuota) || 0, accrual: form.accrual, prorateForNewJoiners: form.prorateForNewJoiners,
            carryForward: form.carryForward, maxCarryForward: form.carryForward ? numberOrNull(form.maxCarryForward) : null,
            maxConsecutiveDays: numberOrNull(form.maxConsecutiveDays), minNoticeDays: Number(form.minNoticeDays) || 0,
            allowPastDates: form.allowPastDates, allowHalfDay: form.allowHalfDay, minServiceMonths: Number(form.minServiceMonths) || 0,
            allowNegativeBalance: form.allowNegativeBalance, description: form.description.trim(), isActive: form.isActive,
            applicableTo: { ...form.applicableTo, categories: form.categoriesText.split(',').map((c) => c.trim()).filter(Boolean) },
        }
        run(async () => {
            if (isNew) await api.post('/leave-types', body)
            else await api.patch(`/leave-types/${type._id}`, body)
            onSaved(isNew ? `Leave type ${body.code} added.` : `Leave type ${body.code} updated.`)
        })
    }

    return (
        <RequestModal open title={isNew ? 'Add leave type' : `Edit ${type.code}`} subtitle='Quota, accrual and who can use it' icon='fa-regular fa-calendar-check' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='Name'><input required maxLength={100} value={form.name} onChange={(e) => set('name')(e.target.value)} className={inputClass} placeholder='Casual Leave' /></Field>
                    <Field label='Code'><input required maxLength={10} value={form.code} onChange={(e) => set('code')(e.target.value)} className={inputClass} placeholder='CL' /></Field>
                    <div className='flex flex-wrap gap-4 sm:col-span-2'>
                        <Check label='Paid' checked={form.paid} onChange={set('paid')} />
                        <Check label='Half days allowed' checked={form.allowHalfDay} onChange={set('allowHalfDay')} />
                        <Check label='Can be applied for past dates' checked={form.allowPastDates} onChange={set('allowPastDates')} />
                        <Check label='Balance may go negative' checked={form.allowNegativeBalance} onChange={set('allowNegativeBalance')} />
                        <Check label='Active' checked={form.isActive} onChange={set('isActive')} />
                    </div>
                    <Field label='Days per year'><input type='number' min={0} step={0.5} value={form.annualQuota} onChange={(e) => set('annualQuota')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Credited'>
                        <select value={form.accrual} onChange={(e) => set('accrual')(e.target.value)} className={inputClass}>
                            <option value='YEARLY'>All on 1 January</option>
                            <option value='MONTHLY'>Monthly (1/12 each month)</option>
                        </select>
                    </Field>
                    {form.accrual === 'YEARLY' && <div className='sm:col-span-2'><Check label='Pro-rate for people who join during the year' checked={form.prorateForNewJoiners} onChange={set('prorateForNewJoiners')} /></div>}
                    <div className='sm:col-span-2'><Check label='Unused days carry forward to next year' checked={form.carryForward} onChange={set('carryForward')} /></div>
                    {form.carryForward && <Field label='Most days carried forward' hint='Empty = no limit'><input type='number' min={0} step={0.5} value={form.maxCarryForward} onChange={(e) => set('maxCarryForward')(e.target.value)} className={inputClass} /></Field>}
                    <Field label='Most days in one request' hint='Empty = no limit'><input type='number' min={0.5} step={0.5} value={form.maxConsecutiveDays} onChange={(e) => set('maxConsecutiveDays')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Apply at least this many days ahead'><input type='number' min={0} value={form.minNoticeDays} onChange={(e) => set('minNoticeDays')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Months of service before use'><input type='number' min={0} value={form.minServiceMonths} onChange={(e) => set('minServiceMonths')(e.target.value)} className={inputClass} /></Field>

                    <div className='space-y-2 border-t border-slate-100 pt-3 sm:col-span-2'>
                        <p className='text-xs font-semibold text-slate-700'>Who can use it <span className='font-normal text-slate-400'>(leave a group empty for everyone)</span></p>
                        <Field label='Employee categories' hint='Comma separated, as on the employee record'><input value={form.categoriesText} onChange={(e) => set('categoriesText')(e.target.value)} className={inputClass} /></Field>
                        <div className='flex flex-wrap gap-4'>{GENDERS.map(([value, label]) => <Check key={value} label={label} checked={form.applicableTo.genders.includes(value)} onChange={(on) => setApplies('genders', toggle(form.applicableTo.genders, value, on))} />)}</div>
                        <div className='flex flex-wrap gap-4'>{branches.map((branch) => <Check key={branch.value} label={branch.label} checked={form.applicableTo.branches.map(String).includes(branch.value)} onChange={(on) => setApplies('branches', toggle(form.applicableTo.branches.map(String), branch.value, on))} />)}</div>
                        <div className='flex flex-wrap gap-4'>{DROPDOWN_OPTIONS.employmentStatus.map((status) => <Check key={status.value} label={status.label} checked={form.applicableTo.employmentStatuses.includes(status.value)} onChange={(on) => setApplies('employmentStatuses', toggle(form.applicableTo.employmentStatuses, status.value, on))} />)}</div>
                    </div>
                    <Field label='Description' className='sm:col-span-2'><textarea rows={2} maxLength={500} value={form.description} onChange={(e) => set('description')(e.target.value)} className={inputClass} /></Field>
                </fieldset>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function LeaveTypesTab() {
    const { options } = useEmployeeOptions()
    const types = useLoad(() => api.get('/leave-types', { all: 'true' }), [])
    const [editing, setEditing] = useState(null)
    const [notice, setNotice] = useState('')
    const remove = useAction()

    const saved = (message) => { setEditing(null); setNotice(message); types.reload() }
    const deleteType = (type) => {
        if (!window.confirm(`Delete leave type ${type.code}? If requests already use it, it is deactivated instead.`)) return
        setNotice('')
        remove.run(async () => {
            const result = await api.delete(`/leave-types/${type._id}`)
            saved(result.deactivated ? `${type.code} is in use, so it was deactivated.` : `${type.code} deleted.`)
        })
    }

    return (
        <div className='space-y-3'>
            <div className='flex justify-end'><Button variant='primary' onClick={() => { setNotice(''); setEditing({ type: null }) }}><i className='fa-solid fa-plus' />Add leave type</Button></div>
            <Notice message={notice} />
            <ErrorBanner message={remove.error} />
            {types.loading || types.error ? <LoadState {...types} /> : (
                <Table
                    rows={types.data}
                    empty='No leave types yet. Until HR adds some, leave is applied for without a type or balance.'
                    columns={[
                        { key: 'code', label: 'Code', render: (t) => <span className='font-mono text-xs font-semibold'>{t.code}</span> },
                        { key: 'name', label: 'Name' },
                        { key: 'quota', label: 'Per year', render: (t) => `${t.annualQuota} (${t.accrual === 'MONTHLY' ? 'monthly' : 'yearly'})` },
                        { key: 'rules', label: 'Rules', render: (t) => [t.paid ? 'Paid' : 'Unpaid', t.carryForward ? `carry forward${t.maxCarryForward != null ? ` up to ${t.maxCarryForward}` : ''}` : null, t.allowHalfDay ? 'half days' : null, t.allowPastDates ? 'past dates' : null].filter(Boolean).join(', ') },
                        { key: 'isActive', label: 'Status', render: (t) => <Badge tone={t.isActive ? 'green' : 'slate'}>{t.isActive ? 'Active' : 'Inactive'}</Badge> },
                        { key: 'actions', label: '', className: 'text-right', render: (t) => (
                            <div className='flex justify-end gap-2'>
                                <Button onClick={() => { setNotice(''); setEditing({ type: t }) }}>Edit</Button>
                                <Button variant='danger' disabled={remove.busy} onClick={() => deleteType(t)}>Delete</Button>
                            </div>
                        ) },
                    ]}
                />
            )}
            {editing && <LeaveTypeForm type={editing.type} branches={options?.branches || []} onSaved={saved} onClose={() => setEditing(null)} />}
        </div>
    )
}
