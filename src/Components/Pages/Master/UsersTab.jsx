// Logins: create, change role, link to an employee, activate / deactivate, reset password.
// Super Admin, Admin and HR Manager; each can only manage roles below their own.
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../../api/client'
import { RequestModal } from '../Attendance/AttendanceForms'
import SearchableSelect from '../../Common/SearchableSelect'
import { ROLE_LABELS } from '../../../Utils/roles'
import { useEmployeeOptions } from '../../../Hooks/useEmployees'
import { Badge, Button, Check, ErrorBanner, Field, LoadState, Notice, Table, inputClass, useAction, useLoad } from './ui'

const RANK = { EMPLOYEE: 0, HR_EXECUTIVE: 1, HR_MANAGER: 2, MANAGEMENT: 2, ADMIN: 3, SUPER_ADMIN: 4 }
const PASSWORD_RULE = '12–128 characters with an upper-case letter, a lower-case letter, a digit and a symbol'

const manageableRoles = (role) => Object.keys(RANK).filter((target) => role === 'SUPER_ADMIN' || RANK[target] < RANK[role])

function UserForm({ user, roles, employees, onSaved, onClose }) {
    const isNew = !user
    const [form, setForm] = useState({
        firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', password: '',
        role: user?.role || 'EMPLOYEE', isActive: user ? user.isActive : true, employee: user?.employee?._id || '',
    })
    const { busy, error, run } = useAction()
    const set = (key) => (value) => setForm((previous) => ({ ...previous, [key]: value }))

    const save = (event) => {
        event.preventDefault()
        run(async () => {
            if (isNew) {
                await api.post('/users', { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role, employee: form.employee || null })
            } else {
                await api.patch(`/users/${user._id}`, { firstName: form.firstName, lastName: form.lastName, role: form.role, isActive: form.isActive, employee: form.employee || null })
            }
            onSaved(isNew ? `Login created for ${form.email}.` : 'Login updated.')
        })
    }

    return (
        <RequestModal open title={isNew ? 'New login' : `Edit ${user.email}`} subtitle='Who can sign in, with which role' icon='fa-solid fa-user-shield' onClose={onClose}>
            <form onSubmit={save} className='space-y-4 p-4' aria-busy={busy}>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='First name'><input required value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} className={inputClass} /></Field>
                    <Field label='Last name'><input required value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} className={inputClass} /></Field>
                    {isNew && <>
                        <Field label='Email' className='sm:col-span-2'><input required type='email' value={form.email} onChange={(e) => set('email')(e.target.value)} className={inputClass} /></Field>
                        <Field label='Password' hint={PASSWORD_RULE} className='sm:col-span-2'><input required type='password' autoComplete='new-password' value={form.password} onChange={(e) => set('password')(e.target.value)} className={inputClass} /></Field>
                    </>}
                    <Field label='Role'>
                        <select value={form.role} onChange={(e) => set('role')(e.target.value)} className={inputClass}>
                            {roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                        </select>
                    </Field>
                    {!isNew && <div className='flex items-end pb-2'><Check label='Can sign in (active)' checked={form.isActive} onChange={set('isActive')} /></div>}
                    <Field label='Employee record' hint='Links the login to an employee, so they see their own attendance and can approve their team' className='sm:col-span-2'>
                        <SearchableSelect name='employee' value={form.employee} onChange={(e) => set('employee')(e.target.value)} options={[{ value: '', label: 'Not linked' }, ...employees]} bare />
                    </Field>
                </fieldset>
                <div className='flex justify-end gap-2 border-t border-slate-100 pt-3'>
                    <Button onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
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
                    <Button onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type='submit' variant='primary' disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</Button>
                </div>
            </form>
        </RequestModal>
    )
}

export default function UsersTab() {
    const me = useSelector((state) => state.auth.value)
    const roles = manageableRoles(me.role)
    const { options } = useEmployeeOptions()
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
                <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()) }} className='flex min-w-0 flex-1 gap-2'>
                    <input type='search' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search name or email' className={`${inputClass} max-w-sm`} />
                    <Button type='submit'>Search</Button>
                </form>
                <Button variant='primary' onClick={() => { setNotice(''); setEditing({ user: null }) }}><i className='fa-solid fa-plus' />New login</Button>
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
                            <div className='flex justify-end gap-2'>
                                <Button onClick={() => { setNotice(''); setEditing({ user: u }) }}>Edit</Button>
                                <Button onClick={() => { setNotice(''); setResetting(u) }}>Reset password</Button>
                            </div>
                        ) },
                    ]}
                />
            )}
            {editing && <UserForm user={editing.user} roles={roles} employees={options?.managers || []} onSaved={saved} onClose={() => setEditing(null)} />}
            {resetting && <PasswordForm user={resetting} onSaved={saved} onClose={() => setResetting(null)} />}
        </div>
    )
}
