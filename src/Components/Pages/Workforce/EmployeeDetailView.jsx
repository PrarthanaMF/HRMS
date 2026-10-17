// One employee's full record on its own page (/workforce/:empId), one section at a time:
// a sticky section list on the left (a scrollable row on phones), the chosen section on the right.
// `?section=<key>` keeps the open section in the URL. "Login & access" links the record to a login.
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api, ApiError } from '../../../api/client'
import { documentUrl, getEmployee, listDocuments, photoUrl } from '../../../api/employees'
import { HR_ROLES, PASSWORD_RULE, ROLE_LABELS, USER_MANAGER_ROLES, manageableRoles } from '../../../Utils/roles'
import SearchableSelect from '../../Common/SearchableSelect'
import { Badge, Button, ErrorBanner, Field, Notice, cn, inputClass, useAction } from '../Master/ui'

import Icon from '../../Common/Icon'
import PageHeader, { primaryButton, secondaryButton, segClass, segItemClass } from '../../Common/PageHeader'

const SECTIONS = [
    { key: 'overview', label: 'Overview', icon: 'fa-id-badge' },
    { key: 'personal', label: 'Personal information', icon: 'fa-user' },
    { key: 'employment', label: 'Employment', icon: 'fa-briefcase' },
    { key: 'attendance', label: 'Attendance set-up', icon: 'fa-fingerprint' },
    { key: 'emergency', label: 'Emergency contact', icon: 'fa-phone' },
    { key: 'salary', label: 'Salary & bank', icon: 'fa-indian-rupee-sign', salaryOnly: true },
    { key: 'identity', label: 'Identity', icon: 'fa-id-card' },
    { key: 'previous', label: 'Previous employment', icon: 'fa-history' },
    { key: 'contact', label: 'Company contact', icon: 'fa-building' },
    { key: 'documents', label: 'Documents', icon: 'fa-file-alt' },
    { key: 'access', label: 'Login & access', icon: 'fa-user-lock' },
]

const initialsOf = (name) => (name ? name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'U')

const time12 = (hhmm) => {
    if (!hhmm) return ''
    const [h, m] = hhmm.split(':').map(Number)
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const rupees = (value) => {
    const amount = Number(value)
    if (value === '' || value == null || Number.isNaN(amount)) return ''
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// A titled group of fields; `bare` drops the field grid (e.g. the documents list)
const Section = ({ title, icon, children, bare = false, intro }) => {
    const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return (
    <section aria-labelledby={id}>
        <div className='mb-4 flex items-center gap-2.5'>
            <span aria-hidden='true' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
                <Icon className={`fa-solid ${icon} text-base`} />
            </span>
            <div className='min-w-0'>
                <h2 id={id} className='text-[16px] font-semibold text-[var(--ink)]'>{title}</h2>
                {intro && <p className='text-[12px] text-slate-500'>{intro}</p>}
            </div>
        </div>
        {bare ? children : (
            <dl className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3'>
                {children}
            </dl>
        )}
    </section>
    )
}

const InfoRow = ({ label, value, mono = false, full = false }) => (
    <div className={cn('min-w-0 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2.5', full && 'sm:col-span-2 xl:col-span-3')}>
        <dt className='mb-0.5 text-xs text-slate-500'>{label}</dt>
        <dd className={cn('break-words text-sm text-slate-800', mono && 'font-mono text-xs tabular-nums')}>
            {value || '—'}
        </dd>
    </div>
)

const StatusBadge = ({ status }) => {
    const active = status === 'Active'
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset', active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200')}>
            <span aria-hidden='true' className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')}></span>
            {status}
        </span>
    )
}

// Photo from the backend, or initials when there is none
const Avatar = ({ employee }) => {
    const [failed, setFailed] = useState(false)
    if (!failed) {
        return <img src={photoUrl(employee._id)} alt='' onError={() => setFailed(true)} className='h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200/80 sm:h-24 sm:w-24' />
    }
    return (
        <div aria-hidden='true' className='flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4e6b] to-[#2b6485] text-2xl font-semibold text-white shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/30 sm:h-24 sm:w-24'>
            {initialsOf(employee.name)}
        </div>
    )
}

// A contact detail as a chip; phone and email open the right app
const ContactChip = ({ icon, value, href }) => {
    if (!value) return null
    const className = 'inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-[13px] text-slate-700'
    const inner = <><Icon aria-hidden='true' className={`fa-solid ${icon} text-xs text-slate-400`} /><span className='truncate'>{value}</span></>
    return href
        ? <a href={href} className={cn(className, 'hover:border-[#cfdce5] hover:text-[var(--brand-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]')}>{inner}</a>
        : <span className={className}>{inner}</span>
}

