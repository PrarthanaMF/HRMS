import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import FormField from '../../Common/FormField'
import SearchableSelect from '../../Common/SearchableSelect'
import Section from '../../Common/FormSection'
import { selectAllEmployees } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { todayISO } from '../../../Utils/formatDate'
import { HR_NAMES, NEXT_DATE_STAGES, RECRUITMENT_STAGES, RECRUITMENT_SOURCES, RECRUITMENT_DIVISIONS, COMPANIES, FINAL_STATUSES, DECLINE_REASONS, JOINING_FORM_LINK, INTERVIEWERS } from '../../../Utils/mockRecruitment'

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
    <p className='text-[11px] text-red-600 flex items-center gap-1'>
        <i className='fa-solid fa-circle-exclamation text-[10px]'></i>{children}
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
            <div className={`flex items-stretch rounded-lg border transition ${value ? 'border-[#062139] bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-100'}`}>
                <button
                    type='button'
                    aria-haspopup='listbox'
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className='flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 min-w-0'
                >
                    <i className='fa-solid fa-user-group text-xs text-slate-400 shrink-0'></i>
                    <span className='truncate max-w-[180px]'>{value ? `Reference: ${value.name}` : 'Reference By'}</span>
                    <i className={`fa-solid fa-chevron-up text-[10px] text-slate-400 shrink-0 transition-transform ${open ? '' : 'rotate-180'}`}></i>
                </button>
                {value && (
                    <button
                        type='button'
                        onClick={() => onSelect(null)}
                        title='Remove reference'
                        aria-label='Remove reference'
                        className='px-2.5 text-slate-400 hover:text-red-500 border-l border-slate-200 transition'
                    >
                        <i className='fa-solid fa-xmark text-xs'></i>
                    </button>
                )}
            </div>

            {open && (
                <div className='absolute z-30 bottom-full mb-2 left-0 sm:left-auto sm:right-0 w-full sm:w-72 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden'>
                    <div className='px-3 pt-3 pb-2'>
                        <p className='text-[10px] uppercase font-semibold tracking-wide text-slate-400 mb-2'>Current Employee</p>
                        <div className='relative'>
                            <i className='fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400'></i>
                            <input
                                ref={searchRef}
                                type='text'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) }
                                    if (e.key === 'Enter') { e.preventDefault(); if (filtered[0]) pick(filtered[0]) }
                                }}
                                placeholder='Search employee...'
                                className='w-full pl-8 pr-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-[#062139]'
                            />
                        </div>
                    </div>
                    <ul role='listbox' className='max-h-52 overflow-y-auto py-1 border-t border-slate-100'>
                        {filtered.length === 0 ? (
                            <li className='px-3 py-3 text-xs text-slate-400 text-center'>No employees found</li>
                        ) : (
                            filtered.map((emp) => (
                                <li
                                    key={emp._id}
                                    role='option'
                                    aria-selected={value?.empId === emp.empId}
                                    onClick={() => pick(emp)}
                                    className={`px-3 py-2 cursor-pointer hover:bg-slate-100 ${value?.empId === emp.empId ? 'bg-slate-50' : ''}`}
                                >
                                    <p className='text-sm text-slate-800 font-medium truncate'>{emp.name}</p>
                                    <p className='text-[11px] text-slate-400 truncate'>{[emp.designation, emp.branch].filter(Boolean).join(' · ')}</p>
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
            <p className='text-xs text-slate-500'>
                Log this candidate's progress through the hiring pipeline. Fields marked <span className='text-red-500'>*</span> are required.
            </p>

            {/* ---------- 1. Candidate Details ---------- */}
            <Section step={1} icon='fa-user' title='Candidate Details' subtitle="Who the candidate is and how to reach them">
                <div id='q-name'>
                    <FormField label='Candidate Name' name='name' value={data.name} error={errors.name} required {...fieldProps} />
                </div>
                <div id='q-contact'>
                    <FormField label='Contact Number' name='contact' type='tel' value={data.contact} error={errors.contact} required {...fieldProps} />
                </div>
                <div id='q-email'>
                    <FormField label='Candidate Email' name='email' type='email' value={data.email} error={errors.email} required {...fieldProps} />
                </div>
                <div id='q-salary'>
                    <FormField label='Salary Expectation' name='salary' value={data.salary} error={errors.salary} required {...fieldProps} />
                </div>

                {/* Resume upload — styled to match the site instead of the Google dropzone */}
                <div id='q-resume' className='flex flex-col gap-1.5 md:col-span-2'>
                    <label className='text-xs font-medium text-slate-700'>
                        Upload Resume <span className='text-red-500'>*</span>
                    </label>
                    {!resumeFile ? (
                        <label className={`flex items-center gap-3 border border-dashed rounded-lg bg-white px-3 py-2.5 cursor-pointer transition ${errors.resume ? 'border-red-300' : 'border-slate-300 hover:border-[#062139]'}`}>
                            <i className='fa-solid fa-cloud-arrow-up text-slate-400'></i>
                            <span className='text-sm text-slate-600'><b className='text-[#062139] font-medium'>Add file</b> (PDF/DOC, up to 10 MB)</span>
                            <input type='file' className='hidden' accept='.pdf,.doc,.docx' onChange={handleFile} />
                        </label>
                    ) : (
                        <div className='flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'>
                            <span className='truncate text-slate-700'>{resumeFile.name} · {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <button
                                type='button'
                                onClick={() => setResumeFile(null)}
                                className='text-slate-400 hover:text-slate-700 text-lg leading-none px-1'
                                aria-label='Remove file'
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    {errors.resume && (
                        <p className='text-[11px] text-red-600 flex items-center gap-1'>
                            <i className='fa-solid fa-circle-exclamation text-[10px]'></i>
                            {errors.resume}
                        </p>
                    )}
                </div>
            </Section>

            {/* ---------- 2. Recruitment Details ---------- */}
            <Section step={2} icon='fa-briefcase' title='Recruitment Details' subtitle='Where the candidate is in the pipeline and who is handling them'>
                <div id='q-stage'>
                    <SearchableSelect label='Stage' name='stage' value={data.stage} error={errors.stage} required options={RECRUITMENT_STAGES} {...fieldProps} />
                </div>
                <div id='q-source'>
                    <SearchableSelect label='Recruitment Source' name='source' value={data.source} error={errors.source} required options={RECRUITMENT_SOURCES} {...fieldProps} />
                </div>
                <div id='q-division'>
                    <SearchableSelect label='Division' name='division' value={data.division} error={errors.division} required options={RECRUITMENT_DIVISIONS} {...fieldProps} />
                </div>
                <div id='q-hrName'>
                    <SearchableSelect label='HR Name' name='hrName' value={data.hrName} error={errors.hrName} required options={HR_NAMES} searchPlaceholder='Search HR name...' {...fieldProps} />
                </div>
            </Section>

            {/* ---------- Stage-specific sections ----------
                Right after Recruitment Details, so they follow the Stage dropdown that decides
                which one shows. Same rules as the Recruitment Tracker's Update pop-up. */}
            {showInterview && (
                <div className='!mt-2'>
                <Section icon='fa-comments' title='Interview Update Section' subtitle=''>
                    <div id='q-currentSalary'>
                        <FormField label='Current Salary' name='currentSalary' value={data.currentSalary} error={errors.currentSalary} required {...fieldProps} />
                    </div>

                    <div id='q-negotiable' className='flex flex-col gap-1.5'>
                        <label className='text-xs font-medium text-slate-700'>
                            Negotiable <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-4 pt-1'>
                            {['Yes', 'No'].map((opt) => (
                                <label key={opt} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='negotiable' checked={data.negotiable === opt}
                                        onChange={() => set('negotiable', opt)} className='accent-[#062139]' />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        <ErrorText>{errors.negotiable}</ErrorText>
                    </div>

                    <div id='q-negotiableRemarks'>
                        <FormField label='Negotiable Remarks' name='negotiableRemarks' value={data.negotiableRemarks} error={errors.negotiableRemarks} {...fieldProps} />
                    </div>

                    <div id='q-remarksOfCandidate'>
                        <FormField label='Remarks Of Candidate' name='remarksOfCandidate' value={data.remarksOfCandidate} error={errors.remarksOfCandidate} required {...fieldProps} />
                    </div>

                    <div id='q-interviewer' className='md:col-span-2'>
                        <SearchableSelect label='Interviewer' name='interviewer' value={data.interviewer} error={errors.interviewer} required options={INTERVIEWERS} placeholder='Choose' {...fieldProps} />
                    </div>
                </Section>
                </div>
            )}

            {showOffer && (
                <div className='!mt-2'>
                <Section icon='fa-file-signature' title='Offer Details' subtitle='If we offered'>
                    <div id='q-offerDate'>
                        <FormField label='Offer Date' name='offerDate' type='date' value={data.offerDate} error={errors.offerDate} required {...fieldProps} />
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
                <Section icon='fa-user-check' title='Joining Details' subtitle='If joined'>
                    <div className='md:col-span-2 flex flex-col gap-1.5'>
                        <label className='text-xs font-medium text-slate-700'>
                            Final Status <span className='text-slate-400 text-[10px] ml-1 font-normal'>(optional)</span>
                        </label>
                        <div className='flex flex-wrap gap-x-4 gap-y-2 pt-1'>
                            {FINAL_STATUSES.map((s) => (
                                <label key={s} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='finalStatus' checked={data.finalStatus === s}
                                        onChange={() => set('finalStatus', s)} className='accent-[#062139]' />
                                    {s}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div id='q-hiredCost'>
                        <FormField label='Hired Cost' name='hiredCost' value={data.hiredCost} error={errors.hiredCost} required {...fieldProps} />
                    </div>

                    <div id='q-employeeId'>
                        <FormField label='Employee ID' name='employeeId' value={data.employeeId} error={errors.employeeId} required {...fieldProps} />
                        <p className='text-[11px] font-semibold text-amber-700 mt-1.5 flex items-center gap-1'>
                            <i className='fa-solid fa-triangle-exclamation text-[10px]'></i>
                            This is very critical, check twice before you submit.
                        </p>
                    </div>

                    <div id='q-joiningForm' className='flex flex-col gap-1.5'>
                        <label className='text-xs font-medium text-slate-700'>
                            Upload Joining Form <span className='text-red-500'>*</span>
                        </label>
                        {!joiningForm ? (
                            <label className={`flex items-center gap-3 border border-dashed rounded-lg bg-white px-3 py-2.5 cursor-pointer transition ${errors.joiningForm ? 'border-red-300' : 'border-slate-300 hover:border-[#062139]'}`}>
                                <i className='fa-solid fa-cloud-arrow-up text-slate-400'></i>
                                <span className='text-sm text-slate-600'><b className='text-[#062139] font-medium'>Add file</b> (1 file, max 10 MB)</span>
                                <input type='file' className='hidden' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleJoiningFormFile} />
                            </label>
                        ) : (
                            <div className='flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'>
                                <span className='truncate text-slate-700'>{joiningForm.name} · {(joiningForm.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button type='button' onClick={() => setJoiningForm(null)} aria-label='Remove file'
                                    className='text-slate-400 hover:text-slate-700 text-lg leading-none px-1'>&times;</button>
                            </div>
                        )}
                        <ErrorText>{errors.joiningForm}</ErrorText>
                    </div>

                    <div id='q-kybForm' className='flex flex-col gap-1.5'>
                        <label className='text-xs font-medium text-slate-700'>
                            KYB Form <span className='text-slate-400 text-[10px] ml-1 font-normal'>(optional)</span>
                        </label>
                        {!kybForm ? (
                            <label className={`flex items-center gap-3 border border-dashed rounded-lg bg-white px-3 py-2.5 cursor-pointer transition ${errors.kybForm ? 'border-red-300' : 'border-slate-300 hover:border-[#062139]'}`}>
                                <i className='fa-solid fa-cloud-arrow-up text-slate-400'></i>
                                <span className='text-sm text-slate-600'><b className='text-[#062139] font-medium'>Add file</b> (1 file, max 10 MB)</span>
                                <input type='file' className='hidden' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleKybFile} />
                            </label>
                        ) : (
                            <div className='flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'>
                                <span className='truncate text-slate-700'>{kybForm.name} · {(kybForm.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <button type='button' onClick={() => setKybForm(null)} aria-label='Remove file'
                                    className='text-slate-400 hover:text-slate-700 text-lg leading-none px-1'>&times;</button>
                            </div>
                        )}
                        <ErrorText>{errors.kybForm}</ErrorText>
                    </div>

                    <div className='md:col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5'>
                        <i className='fa-solid fa-circle-info text-amber-500 text-xs mt-0.5'></i>
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
                <Section icon='fa-user-xmark' title='Reason for Decline' subtitle=''>
                    <div id='q-declineReason' className='md:col-span-2'>
                        <SearchableSelect label='Decline reasons' name='declineReason' value={data.declineReason} error={errors.declineReason} required options={DECLINE_REASONS} placeholder='Choose' {...fieldProps} />
                    </div>

                    <div id='q-connectFuture' className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-medium text-slate-700'>
                            Whether to Connect This Candidate in Future <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex gap-4 pt-1'>
                            {['Yes', 'No'].map((opt) => (
                                <label key={opt} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                    <input type='radio' name='connectFuture' checked={data.connectFuture === opt}
                                        onChange={() => set('connectFuture', opt)} className='accent-[#062139]' />
                                    {opt}
                                </label>
                            ))}
                        </div>
                        <ErrorText>{errors.connectFuture}</ErrorText>
                    </div>

                    {showNextConnect && (
                        <div id='q-nextConnectDate'>
                            <FormField label='Next Connect Date' name='nextConnectDate' type='date' min={todayISO()} value={data.nextConnectDate} error={errors.nextConnectDate} required {...fieldProps} />
                        </div>
                    )}
                </Section>
                </div>
            )}

            {/* ---------- 3. Evaluation & Next Steps ---------- (kept last, after the stage-specific section) */}
            <Section step={3} icon='fa-clipboard-check' title='Evaluation & Next Steps' subtitle='How the candidate did and what happens next'>
                {/* Rating — navy/slate scale instead of the purple radio row */}
                <div id='q-rating' className='flex flex-col gap-1.5'>
                    <label className='text-xs font-medium text-slate-700'>
                        Rating <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex items-center gap-2'>
                        <span className='text-[11px] text-slate-400'>Low</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                type='button'
                                key={n}
                                onClick={() => setRating(n)}
                                className={`w-8 h-8 rounded-lg border text-sm font-semibold transition ${String(data.rating) === String(n)
                                    ? 'bg-[#062139] border-[#062139] text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#062139]'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                        <span className='text-[11px] text-slate-400'>Excellent</span>
                    </div>
                    {errors.rating && (
                        <p className='text-[11px] text-red-600 flex items-center gap-1'>
                            <i className='fa-solid fa-circle-exclamation text-[10px]'></i>
                            {errors.rating}
                        </p>
                    )}
                </div>
                {NEXT_DATE_STAGES.includes(data.stage) && (
                    <div id='q-nextDate'>
                        <FormField label='Next Schedule Date' name='nextDate' type='date' min={todayISO()} value={data.nextDate} error={errors.nextDate} required {...fieldProps} />
                    </div>
                )}
                <div className='md:col-span-2' id='q-remarks'>
                    <FormField label='Remarks/Reason/Conversation' name='remarks' value={data.remarks} error={errors.remarks} required textarea {...fieldProps} />
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
                    className='order-3 sm:order-2 w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                >
                    Cancel
                </button>
                <button
                    type='submit'
                    className='order-2 sm:order-3 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm'
                >
                    <i className='fa-solid fa-paper-plane text-xs'></i>
                    Submit
                </button>
            </div>
        </form>
    )
}

export default RecruitmentTrackerForm