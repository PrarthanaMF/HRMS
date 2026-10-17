// Branches: name, code, biometric device names, office location (for web punch distance) and
// branch manager (second-level approver). Changing them: Super Admin, Admin, HR Manager.
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import SearchableSelect from '../../Common/SearchableSelect'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import { SALARY_ROLES } from '../../../api/employees'
import { Badge, Button, Check, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

import Icon from '../../Common/Icon'
const toNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value))

function BranchForm({ branch, managers, onSaved, onClose }) {
    const isNew = !branch
    const [form, setForm] = useState({
        name: branch?.name || '', code: branch?.code || '', devices: (branch?.devices || []).join(', '),
        latitude: branch?.location?.latitude ?? '', longitude: branch?.location?.longitude ?? '', verified: branch?.location?.verified ?? false,
        manager: branch?.manager?._id || '', isActive: branch ? branch.isActive : true,
    })
    const { busy, error, run } = useAction()
    const set = (key) => (value) => setForm((previous) => ({ ...previous, [key]: value }))

    const save = (event) => {
        event.preventDefault()
        const hasLocation = form.latitude !== '' || form.longitude !== ''
        const body = {
            name: form.name.trim(),
            code: form.code.trim() || null,
            devices: form.devices.split(',').map((device) => device.trim()).filter(Boolean),
            location: hasLocation ? { latitude: toNumber(form.latitude), longitude: toNumber(form.longitude), verified: form.verified } : null,
            manager: form.manager || null,
            isActive: form.isActive,
        }
        run(async () => {
            if (isNew) await api.post('/branches', body)
            else await api.patch(`/branches/${branch._id}`, body)
            onSaved(isNew ? `Branch ${body.name} added.` : `Branch ${body.name} updated.`)
        })
    }

    return (
        <RequestModal open title={isNew ? 'Add branch' : `Edit ${branch.name}`} subtitle='Branch details used by attendance and approvals' icon='fa-solid fa-building' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='Name'><input required maxLength={100} value={form.name} onChange={(e) => set('name')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Code' hint='Short code, also accepted in imports'><input maxLength={20} value={form.code} onChange={(e) => set('code')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Biometric device names' hint='Comma separated, exactly as in the punch export' className='sm:col-span-2'><input value={form.devices} onChange={(e) => set('devices')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Office latitude'><input type='number' step='any' min={-90} max={90} value={form.latitude} onChange={(e) => set('latitude')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Office longitude'><input type='number' step='any' min={-180} max={180} value={form.longitude} onChange={(e) => set('longitude')(e.target.value)} className={inputClass} /></Field>
                    <div className='sm:col-span-2'><Check label='Location checked on site (not a placeholder)' checked={form.verified} onChange={set('verified')} /></div>
                    <Field label='Branch manager' hint='Gives the second approval for this branch; their login needs the Branch Manager role' className='sm:col-span-2'>
                        <SearchableSelect name='manager' value={form.manager} onChange={(e) => set('manager')(e.target.value)} options={[{ value: '', label: 'No branch manager' }, ...managers]} bare />
                    </Field>
                    <div className='sm:col-span-2'><Check label='Active' checked={form.isActive} onChange={set('isActive')} /></div>
                </fieldset>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button size='md' onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button size='md' type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function BranchesTab() {
    const role = useSelector((state) => state.auth.value.role)
    const canEdit = SALARY_ROLES.includes(role)
    const { options } = useEmployeeOptions()
    const branches = useLoad(() => api.get('/branches'), [])
    const [editing, setEditing] = useState(null)
    const [notice, setNotice] = useState('')
    const remove = useAction()

    const saved = (message) => { setEditing(null); setNotice(message); branches.reload() }
    const deleteBranch = (branch) => {
        if (!window.confirm(`Delete branch ${branch.name}? Only possible when no employee is in it.`)) return
        setNotice('')
        remove.run(async () => { await api.delete(`/branches/${branch._id}`); saved(`Branch ${branch.name} deleted.`) })
    }

    return (
        <div className='space-y-3'>
            {canEdit && <div className='flex flex-wrap justify-end gap-2'><Button size='md' variant='primary' onClick={() => { setNotice(''); setEditing({ branch: null }) }}><Icon aria-hidden='true' className='fa-solid fa-plus text-sm' />Add branch</Button></div>}
            <Notice message={notice} />
            <ErrorBanner message={remove.error} />
            {branches.loading || branches.error ? <LoadState {...branches} /> : (
                <Table
                    rows={branches.data}
                    columns={[
                        { key: 'name', label: 'Branch', render: (b) => <>{b.name}{b.code && <span className='ml-1 text-slate-400'>({b.code})</span>}</> },
                        { key: 'devices', label: 'Devices', render: (b) => b.devices?.join(', ') || '—' },
                        { key: 'manager', label: 'Branch manager', render: (b) => b.manager ? `${b.manager.firstName} ${b.manager.lastName || ''}` : <span className='text-amber-700'>None (approvals go to HR)</span> },
                        { key: 'location', label: 'Office location', render: (b) => b.location?.latitude != null ? <>{b.location.latitude}, {b.location.longitude} <Badge tone={b.location.verified ? 'green' : 'amber'}>{b.location.verified ? 'Checked' : 'Placeholder'}</Badge></> : '—' },
                        { key: 'isActive', label: 'Status', render: (b) => <Badge tone={b.isActive ? 'green' : 'slate'}>{b.isActive ? 'Active' : 'Inactive'}</Badge> },
                        { key: 'actions', label: '', className: 'text-right', render: (b) => canEdit && (
                            <div className='flex justify-end gap-2'>
                                <Button onClick={() => { setNotice(''); setEditing({ branch: b }) }}>Edit</Button>
                                <Button variant='danger' disabled={remove.busy} onClick={() => deleteBranch(b)}>Delete</Button>
                            </div>
                        ) },
                    ]}
                />
            )}
            {editing && <BranchForm branch={editing.branch} managers={options?.managers || []} onSaved={saved} onClose={() => setEditing(null)} />}
        </div>
    )
}