// File-type icon from the uploaded file's name
const fileIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'fa-file-pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fa-image'
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'fa-file-excel'
    return 'fa-file-lines'
}

// The documents this user may see, each a download link
const Documents = ({ employeeId }) => {
    const [state, setState] = useState({ documents: null, error: '' })

    useEffect(() => {
        let active = true
        listDocuments(employeeId).then(
            (documents) => { if (active) setState({ documents, error: '' }) },
            (error) => { if (active) setState({ documents: [], error: error.message }) },
        )
        return () => { active = false }
    }, [employeeId])

    if (state.error) return <ErrorBanner message={state.error} />
    if (!state.documents) {
        return (
            <div role='status' aria-label='Loading documents' className='space-y-2'>
                {[0, 1].map((index) => <div key={index} className='skeleton h-12 w-full rounded-lg' />)}
            </div>
        )
    }
    if (!state.documents.length) return <p className='text-[13px] text-slate-500'>No documents uploaded yet. HR can add them by editing this employee.</p>

    return (
        <ul className='divide-y divide-slate-100/80 overflow-hidden rounded-xl border border-slate-200/70 bg-white'>
            {state.documents.map((doc) => (
                <li key={doc._id} className='flex items-center gap-3 px-3 py-2.5'>
                    <span aria-hidden='true' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f5f7] text-slate-600'>
                        <Icon className={`fa-solid ${fileIcon(doc.originalName)} text-base`} />
                    </span>
                    <div className='min-w-0 flex-1'>
                        <p className='flex flex-wrap items-center gap-1.5 text-xs text-slate-500'>
                            {doc.label}
                            {doc.restricted && (
                                <span className='inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200'>
                                    <Icon aria-hidden='true' className='fa-solid fa-lock text-[10px]' />
                                    Salary roles only
                                </span>
                            )}
                        </p>
                        <a href={documentUrl(employeeId, doc._id)} className='block truncate rounded text-sm font-medium text-[var(--brand-600)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                            {doc.originalName}
                        </a>
                    </div>
                    <Icon aria-hidden='true' className='fa-solid fa-download shrink-0 text-sm text-slate-400' />
                </li>
            ))}
        </ul>
    )
}

// ---------------------------------------------------------------------------
// Login & access
// ---------------------------------------------------------------------------

const MAX_USER_PAGES = 10

// Every login, so the one linked to this employee can be found and the free ones offered.
// The employee record itself does not carry the link (it lives on the user's `employee`).
const loadUsers = async () => {
    const users = []
    for (let page = 1; page <= MAX_USER_PAGES; page++) {
        const data = await api.get('/users', { page, limit: 100 })
        users.push(...(data?.users || []))
        if (!data?.pagination || page >= data.pagination.pages) break
    }
    return users
}

const userLabel = (user) => `${user.firstName} ${user.lastName} — ${user.email}`

const splitName = (name = '') => {
    const [firstName, ...rest] = name.trim().split(/\s+/)
    return { firstName: firstName || '', lastName: rest.join(' ') }
}

const optionCard = 'rounded-xl border border-slate-200/70 bg-white p-4'

const LinkExisting = ({ employeeId, users, onDone }) => {
    const [userId, setUserId] = useState('')
    const { busy, error, run } = useAction()
    const free = users.filter((user) => !user.employee).map((user) => ({ value: user._id, label: userLabel(user) }))

    const link = (event) => {
        event.preventDefault()
        if (!userId) return
        run(async () => {
            await api.patch(`/employees/${employeeId}/user`, { userId })
            onDone(`Linked ${free.find((user) => user.value === userId)?.label || 'the login'}.`)
        })
    }

    return (
        <form onSubmit={link} className={optionCard} aria-busy={busy}>
            <h3 className='text-[14px] font-semibold text-[var(--ink)]'>Link an existing login</h3>
            <p className='mt-0.5 text-[12px] text-slate-500'>Logins not yet linked to anyone. The person then sees their own attendance and leave.</p>
            <div className='mt-3 space-y-3'>
                <ErrorBanner message={error} />
                <SearchableSelect
                    label='Login'
                    name='userId'
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    options={free}
                    placeholder={free.length ? 'Choose a login' : 'No unlinked logins'}
                    searchPlaceholder='Search name or email'
                />
                <div className='flex justify-end'>
                    <Button size='md' type='submit' variant='primary' disabled={busy || !userId}>
                        <Icon aria-hidden='true' className='fa-solid fa-link text-sm' />
                        {busy ? 'Linking…' : 'Link'}
                    </Button>
                </div>
            </div>
        </form>
    )
}

