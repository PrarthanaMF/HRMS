// Week-off policies: which days are off (e.g. every Sunday, 2nd and 4th Saturday).
// The default policy applies to employees who have none set; with no default, Sundays are off.
import React, { useState } from 'react'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import { Badge, Button, Check, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th']

const describeRules = (rules) => rules.length
    ? rules.map((rule) => (rule.weeks?.length ? `${rule.weeks.map((w) => ORDINAL[w]).join(' & ')} ${DAYS[rule.day]}` : `Every ${DAYS[rule.day]}`)).join(', ')
    : 'No week offs'

function PolicyForm({ policy, onSaved, onClose }) {
    const isNew = !policy
    const [name, setName] = useState(policy?.name || '')
    const [description, setDescription] = useState(policy?.description || '')
    const [isDefault, setIsDefault] = useState(policy?.isDefault || false)
    // One entry per weekday: off? and which weeks (empty = every week)
    const [days, setDays] = useState(() => DAYS.map((_, day) => {
        const rule = policy?.rules.find((r) => r.day === day)
        return { off: Boolean(rule), weeks: rule?.weeks || [] }
    }))
    const { busy, error, run } = useAction()

    const setDay = (day, change) => setDays((previous) => previous.map((value, index) => (index === day ? { ...value, ...change } : value)))

    const save = (event) => {
        event.preventDefault()
        const body = {
            name: name.trim(), description: description.trim(), isDefault,
            rules: days.map((value, day) => ({ day, weeks: value.weeks })).filter((_, day) => days[day].off),
        }
        run(async () => {
            if (isNew) await api.post('/week-off-policies', body)
            else await api.patch(`/week-off-policies/${policy._id}`, body)
            onSaved(isNew ? `Policy ${body.name} added.` : `Policy ${body.name} updated.`)
        })
    }

    return (
        <RequestModal open title={isNew ? 'Add week-off policy' : `Edit ${policy.name}`} subtitle='Days off each week' icon='fa-regular fa-calendar' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='space-y-3'>
                    <Field label='Name'><input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder='Sundays + 2nd & 4th Saturday' /></Field>
                    <div className='space-y-2 rounded-lg border border-slate-200 p-3'>
                        {DAYS.map((label, day) => (
                            <div key={label} className='flex flex-wrap items-center gap-3'>
                                <div className='w-32'><Check label={label} checked={days[day].off} onChange={(off) => setDay(day, { off })} /></div>
                                {days[day].off && (
                                    <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
                                        {[1, 2, 3, 4, 5].map((week) => (
                                            <Check key={week} label={ORDINAL[week]} checked={days[day].weeks.includes(week)}
                                                onChange={(on) => setDay(day, { weeks: on ? [...days[day].weeks, week].sort() : days[day].weeks.filter((w) => w !== week) })} />
                                        ))}
                                        <span>{days[day].weeks.length ? 'only these weeks' : 'every week'}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Check label='Default policy (for employees with no policy set)' checked={isDefault} onChange={setIsDefault} />
                    <Field label='Description'><textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></Field>
                </fieldset>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function WeekOffTab() {
    const policies = useLoad(() => api.get('/week-off-policies'), [])
    const [editing, setEditing] = useState(null)
    const [notice, setNotice] = useState('')
    const remove = useAction()

    const saved = (message) => { setEditing(null); setNotice(message); policies.reload() }
    const deletePolicy = (policy) => {
        if (!window.confirm(`Delete ${policy.name}? Only possible when no employee uses it.`)) return
        setNotice('')
        remove.run(async () => { await api.delete(`/week-off-policies/${policy._id}`); saved(`Policy ${policy.name} deleted.`) })
    }

    return (
        <div className='space-y-3'>
            <div className='flex justify-end'><Button variant='primary' onClick={() => { setNotice(''); setEditing({ policy: null }) }}><i className='fa-solid fa-plus' />Add policy</Button></div>
            <Notice message={notice} />
            <ErrorBanner message={remove.error} />
            {policies.loading || policies.error ? <LoadState {...policies} /> : <>
                {!policies.data.policies.some((p) => p.isDefault) && (
                    <p className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600'>No default policy: employees without one get {describeRules(policies.data.fallbackRules).toLowerCase()} off.</p>
                )}
                <Table
                    rows={policies.data.policies}
                    columns={[
                        { key: 'name', label: 'Policy', render: (p) => <>{p.name} {p.isDefault && <Badge tone='blue'>Default</Badge>}</> },
                        { key: 'rules', label: 'Days off', render: (p) => describeRules(p.rules) },
                        { key: 'employeeCount', label: 'Employees' },
                        { key: 'actions', label: '', className: 'text-right', render: (p) => (
                            <div className='flex justify-end gap-2'>
                                <Button onClick={() => { setNotice(''); setEditing({ policy: p }) }}>Edit</Button>
                                <Button variant='danger' disabled={remove.busy} onClick={() => deletePolicy(p)}>Delete</Button>
                            </div>
                        ) },
                    ]}
                />
            </>}
            {editing && <PolicyForm policy={editing.policy} onSaved={saved} onClose={() => setEditing(null)} />}
        </div>
    )
}
