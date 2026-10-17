import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import FormField from '../../Common/FormField'
import SearchableSelect from '../../Common/SearchableSelect'
import Section from '../../Common/FormSection'
import { selectAllEmployees } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { todayISO } from '../../../Utils/formatDate'
import { primaryButton, secondaryButton } from '../../Common/PageHeader'
import { labelClass } from './ui'
import { HR_NAMES, NEXT_DATE_STAGES, RECRUITMENT_STAGES, RECRUITMENT_SOURCES, RECRUITMENT_DIVISIONS, COMPANIES, FINAL_STATUSES, DECLINE_REASONS, JOINING_FORM_LINK, INTERVIEWERS } from '../../../Utils/mockRecruitment'

import Icon from '../../Common/Icon'
// ---------------------------------------------------------------------------
// "New Recruitment" — in-app Recruitment Tracker Form
// Rendered as pop-up content inside VacancyUpdateModal, styled to match the
// rest of the app (FormField, navy/slate palette) instead of a Google Form.
//
// Request ID, Position Applied For and Location come from the vacancy being
// updated. They are locked (no inputs at all) and are simply attached to the
// submission, so they can't be changed from here.
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 10 * 1024 * 1024

const FIELD_ORDER = [
    'name', 'contact', 'email', 'salary', 'resume', 'stage', 'source', 'division', 'hrName', 'rating', 'nextDate', 'remarks',
    // Stage-specific fields (Interview / Offer / Join / Reject) — same as the Recruitment
    // Tracker's Update pop-up, so the question set matches whichever stage is picked here.
    'currentSalary', 'negotiable', 'remarksOfCandidate', 'interviewer',
    'offerDate', 'joiningDate', 'company',
    'hiredCost', 'employeeId', 'joiningForm',
    'declineReason', 'connectFuture', 'nextConnectDate',
]

const ErrorText = ({ children }) => children ? (
    <p className='text-[12px] text-red-600 flex items-center gap-1'>
        <Icon className='fa-solid fa-circle-exclamation text-[11px]' />{children}
    </p>
) : null

