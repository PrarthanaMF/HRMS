// Logins: create, change role, activate / deactivate, reset password (the employee link is made
// from the employee's page).
// Super Admin, Admin and HR Manager; each can only manage roles below their own.
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import SearchableSelect from '../../Common/SearchableSelect'
import { PASSWORD_RULE, ROLE_LABELS, manageableRoles } from '../../../Utils/roles'
import { Badge, Button, Check, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

import Icon from '../../Common/Icon'

// The employee link is made from the employee's own page (Employees › open › Login & access),
// so this form only holds who can sign in and with which role
function UserForm({ user, roles, onSaved, onClose }) {
    const isNew = !user
    const [form, setForm] = useState({
        firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', password: '',
        role: user?.role || 'EMPLOYEE', isActive: user ? user.isActive : true,
    })
    const { busy, error, run } = useAction()
    const set = (key) => (value) => setForm((previous) => ({ ...previous, [key]: value }))

    const save = (event) => {
        event.preventDefault()
        run(async () => {
            if (isNew) {
                await api.post('/users', { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role })
            } else {
                await api.patch(`/users/${user._id}`, { firstName: form.firstName, lastName: form.lastName, role: form.role, isActive: form.isActive })
            }
            onSaved(isNew ? `Login created for ${form.email}.` : 'Login updated.')
        })
    }

    return (
        <RequestModal open title={isNew ? 'New login' : `Edit ${user.email}`} subtitle='Who can sign in, with which role' icon='fa-solid fa-user-shield' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4 sm:p-5' aria-busy={busy}>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='First name'><input required autoFocus value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Last name'><input required value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} className={inputClass} /></Field>
                    {isNew && <>
                        <Field label='Email' className='sm:col-span-2'><input required type='email' autoComplete='off' value={form.email} onChange={(e) => set('email')(e.target.value)} className={inputClass} /></Field>
                        <Field label='Password' hint={PASSWORD_RULE} className='sm:col-span-2'><input required type='password' autoComplete='new-password' value={form.password} onChange={(e) => set('password')(e.target.value)} className={inputClass} /></Field>
                    </>}
                    <Field label='Role' className={isNew ? 'sm:col-span-2' : ''}>
                        <SearchableSelect name='role' value={form.role} onChange={(e) => set('role')(e.target.value)} options={roles.map((role) => ({ value: role, label: ROLE_LABELS[role] }))} bare />
                    </Field>
                    {!isNew && <div className='flex items-end pb-2'><Check label='Can sign in (active)' checked={form.isActive} onChange={set('isActive')} /></div>}
                    {isNew && (
                        <p className='flex items-start gap-2 rounded-xl border border-[#cfdce5] bg-white px-3 py-2.5 text-[12px] leading-5 text-slate-600 sm:col-span-2'>
                            <Icon aria-hidden='true' className='fa-solid fa-circle-info mt-0.5 shrink-0 text-[var(--accent)]' />
                            To connect this login to an employee record, open the employee under Employees and use <span className='font-semibold text-[var(--ink)]'>Login &amp; access</span>.
                        </p>
                    )}
                </fieldset>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button size='md' onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button size='md' type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

function PasswordForm({ user, onSaved, onClose }) {
    const [password, setPassword] = useState('')
    const { busy, error, run } = useAction()
    const save = (event) => {
        event.preventDefault()
        run(async () => {
            await api.patch(`/users/${user._id}/password`, { password })
            onSaved(`Password reset for ${user.email}. Give it to them in person, not by email or chat.`)
        })
    }
    return (
        <RequestModal open title='Reset password' subtitle={user.email} icon='fa-solid fa-key' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                <Field label='New password' hint={PASSWORD_RULE}><input required type='password' autoComplete='new-password' value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /></Field>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button size='md' onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button size='md' type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function UsersTab() {
    const me = useSelector((state) => state.auth.value)
    const roles = manageableRoles(me.role)
    const [search, setSearch] = useState('')
    const [query, setQuery] = useState('')
    const [editing, setEditing] = useState(null)
    const [resetting, setResetting] = useState(null)
    const [notice, setNotice] = useState('')
    const users = useLoad(() => api.get('/users', { search: query || undefined, limit: 100 }), [query])

    const saved = (message) => { setEditing(null); setResetting(null); setNotice(message); users.reload() }
    const canManage = (user) => user._id !== me._id && roles.includes(user.role)

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-end gap-2'>
                <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()) }} className='flex min-w-0 flex-1 basis-full gap-2 sm:basis-auto'>
                    <input type='search' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search name or email' aria-label='Search logins by name or email' className={`${inputClass} sm:max-w-sm`} />
                    <Button size='md' type='submit'>Search</Button>
                </form>
                <Button size='md' variant='primary' onClick={() => { setNotice(''); setEditing({ user: null }) }}><Icon aria-hidden='true' className='fa-solid fa-plus text-sm' />New login</Button>
            </div>
            <Notice message={notice} />
            {users.loading || users.error ? <LoadState {...users} /> : (
                <Table
                    rows={users.data.users}
                    columns={[
                        { key: 'name', label: 'Name', render: (u) => `${u.firstName} ${u.lastName}` },
                        { key: 'email', label: 'Email' },
                        { key: 'role', label: 'Role', render: (u) => ROLE_LABELS[u.role] || u.role },
                        { key: 'employee', label: 'Employee', render: (u) => u.employee ? `${u.employee.firstName} ${u.employee.lastName || ''} (${u.employee.employeeId})` : <span className='text-slate-400'>Not linked</span> },
                        { key: 'isActive', label: 'Status', render: (u) => <Badge tone={u.isActive ? 'green' : 'slate'}>{u.isActive ? 'Active' : 'Inactive'}</Badge> },
                        { key: 'actions', label: '', className: 'text-right', render: (u) => canManage(u) && (
                            <div className='flex flex-nowrap justify-end gap-1.5'>
                                <Button aria-label={`Edit ${u.firstName} ${u.lastName}`} title='Edit login' className='w-8 px-0 pointer-coarse:w-10' onClick={() => { setNotice(''); setEditing({ user: u }) }}>
                                    <Icon aria-hidden='true' className='fa-solid fa-pen-to-square text-[13px]' />
                                </Button>
                                <Button aria-label={`Reset password for ${u.firstName} ${u.lastName}`} title='Reset password' className='w-8 px-0 pointer-coarse:w-10' onClick={() => { setNotice(''); setResetting(u) }}>
                                    <Icon aria-hidden='true' className='fa-solid fa-key text-[13px]' />
                                </Button>
                            </div>
                        ) },
                    ]}
                />
            )}
            {editing && <UserForm user={editing.user} roles={roles} onSaved={saved} onClose={() => setEditing(null)} />}
            {resetting && <PasswordForm user={resetting} onSaved={saved} onClose={() => setResetting(null)} />}
        </div>
    )
}
