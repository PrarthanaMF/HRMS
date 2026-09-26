import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import FormField from '../../Common/FormField'
import SearchableSelect from '../../Common/SearchableSelect'
import Section from '../../Common/FormSection'
import { selectAllEmployees } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { todayISO } from '../../../Utils/formatDate'
import { HR_NAMES, NEXT_DATE_STAGES, RECRUITMENT_STAGES, RECRUITMENT_SOURCES, RECRUITMENT_DIVISIONS } from '../../../Utils/mockRecruitment'

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

const FIELD_ORDER = ['name', 'contact', 'email', 'salary', 'resume', 'stage', 'source', 'division', 'hrName', 'rating', 'nextDate', 'remarks']

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
    })
    const [referral, setReferral] = useState(null) // { empId, name } of the referring current employee
    const [resumeFile, setResumeFile] = useState(null)
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setData((d) => ({ ...d, [name]: value }))
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    }

    const setRating = (n) => {
        setData((d) => ({ ...d, rating: n }))
        if (errors.rating) setErrors((er) => ({ ...er, rating: undefined }))
    }

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
        setErrors(next)
        return next
    }

    const handleFile = (e) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.size > MAX_FILE_BYTES) {
            setErrors((er) => ({ ...er, resume: 'That file is larger than 10 MB. Please choose a smaller file.' }))
            e.target.value = ''
            setResumeFile(null)
            return
        }
        setResumeFile(f)
        setErrors((er) => ({ ...er, resume: undefined }))
    }

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

            {/* ---------- 3. Evaluation & Next Steps ---------- */}
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