const CreateLogin = ({ employee, roles, onDone }) => {
    const [form, setForm] = useState({ ...splitName(employee.name), email: employee.email || '', password: '', role: roles.includes('EMPLOYEE') ? 'EMPLOYEE' : roles[0] || '' })
    const { busy, error, run } = useAction()
    const set = (key) => (e) => setForm((previous) => ({ ...previous, [key]: e.target.value }))

    const create = (event) => {
        event.preventDefault()
        run(async () => {
            await api.post('/users', { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role, employee: employee._id })
            onDone(`Login created for ${form.email}. Give them the password in person, not by email or chat.`)
        })
    }

    return (
        <form onSubmit={create} className={optionCard} aria-busy={busy}>
            <h3 className='text-[14px] font-semibold text-[var(--ink)]'>Create a new login</h3>
            <p className='mt-0.5 text-[12px] text-slate-500'>A fresh account linked to this employee from the start.</p>
            <div className='mt-3 space-y-3'>
                <ErrorBanner message={error} />
                <fieldset disabled={busy} className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='First name'><input required value={form.firstName} onChange={set('firstName')} className={inputClass} /></Field>
                    <Field label='Last name'><input required value={form.lastName} onChange={set('lastName')} className={inputClass} /></Field>
                    <Field label='Email' className='sm:col-span-2'><input required type='email' value={form.email} onChange={set('email')} className={inputClass} /></Field>
                    <Field label='Password' hint={PASSWORD_RULE} className='sm:col-span-2'><input required type='password' autoComplete='new-password' value={form.password} onChange={set('password')} className={inputClass} /></Field>
                    <Field label='Role' className='sm:col-span-2'>
                        <select value={form.role} onChange={set('role')} className={inputClass}>
                            {roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                        </select>
                    </Field>
                </fieldset>
                <div className='flex justify-end'>
                    <Button size='md' type='submit' variant='primary' disabled={busy}>
                        <Icon aria-hidden='true' className='fa-solid fa-user-plus text-sm' />
                        {busy ? 'Creating…' : 'Create login'}
                    </Button>
                </div>
            </div>
        </form>
    )
}

const LinkedLogin = ({ employee, user, canManage, onDone }) => {
    const { busy, error, run } = useAction()
    const unlink = () => run(async () => {
        await api.patch(`/employees/${employee._id}/user`, { userId: null })
        onDone(`Unlinked ${user.email}. The login still exists; it is just not tied to this employee.`)
    })

    return (
        <div className={optionCard}>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex min-w-0 items-start gap-3'>
                    <span aria-hidden='true' className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'>
                        <Icon className='fa-solid fa-circle-check text-lg' />
                    </span>
                    <div className='min-w-0'>
                        <p className='text-[14px] font-semibold text-[var(--ink)]'>Linked to a login</p>
                        <p className='mt-0.5 break-all text-[13px] text-slate-700'>{user.email}</p>
                        <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                            <Badge tone='blue'>{ROLE_LABELS[user.role] || user.role}</Badge>
                            <Badge tone={user.isActive ? 'green' : 'slate'}>{user.isActive ? 'Can sign in' : 'Sign-in blocked'}</Badge>
                        </div>
                    </div>
                </div>
                {canManage && (
                    <Button size='md' onClick={unlink} disabled={busy} className='shrink-0'>
                        <Icon aria-hidden='true' className='fa-solid fa-link-slash text-sm' />
                        {busy ? 'Unlinking…' : 'Unlink login'}
                    </Button>
                )}
            </div>
            {error && <div className='mt-3'><ErrorBanner message={error} /></div>}
            <p className='mt-3 text-[12px] text-slate-500'>Role, activity and password resets are managed under HR set-up → Logins.</p>
        </div>
    )
}

const LoginAccess = ({ employee, onChanged }) => {
    const me = useSelector((state) => state.auth.value)
    const canManage = HR_ROLES.includes(me?.role)
    const canSeeUsers = USER_MANAGER_ROLES.includes(me?.role)
    // Nothing to look up when the record already says who the login is and the user list is off limits
    const skipLookup = !canSeeUsers && employee.user !== undefined
    const [state, setState] = useState({ users: skipLookup ? [] : null, loading: !skipLookup, error: '', forbidden: false })
    const [notice, setNotice] = useState('')

    const load = useCallback(() => {
        if (skipLookup) return undefined
        let active = true
        loadUsers().then(
            (users) => { if (active) setState({ users, loading: false, error: '', forbidden: false }) },
            (error) => {
                if (!active) return
                const forbidden = error instanceof ApiError && error.status === 403
                setState({ users: [], loading: false, error: forbidden ? '' : error.message, forbidden })
            },
        )
        return () => { active = false }
    }, [skipLookup])

    useEffect(() => load(), [load])

    // The record's own `user` when the backend sends it; otherwise the login whose employee is this one
    const linked = employee.user !== undefined
        ? employee.user
        : state.users?.find((user) => user.employee?._id === employee._id) || null

    const done = (message) => {
        setNotice(message)
        setState((previous) => ({ ...previous, loading: true, error: '' }))
        load()
        onChanged()
    }

    const intro = 'Whether this employee can sign in to the HRMS, and with which role.'

    if (state.loading) {
        return (
            <Section title='Login & access' icon='fa-user-lock' intro={intro} bare>
                <div role='status' aria-label='Loading login details' className='space-y-2'>
                    <div className='skeleton h-24 w-full rounded-xl' />
                </div>
            </Section>
        )
    }

    return (
        <Section title='Login & access' icon='fa-user-lock' intro={intro} bare>
            <div className='space-y-3'>
                <Notice message={notice} />
                <ErrorBanner message={state.error} />
                {state.forbidden && employee.user === undefined ? (
                    <p className='text-[13px] text-slate-500'>Only Super Admin, Admin and HR Manager can see which login this employee uses.</p>
                ) : linked ? (
                    <LinkedLogin employee={employee} user={linked} canManage={canManage} onDone={done} />
                ) : (
                    <>
                        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[13px] text-amber-900'>
                            <Icon aria-hidden='true' className='fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-amber-600' />
                            <p>Not linked to a login. {canManage ? 'Link an existing login or create a new one below.' : 'HR can link or create one.'}</p>
                        </div>
                        {canManage && canSeeUsers && (
                            <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
                                <LinkExisting employeeId={employee._id} users={state.users || []} onDone={done} />
                                <CreateLogin employee={employee} roles={manageableRoles(me.role)} onDone={done} />
                            </div>
                        )}
                        {canManage && !canSeeUsers && (
                            <p className='text-[13px] text-slate-500'>Only Super Admin, Admin and HR Manager can link or create logins.</p>
                        )}
                    </>
                )}
            </div>
        </Section>
    )
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const Overview = ({ employee }) => (
    <Section title='Overview' icon='fa-id-badge' bare>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <Avatar key={employee._id} employee={employee} />
            <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-xl font-semibold text-[var(--ink)]'>{employee.name}</p>
                    <StatusBadge status={employee.status} />
                </div>
                <p className='mt-0.5 text-[13px] text-slate-600'>{[employee.designation, employee.department].filter(Boolean).join(', ') || '—'}</p>
                <p className='mt-0.5 font-mono text-xs tabular-nums text-slate-500'>{employee.empId}</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                    <ContactChip icon='fa-envelope' value={employee.email} href={employee.email ? `mailto:${employee.email}` : ''} />
                    <ContactChip icon='fa-phone' value={employee.personalNumber} href={employee.personalNumber ? `tel:${employee.personalNumber}` : ''} />
                    <ContactChip icon='fa-building' value={employee.branch} />
                    <ContactChip icon='fa-location-dot' value={employee.location} />
                </div>
            </div>
        </div>
        <dl className='mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3'>
            <InfoRow label='Date of joining' value={employee.dateOfJoining} />
            <InfoRow label='Employee type' value={employee.employeeType} />
            <InfoRow label='Reporting manager' value={employee.reportingManager} />
            <InfoRow label='Shift' value={employee.shiftStart ? `${time12(employee.shiftStart)} – ${time12(employee.shiftEnd)}` : ''} />
            <InfoRow label='Company' value={employee.company} />
            <InfoRow label='Division' value={employee.division} />
        </dl>
    </Section>
)

const SectionContent = ({ section, employee, onChanged }) => {
    switch (section) {
        case 'personal':
            return (
                <Section title='Personal information' icon='fa-user'>
                    <InfoRow label='Employee name' value={employee.name} />
                    <InfoRow label='Gender' value={employee.gender} />
                    <InfoRow label='Personal number' value={employee.personalNumber} />
                    <InfoRow label='Personal email' value={employee.personalEmail} />
                    <InfoRow label='Date of birth' value={employee.dateOfBirth} />
                    <InfoRow label='Date of anniversary' value={employee.dateOfAnniversary} />
                    <InfoRow label='Blood group' value={employee.bloodGroup} />
                    <InfoRow label='Present address' value={employee.presentAddress} full />
                    <InfoRow label='Permanent address' value={employee.permanentAddress} full />
                </Section>
            )
        case 'employment':
            return (
                <Section title='Employment' icon='fa-briefcase'>
                    <InfoRow label='Employee ID' value={employee.empId} mono />
                    <InfoRow label='Company' value={employee.company} />
                    <InfoRow label='Branch' value={employee.branch} />
                    <InfoRow label='Location' value={employee.location} />
                    <InfoRow label='Department' value={employee.department} />
                    <InfoRow label='Division' value={employee.division} />
                    <InfoRow label='Designation' value={employee.designation} />
                    <InfoRow label='Reporting manager' value={employee.reportingManager} />
                    <InfoRow label='Date of joining' value={employee.dateOfJoining} />
                    <InfoRow label='Employee type' value={employee.employeeType} />
                    <InfoRow label='Status' value={employee.status} />
                </Section>
            )
        case 'attendance':
            return (
                <Section title='Attendance set-up' icon='fa-fingerprint'>
                    <InfoRow label='Biometric code' value={employee.biometricCode} mono />
                    <InfoRow label='Shift' value={`${time12(employee.shiftStart)} – ${time12(employee.shiftEnd)}`} />
                    <InfoRow label='Category' value={employee.category} />
                </Section>
            )
        case 'emergency':
            return (
                <Section title='Emergency contact' icon='fa-phone'>
                    <InfoRow label='Contact name' value={employee.emergencyContactName} />
                    <InfoRow label='Relation' value={employee.emergencyContactRelation} />
                    <InfoRow label='Contact number' value={employee.emergencyContactNumber} />
                </Section>
            )
        case 'salary': {
            const monthly = Number(employee.monthlySalary)
            const annual = employee.monthlySalary !== '' && !Number.isNaN(monthly) ? monthly * 12 : ''
            return (
                <Section title='Salary & bank' icon='fa-indian-rupee-sign'>
                    <InfoRow label='Monthly salary (gross)' value={rupees(employee.monthlySalary)} />
                    <InfoRow label='Current CTC (annual)' value={rupees(annual)} />
                    <InfoRow label='Bank name' value={employee.bankName} />
                    <InfoRow label='Account number' value={employee.accountNumber} mono />
                    <InfoRow label='IFSC code' value={employee.ifscCode} mono />
                </Section>
            )
        }
        case 'identity':
            return employee.hasSalaryAccess ? (
                <Section title='Identity' icon='fa-id-card'>
                    <InfoRow label='PAN number' value={employee.panNumber} mono />
                    <InfoRow label='Aadhaar number' value={employee.aadhaarNumber} mono />
                </Section>
            ) : (
                <Section title='Identity' icon='fa-id-card'>
                    <InfoRow label='Aadhaar number' value={employee.aadhaarMasked} mono />
                </Section>
            )
        case 'previous':
            return (
                <Section title='Previous employment' icon='fa-history'>
                    <InfoRow label='Previous company' value={employee.previousCompanyName} />
                    <InfoRow label='Previous manager' value={employee.previousCompanyManager} />
                    <InfoRow label='Contact' value={employee.previousCompanyContact} />
                </Section>
            )
        case 'contact':
            return (
                <Section title='Company contact' icon='fa-building'>
                    <InfoRow label='Official email' value={employee.officialEmail} />
                    <InfoRow label='Company contact number' value={employee.companyNumber} />
                </Section>
            )
        case 'documents':
            return (
                <Section title='Documents' icon='fa-file-alt' bare>
                    <Documents employeeId={employee._id} />
                </Section>
            )
        case 'access':
            return <LoginAccess key={employee._id} employee={employee} onChanged={onChanged} />
        default:
            return <Overview employee={employee} />
    }
}

const navItem = (active) => cn(
    'press flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]',
    active
        ? 'bg-white text-[var(--accent)] shadow-[0_1px_2px_rgb(8_26_46/0.08),0_6px_14px_-8px_rgb(8_26_46/0.25)]'
        : 'text-slate-600 hover:bg-white/60 hover:text-[var(--ink)]',
)

const PageLoading = () => (
    <div role='status' aria-label='Loading employee' className='space-y-5'>
        <div className='skeleton h-40 w-full rounded-[20px]' />
        <div className='grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]'>
            <div className='skeleton h-14 w-full rounded-2xl lg:h-96' />
            <div className='skeleton h-96 w-full rounded-2xl' />
        </div>
    </div>
)

// Keyed by the id below, so moving between employees starts from a clean slate
const EmployeeDetail = ({ empId }) => {
    const me = useSelector((state) => state.auth.value)
    const canEdit = HR_ROLES.includes(me?.role)
    const [params, setParams] = useSearchParams()
    const [state, setState] = useState({ employee: null, loading: true, error: '' })

    const load = useCallback(() => {
        let active = true
        getEmployee(empId).then(
            (employee) => { if (active) setState({ employee, loading: false, error: '' }) },
            (error) => { if (active) setState({ employee: null, loading: false, error: error.message || 'Unable to load this employee.' }) },
        )
        return () => { active = false }
    }, [empId])

    useEffect(() => load(), [load])

    const { employee, loading, error } = state
    const sections = SECTIONS.filter((section) => !section.salaryOnly || employee?.hasSalaryAccess)
    const requested = params.get('section')
    const section = sections.some((item) => item.key === requested) ? requested : 'overview'
    const select = (key) => setParams(key === 'overview' ? {} : { section: key })

    // Phones: keep the open section's pill in view in the scrollable row (e.g. from a deep link)
    const rowRef = useRef(null)
    useEffect(() => {
        rowRef.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' })
    }, [section, loading])

    if (loading) return <PageLoading />

    if (error || !employee) {
        return (
            <>
                <PageHeader icon='fa-solid fa-user' title='Employee' description='This record could not be opened.' actions={(
                    <Link to='/workforce' className={secondaryButton}>
                        <Icon aria-hidden='true' className='fa-solid fa-arrow-left text-sm' />
                        Back to employees
                    </Link>
                )} />
                <ErrorBanner message={error || 'Employee not found.'} />
            </>
        )
    }

    const isActive = employee.status === 'Active'
    const description = [employee.designation, employee.department, employee.branch].filter(Boolean).join(' · ') || employee.empId

    const nav = (horizontal) => sections.map((item) => {
        const active = item.key === section
        return (
            <button
                key={item.key}
                type='button'
                aria-current={active ? 'true' : undefined}
                onClick={() => select(item.key)}
                className={horizontal ? segItemClass(active) : navItem(active)}
            >
                <Icon aria-hidden='true' className={`fa-solid ${item.icon} ${horizontal ? 'text-sm' : 'w-4 text-center text-sm'}`} />
                {item.label}
            </button>
        )
    })

    return (
        <>
            <PageHeader
                icon='fa-solid fa-user'
                eyebrow={`Employee · ${employee.empId}`}
                title={employee.name}
                description={description}
                actions={(
                    <>
                        <Link to='/workforce' className={secondaryButton}>
                            <Icon aria-hidden='true' className='fa-solid fa-arrow-left text-sm' />
                            Back to employees
                        </Link>
                        {canEdit && (isActive ? (
                            <Link to={`/workforce/edit/${employee._id}`} className={primaryButton}>
                                <Icon aria-hidden='true' className='fa-solid fa-pen text-sm' />
                                Edit
                            </Link>
                        ) : (
                            <button type='button' disabled title='Inactive employees cannot be edited' className={secondaryButton}>
                                <Icon aria-hidden='true' className='fa-solid fa-lock text-sm' />
                                Editing disabled
                            </button>
                        ))}
                    </>
                )}
            />

            <div className='rise grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]' style={{ '--i': 1 }}>
                {/* Phones: one scrollable row of sections */}
                <nav ref={rowRef} aria-label='Employee sections' className={cn(segClass, 'lg:hidden')}>
                    {nav(true)}
                </nav>

                {/* Desktop: a sticky list on the left */}
                <nav aria-label='Employee sections' className='glass-panel hidden self-start rounded-2xl p-2 lg:sticky lg:top-24 lg:block'>
                    <div className='flex flex-col gap-0.5'>{nav(false)}</div>
                </nav>

                <div className='glass-panel min-w-0 rounded-2xl p-4 sm:p-6'>
                    <SectionContent key={section} section={section} employee={employee} onChanged={load} />
                </div>
            </div>
        </>
    )
}

const EmployeeDetailView = () => {
    const { empId } = useParams()
    return <EmployeeDetail key={empId} empId={empId} />
}

export default EmployeeDetailView