// "Reference By" — button next to Cancel that opens a list of current employees
// to pick the person who referred this candidate.
const ReferralPicker = ({ employees, value, onSelect }) => {
    const rootRef = useRef(null)
    const searchRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (!open) return
        searchRef.current?.focus()
        const onDown = (e) => {
            if (!rootRef.current?.contains(e.target)) {
                setOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return q
            ? employees.filter((e) => e.name.toLowerCase().includes(q) || String(e.empId).includes(q))
            : employees
    }, [employees, query])

    const pick = (emp) => {
        onSelect(emp)
        setOpen(false)
        setQuery('')
    }

    return (
        <div className='relative w-full sm:w-auto' ref={rootRef}>
            <div className={`flex h-10 items-stretch overflow-hidden rounded-xl border transition-colors ${value ? 'border-[#cfdce5] bg-[#f2f5f7]' : 'border-slate-200/80 bg-white/80 hover:border-[#cfdce5] hover:bg-white'}`}>
                <button
                    type='button'
                    aria-haspopup='listbox'
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className='press flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 text-[13px] font-semibold text-[var(--brand-600)] min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2b6485]'
                >
                    <Icon className='fa-solid fa-user-group text-xs text-slate-400 shrink-0' />
                    <span className='truncate max-w-[180px]'>{value ? `Reference: ${value.name}` : 'Reference by'}</span>
                    <Icon className={`fa-solid fa-chevron-up text-[10px] text-slate-400 shrink-0 transition-transform ${open ? '' : 'rotate-180'}`} />
                </button>
                {value && (
                    <button
                        type='button'
                        onClick={() => onSelect(null)}
                        title='Remove reference'
                        aria-label='Remove reference'
                        className='press w-10 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 border-l border-slate-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2b6485]'
                    >
                        <Icon className='fa-solid fa-xmark text-xs' />
                    </button>
                )}
            </div>

            {open && (
                <div className='glass-strong absolute z-30 bottom-full mb-2 left-0 sm:left-auto sm:right-0 w-full sm:w-72 rounded-xl shadow-[var(--shadow-pop)] overflow-hidden [animation:ui-pop_160ms_var(--ease-out)_backwards]'>
                    <div className='px-3 pt-3 pb-2'>
                        <p className='text-xs font-medium text-slate-500 mb-2'>Current employee</p>
                        <div className='relative'>
                            <Icon className='fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400' />
                            <input
                                ref={searchRef}
                                type='text'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) }
                                    if (e.key === 'Enter') { e.preventDefault(); if (filtered[0]) pick(filtered[0]) }
                                }}
                                placeholder='Search employee'
                                aria-label='Search employee'
                                className='h-9 w-full pl-8 pr-2 text-sm border border-slate-200/80 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#2b6485]'
                            />
                        </div>
                    </div>
                    <ul role='listbox' className='max-h-52 overflow-y-auto py-1 border-t border-slate-100'>
                        {filtered.length === 0 ? (
                            <li className='px-3 py-3 text-xs text-slate-500 text-center'>No employees found. Try another name.</li>
                        ) : (
                            filtered.map((emp) => (
                                <li
                                    key={emp._id}
                                    role='option'
                                    aria-selected={value?.empId === emp.empId}
                                    onClick={() => pick(emp)}
                                    className={`mx-1 rounded-lg px-2.5 py-2 cursor-pointer hover:bg-[#f2f5f7] ${value?.empId === emp.empId ? 'bg-[#f2f5f7]' : ''}`}
                                >
                                    <p className='text-sm text-slate-800 font-medium truncate'>{emp.name}</p>
                                    <p className='flex min-w-0 gap-2 text-xs text-slate-500'>{emp.designation && <span className='truncate'>{emp.designation}</span>}{emp.branch && <span className='truncate'>{emp.branch}</span>}</p>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}

const RecruitmentTrackerForm = ({ vacancy, hrName, requestId, onCancel, onSubmit }) => {
    const employees = useSelector(selectAllEmployees)
    const currentEmployees = useMemo(() => employees.filter((e) => e.status === 'Active'), [employees])

    const [data, setData] = useState({
        name: '',
        contact: '',
        email: '',
        salary: '',
        // Pre-select the logged-in HR person, but only if they're one of the listed HR names
        hrName: HR_NAMES.includes(hrName) ? hrName : '',
        stage: '',
        source: '',
        division: '',
        remarks: '',
        rating: '',
        nextDate: '',
        // Stage-specific fields — only the ones matching the picked Stage are shown/required,
        // same rules as the Recruitment Tracker's Update pop-up (see showInterview/showOffer/etc below).
        currentSalary: '',
        negotiable: '',
        negotiableRemarks: '',
        remarksOfCandidate: '',
        interviewer: '',
        offerDate: '',
        joiningDate: '',
        company: '',
        hiredCost: '',
        finalStatus: '',
        employeeId: '',
        declineReason: '',
        connectFuture: '',
        nextConnectDate: '',
    })
    const [referral, setReferral] = useState(null) // { empId, name } of the referring current employee
    const [resumeFile, setResumeFile] = useState(null)
    const [joiningForm, setJoiningForm] = useState(null)
    const [kybForm, setKybForm] = useState(null)
    const [errors, setErrors] = useState({})

    // Which stage-specific section shows depends only on the Stage dropdown, same mapping
    // as the Update pop-up: Interview, Offer, Join and Reject each add their own questions.
    const showInterview = data.stage === 'Interview'
    const showOffer = data.stage === 'Offer'
    const showJoin = data.stage === 'Join'
    const showReject = data.stage === 'Reject'
    const showNextConnect = showReject && data.connectFuture === 'Yes'

    const set = (name, value) => {
        setData((d) => ({ ...d, [name]: value }))
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    }
    const handleChange = (e) => set(e.target.name, e.target.value)

    const setRating = (n) => set('rating', n)

    const handleReferral = (emp) => {
        setReferral(emp ? { empId: emp.empId, name: emp.name } : null)
        // If the source list has a referral-type option, use it when HR hasn't picked a source yet
        const referralSource = RECRUITMENT_SOURCES.find((s) => /refer/i.test(s))
        if (emp && referralSource && !data.source) {
            setData((d) => ({ ...d, source: referralSource }))
            setErrors((er) => ({ ...er, source: undefined }))
        }
    }

    const validate = () => {
        const next = {}
        if (!data.name.trim()) next.name = 'This field is required'
        if (!/^[+\d][\d\s-]{6,}$/.test(data.contact.trim())) next.contact = 'Enter a valid contact number'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) next.email = 'Enter a valid email address'
        if (!data.salary.trim()) next.salary = 'This field is required'
        if (!resumeFile) next.resume = 'Please attach a resume (PDF/DOC, up to 10 MB)'
        if (!data.stage) next.stage = 'This field is required'
        if (!data.source) next.source = 'This field is required'
        if (!data.division) next.division = 'This field is required'
        if (!data.hrName) next.hrName = 'This field is required'
        if (!data.rating) next.rating = 'This field is required'
        // Only some stages need a next schedule date — matches the Update pop-up's own stage rules
        if (NEXT_DATE_STAGES.includes(data.stage)) {
            if (!data.nextDate) next.nextDate = 'This field is required'
            else if (data.nextDate < todayISO()) next.nextDate = "Next schedule date can't be in the past"
        }
        if (!data.remarks.trim()) next.remarks = 'This field is required'
        if (showInterview) {
            if (!data.currentSalary.trim()) next.currentSalary = 'This field is required'
            if (!data.negotiable) next.negotiable = 'This field is required'
            if (!data.remarksOfCandidate.trim()) next.remarksOfCandidate = 'This field is required'
            if (!data.interviewer) next.interviewer = 'This field is required'
        }
        if (showOffer) {
            if (!data.offerDate) next.offerDate = 'This field is required'
            if (!data.joiningDate) next.joiningDate = 'This field is required'
            else if (data.offerDate && data.joiningDate < data.offerDate) next.joiningDate = "Can't be before the offer date"
            if (!data.company) next.company = 'This field is required'
        }
        if (showJoin) {
            if (!data.hiredCost.trim()) next.hiredCost = 'This field is required'
            else if (!/^\d+(\.\d+)?$/.test(data.hiredCost.replace(/,/g, '').trim())) next.hiredCost = 'Enter the cost as a number'
            if (!data.employeeId.trim()) next.employeeId = 'This field is required'
            if (!joiningForm) next.joiningForm = 'Please upload the joining form (max 10 MB)'
        }
        if (showReject) {
            if (!data.declineReason) next.declineReason = 'This field is required'
            if (!data.connectFuture) next.connectFuture = 'This field is required'
            if (showNextConnect) {
                if (!data.nextConnectDate) next.nextConnectDate = 'This field is required'
                else if (data.nextConnectDate < todayISO()) next.nextConnectDate = "Date can't be before today"
            }
        }
        setErrors(next)
        return next
    }

    // Shared by every file field in this form — pass which setter/error-key to update.
    const makeFileHandler = (setFile, errorKey) => (e) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.size > MAX_FILE_BYTES) {
            setErrors((er) => ({ ...er, [errorKey]: 'That file is larger than 10 MB. Please choose a smaller file.' }))
            e.target.value = ''
            setFile(null)
            return
        }
        setFile(f)
        setErrors((er) => ({ ...er, [errorKey]: undefined }))
    }
    const handleFile = makeFileHandler(setResumeFile, 'resume')
    const handleJoiningFormFile = makeFileHandler(setJoiningForm, 'joiningForm')
    const handleKybFile = makeFileHandler(setKybForm, 'kybForm')

    const handleSubmit = (e) => {
        e.preventDefault()
        const found = validate()
        if (Object.keys(found).length > 0) {
            // Use the errors just computed (state from setErrors isn't updated yet)
            const firstKey = FIELD_ORDER.find((k) => found[k])
            document.getElementById(`q-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
        onSubmit({
            ...data,
            // Locked fields — always taken from the vacancy, never from user input
            requestId,
            position: vacancy?.designation || '',
            location: vacancy?.branch || '',
            resumeFileName: resumeFile?.name || '',
            referredBy: referral?.name || '',
            referredByEmpId: referral?.empId || '',
            joiningFormFileName: joiningForm?.name || '',
            kybFormFileName: kybForm?.name || '',
        })
        // No stacked-card confirmation screen anymore — the candidate now shows up
        // as a real row in the Recruitment Tracker table, so just close the popup.
        onCancel()
    }

    const fieldProps = { onChange: handleChange }

    return (
        <form onSubmit={handleSubmit} noValidate className='space-y-5'>
            <p className='text-[13px] text-slate-500'>
                Log this candidate's progress through the hiring pipeline. Fields marked <span className='text-red-500'>*</span> are required.
            </p>

            {/* ---------- 1. Candidate Details ---------- */}
            <Section step={1} icon='fa-user' title='Candidate details' subtitle="Who the candidate is and how to reach them">
                <div id='q-name'>
                    <FormField label='Candidate name' name='name' value={data.name} error={errors.name} required {...fieldProps} />
                </div>
                <div id='q-contact'>
                    <FormField label='Contact number' name='contact' type='tel' value={data.contact} error={errors.contact} required {...fieldProps} />
                </div>
                <div id='q-email'>
                    <FormField label='Candidate email' name='email' type='email' value={data.email} error={errors.email} required {...fieldProps} />
                </div>
                <div id='q-salary'>
                    <FormField label='Salary expectation' name='salary' value={data.salary} error={errors.salary} required {...fieldProps} />
                </div>

                {/* Resume upload — styled to match the site instead of the Google dropzone */}
                <div id='q-resume' className='flex flex-col gap-1.5 md:col-span-2'>
                    <label className={labelClass}>
                        Upload resume <span className='text-red-500'>*</span>
                    </label>
                    {!resumeFile ? (
                        <label className={`flex min-h-10 items-center gap-3 border border-dashed rounded-xl bg-white/80 px-3 py-2.5 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${errors.resume ? 'border-red-300' : 'border-slate-300 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                            <Icon className='fa-solid fa-cloud-arrow-up text-slate-400' />
                            <span className='text-sm text-slate-600'><b className='text-[var(--brand-600)] font-semibold'>Add file</b> (PDF/DOC, up to 10 MB)</span>
                            <input type='file' className='sr-only' accept='.pdf,.doc,.docx' onChange={handleFile} />
                        </label>
                    ) : (
                        <div className='flex min-h-10 items-center justify-between gap-3 bg-white/80 border border-slate-200/80 rounded-xl pl-3 pr-1 py-1 text-sm'>
                            <span className='flex min-w-0 items-baseline gap-2'><span className='truncate text-slate-700'>{resumeFile.name}</span><span className='shrink-0 text-xs text-slate-500 tabular-nums'>{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</span></span>
                            <button
                                type='button'
                                onClick={() => setResumeFile(null)}
                                className='press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                                aria-label='Remove file'
                            >
                                <Icon className='fa-solid fa-xmark text-xs' />
                            </button>
                        </div>
                    )}
                    {errors.resume && (
                        <p className='text-[12px] text-red-600 flex items-center gap-1'>
                            <Icon className='fa-solid fa-circle-exclamation text-[11px]' />
                            {errors.resume}
                        </p>
                    )}
                </div>
            </Section>

            {/* ---------- 2. Recruitment Details ---------- */}
            <Section step={2} icon='fa-briefcase' title='Recruitment details' subtitle='Where the candidate is in the pipeline and who is handling them'>
                <div id='q-stage'>
                    <SearchableSelect label='Stage' name='stage' value={data.stage} error={errors.stage} required options={RECRUITMENT_STAGES} {...fieldProps} />
                </div>
                <div id='q-source'>
                    <SearchableSelect label='Recruitment source' name='source' value={data.source} error={errors.source} required options={RECRUITMENT_SOURCES} {...fieldProps} />
                </div>
                <div id='q-division'>
                    <SearchableSelect label='Division' name='division' value={data.division} error={errors.division} required options={RECRUITMENT_DIVISIONS} {...fieldProps} />
                </div>
                <div id='q-hrName'>
                    <SearchableSelect label='HR name' name='hrName' value={data.hrName} error={errors.hrName} required options={HR_NAMES} searchPlaceholder='Search HR name' {...fieldProps} />
                </div>
            </Section>

            {/* ---------- Stage-specific sections ----------
                Right after Recruitment Details, so they follow the Stage dropdown that decides
                which one shows. Same rules as the Recruitment Tracker's Update pop-up. */}
            {showInterview && (
                <div className='!mt-2'>
                <Section icon='fa-comments' title='Interview update' subtitle=''>
                    <div id='q-currentSalary'>
                        <FormField label='Current salary' name='currentSalary' value={data.currentSalary} error={errors.currentSalary} required {...fieldProps} />
                    </div>

                    <div id='q-negotiable' className='flex flex-col gap-1.5'>
                        <label className={labelClass}>
                            Negotiable <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-4'>
                            {['Yes', 'No'].map((opt) => (
                                <label key={opt} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='negotiable' checked={data.negotiable === opt}
                                        onChange={() => set('negotiable', opt)} className='h-4 w-4 accent-[#1f4e6b]' />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        <ErrorText>{errors.negotiable}</ErrorText>
                    </div>

                    <div id='q-negotiableRemarks'>
                        <FormField label='Negotiable remarks' name='negotiableRemarks' value={data.negotiableRemarks} error={errors.negotiableRemarks} {...fieldProps} />
                    </div>

                    <div id='q-remarksOfCandidate'>
                        <FormField label='Remarks of candidate' name='remarksOfCandidate' value={data.remarksOfCandidate} error={errors.remarksOfCandidate} required {...fieldProps} />
                    </div>

                    <div id='q-interviewer' className='md:col-span-2'>
                        <SearchableSelect label='Interviewer' name='interviewer' value={data.interviewer} error={errors.interviewer} required options={INTERVIEWERS} placeholder='Choose' {...fieldProps} />
                    </div>
                </Section>
                </div>
            )}

            {showOffer && (
                <div className='!mt-2'>
                <Section icon='fa-file-signature' title='Offer details' subtitle='If we offered'>
                    <div id='q-offerDate'>
                        <FormField label='Offer date' name='offerDate' type='date' value={data.offerDate} error={errors.offerDate} required {...fieldProps} />
                    </div>
                    <div id='q-joiningDate'>
                        <FormField label='Expected date of joining' name='joiningDate' type='date' min={data.offerDate || undefined} value={data.joiningDate} error={errors.joiningDate} required {...fieldProps} />
                    </div>
                    <div id='q-company' className='md:col-span-2'>
                        <SearchableSelect label='Company' name='company' value={data.company} error={errors.company} required options={COMPANIES} placeholder='Choose' {...fieldProps} />
                    </div>
                </Section>
                </div>
            )}

            {showJoin && (
                <div className='!mt-2'>
                <Section icon='fa-user-check' title='Joining details' subtitle='If joined'>
                    <div className='md:col-span-2 flex flex-col gap-1.5'>
                        <label className={labelClass}>
                            Final status <span className='text-slate-500 text-xs ml-1 font-normal'>(optional)</span>
                        </label>
                        <div className='flex flex-wrap gap-x-4'>
                            {FINAL_STATUSES.map((s) => (
                                <label key={s} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='finalStatus' checked={data.finalStatus === s}
                                        onChange={() => set('finalStatus', s)} className='h-4 w-4 accent-[#1f4e6b]' />
                                    {s}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div id='q-hiredCost'>
                        <FormField label='Hired cost' name='hiredCost' value={data.hiredCost} error={errors.hiredCost} required {...fieldProps} />
                    </div>

                    <div id='q-employeeId'>
                        <FormField label='Employee ID' name='employeeId' value={data.employeeId} error={errors.employeeId} required {...fieldProps} />
                        <p className='text-xs font-medium text-amber-700 mt-1.5 flex items-center gap-1'>
                            <Icon className='fa-solid fa-triangle-exclamation text-[10px]' />
                            This is very critical, check twice before you submit.
                        </p>
                    </div>

                    <div id='q-joiningForm' className='flex flex-col gap-1.5'>
                        <label className={labelClass}>
                            Upload joining form <span className='text-red-500'>*</span>
                        </label>
                        {!joiningForm ? (
                            <label className={`flex min-h-10 items-center gap-3 border border-dashed rounded-xl bg-white/80 px-3 py-2.5 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${errors.joiningForm ? 'border-red-300' : 'border-slate-300 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                                <Icon className='fa-solid fa-cloud-arrow-up text-slate-400' />
                                <span className='text-sm text-slate-600'><b className='text-[var(--brand-600)] font-semibold'>Add file</b> (1 file, max 10 MB)</span>
                                <input type='file' className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleJoiningFormFile} />
                            </label>
                        ) : (
                            <div className='flex min-h-10 items-center justify-between gap-3 bg-white/80 border border-slate-200/80 rounded-xl pl-3 pr-1 py-1 text-sm'>
                                <span className='flex min-w-0 items-baseline gap-2'><span className='truncate text-slate-700'>{joiningForm.name}</span><span className='shrink-0 text-xs text-slate-500 tabular-nums'>{(joiningForm.size / (1024 * 1024)).toFixed(2)} MB</span></span>
                                <button type='button' onClick={() => setJoiningForm(null)} aria-label='Remove file'
                                    className='press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'><Icon className='fa-solid fa-xmark text-xs' /></button>
                            </div>
                        )}
                        <ErrorText>{errors.joiningForm}</ErrorText>
                    </div>

                    <div id='q-kybForm' className='flex flex-col gap-1.5'>
                        <label className={labelClass}>
                            KYB form <span className='text-slate-500 text-xs ml-1 font-normal'>(optional)</span>
                        </label>
                        {!kybForm ? (
                            <label className={`flex min-h-10 items-center gap-3 border border-dashed rounded-xl bg-white/80 px-3 py-2.5 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${errors.kybForm ? 'border-red-300' : 'border-slate-300 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                                <Icon className='fa-solid fa-cloud-arrow-up text-slate-400' />
                                <span className='text-sm text-slate-600'><b className='text-[var(--brand-600)] font-semibold'>Add file</b> (1 file, max 10 MB)</span>
                                <input type='file' className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleKybFile} />
                            </label>
                        ) : (
                            <div className='flex min-h-10 items-center justify-between gap-3 bg-white/80 border border-slate-200/80 rounded-xl pl-3 pr-1 py-1 text-sm'>
                                <span className='flex min-w-0 items-baseline gap-2'><span className='truncate text-slate-700'>{kybForm.name}</span><span className='shrink-0 text-xs text-slate-500 tabular-nums'>{(kybForm.size / (1024 * 1024)).toFixed(2)} MB</span></span>
                                <button type='button' onClick={() => setKybForm(null)} aria-label='Remove file'
                                    className='press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'><Icon className='fa-solid fa-xmark text-xs' /></button>
                            </div>
                        )}
                        <ErrorText>{errors.kybForm}</ErrorText>
                    </div>

                    <div className='md:col-span-2 flex items-start gap-2 bg-amber-50 ring-1 ring-inset ring-amber-200 rounded-xl px-3 py-2.5'>
                        <Icon className='fa-solid fa-circle-info text-amber-500 text-xs mt-0.5' />
                        <p className='text-xs text-amber-800'>
                            Please submit the Employee Joining Form:{' '}
                            <a href={JOINING_FORM_LINK} target='_blank' rel='noreferrer' className='font-medium underline'>
                                {JOINING_FORM_LINK}
                            </a>
                        </p>
                    </div>
                </Section>
                </div>
            )}

            {showReject && (
                <div className='!mt-2'>
                <Section icon='fa-user-xmark' title='Reason for decline' subtitle=''>
                    <div id='q-declineReason' className='md:col-span-2'>
                        <SearchableSelect label='Decline reasons' name='declineReason' value={data.declineReason} error={errors.declineReason} required options={DECLINE_REASONS} placeholder='Choose' {...fieldProps} />
                    </div>

                    <div id='q-connectFuture' className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className={labelClass}>
                            Whether to connect this candidate in future <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-4'>
                            {['Yes', 'No'].map((opt) => (
                                <label key={opt} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='connectFuture' checked={data.connectFuture === opt}
                                        onChange={() => set('connectFuture', opt)} className='h-4 w-4 accent-[#1f4e6b]' />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        <ErrorText>{errors.connectFuture}</ErrorText>
                    </div>

                    {showNextConnect && (
                        <div id='q-nextConnectDate'>
                            <FormField label='Next connect date' name='nextConnectDate' type='date' min={todayISO()} value={data.nextConnectDate} error={errors.nextConnectDate} required {...fieldProps} />
                        </div>
                    )}
                </Section>
                </div>
            )}

            {/* ---------- 3. Evaluation & Next Steps ---------- (kept last, after the stage-specific section) */}
            <Section step={3} icon='fa-clipboard-check' title='Evaluation and next steps' subtitle='How the candidate did and what happens next'>
                {/* Rating — navy/slate scale instead of the purple radio row */}
                <div id='q-rating' className='flex flex-col gap-1.5'>
                    <label className={labelClass}>
                        Rating <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
                        <span className='text-xs text-slate-500'>Low</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                type='button'
                                key={n}
                                onClick={() => setRating(n)}
                                aria-pressed={String(data.rating) === String(n)}
                                aria-label={`Rating ${n} of 5`}
                                className={`press w-10 h-10 rounded-xl border text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-1 ${String(data.rating) === String(n)
                                    ? 'gradient-brand border-transparent text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)]'
                                    : 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                        <span className='text-xs text-slate-500'>Excellent</span>
                    </div>
                    {errors.rating && (
                        <p className='text-[12px] text-red-600 flex items-center gap-1'>
                            <Icon className='fa-solid fa-circle-exclamation text-[11px]' />
                            {errors.rating}
                        </p>
                    )}
                </div>
                {NEXT_DATE_STAGES.includes(data.stage) && (
                    <div id='q-nextDate'>
                        <FormField label='Next schedule date' name='nextDate' type='date' min={todayISO()} value={data.nextDate} error={errors.nextDate} required {...fieldProps} />
                    </div>
                )}
                <div className='md:col-span-2' id='q-remarks'>
                    <FormField label='Remarks / reason / conversation' name='remarks' value={data.remarks} error={errors.remarks} required textarea {...fieldProps} />
                </div>
            </Section>

            {/* Footer: Reference By sits right beside Cancel. On phones the buttons stack full-width
                (Reference By, Submit, Cancel); from sm up they sit in one row (Reference By, Cancel, Submit). */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100'>
                <div className='order-1'>
                    <ReferralPicker employees={currentEmployees} value={referral} onSelect={handleReferral} />
                </div>
                <button
                    type='button'
                    onClick={onCancel}
                    className={`${secondaryButton} order-3 sm:order-2 w-full sm:w-auto`}
                >
                    Cancel
                </button>
                <button
                    type='submit'
                    className={`${primaryButton} order-2 sm:order-3 w-full sm:w-auto`}
                >
                    <Icon className='fa-solid fa-paper-plane text-xs' />
                    Submit
                </button>
            </div>
        </form>
    )
}

export default RecruitmentTrackerForm