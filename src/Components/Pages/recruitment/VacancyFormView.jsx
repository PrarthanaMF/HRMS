import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addVacancy, updateVacancy, selectAllVacancies, selectNextSerialNumber } from '../../../Store/Redux/Recruitment/VacancySlice'
import { DESIGNATIONS, BRANCHES, SALARY_RANGES, EXPERIENCE_LEVELS, VACANCY_STATUSES } from '../../../Utils/mockRecruitment'
import FormField from '../../Common/FormField'
import { formatTimestamp } from '../../../Utils/formatDate'

const EMPTY_FORM = {
    designation: '', branch: '', jobDescription: '',
    salaryRange: '', openings: '', experienceRequired: '',
    targetDate: '', status: 'Open',
}

// Every field of the Google "Recruitment Request" form is required
const REQUIRED = ['designation', 'branch', 'jobDescription', 'salaryRange', 'openings', 'experienceRequired', 'targetDate']

const validate = (form, isEdit) => {
    const errors = {}
    REQUIRED.forEach((field) => {
        const value = form[field]
        if (value === '' || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            errors[field] = 'This field is required'
        }
    })

    if (form.openings !== '' && (!Number.isInteger(Number(form.openings)) || Number(form.openings) < 1)) {
        errors.openings = 'Enter a whole number of 1 or more'
    }

    // Only block past dates for a NEW request — an old request being edited may already be past its date
    const today = new Date().toISOString().slice(0, 10)
    if (!isEdit && form.targetDate && form.targetDate < today) {
        errors.targetDate = 'Target date cannot be in the past'
    }
    return errors
}

const VacancyFormView = ({ mode = 'add' }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { jobId } = useParams()
    const vacancies = useSelector(selectAllVacancies)
    const nextSerial = useSelector(selectNextSerialNumber) // S.No this new request will get
    const user = useSelector((state) => state.auth.value)   // the logged-in person

    const isEdit = mode === 'edit'
    const existing = isEdit ? vacancies.find((v) => v.jobId === jobId) : null

    const [formData, setFormData] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [submittedAt, setSubmittedAt] = useState(null) // set right after a NEW request is submitted
    const [submittedSerial, setSubmittedSerial] = useState(null) // the S.No of that new request

    // In edit mode, fill the form with the request being edited
    useEffect(() => {
        if (existing) setFormData({ ...EMPTY_FORM, ...existing })
    }, [existing])

    // Requestor is never typed or chosen:
    //   new request  -> the person logged in right now
    //   edit request -> whoever originally raised it
    const requestorName = isEdit ? (existing?.requestorName || '') : (user?.name || '')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
    }

    const handleSubmit = () => {
        const allErrors = validate(formData, isEdit)
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors)
            return
        }

        const cleaned = { ...formData, openings: Number(formData.openings) }

        if (isEdit) {
            dispatch(updateVacancy(cleaned))
            navigate('/recruitment')
        } else {
            // slice fills in _id, status and requestedOn (timestamp) for new requests.
            // jobId (S.No) is generated here so the same number can be shown on the
            // confirmation screen below, matching what appears in the frontend everywhere else.
            // eslint-disable-next-line no-unused-vars
            const { status, ...payload } = cleaned
            dispatch(addVacancy({
                ...payload,
                jobId: nextSerial,
                requestorName: user?.name || '',
                requestorEmpId: user?.empId || '',
            }))
            // Show a "response recorded" confirmation with the S.No + timestamp, like Google
            // Forms does, instead of navigating away immediately.
            setSubmittedSerial(nextSerial)
            setSubmittedAt(new Date().toISOString())
        }
    }

    // ---------- Submitted confirmation (new requests only) ----------
    if (submittedAt) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center'>
                <div className='w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
                    <i className="fa-solid fa-check text-2xl text-emerald-600"></i>
                </div>
                <h2 className='text-lg font-bold text-slate-800'>Your hiring request has been recorded</h2>
                <p className='text-sm text-slate-500 mt-1'>
                    S.No <span className='font-semibold text-slate-700'>{submittedSerial}</span>
                    {' '}&middot; Submitted on <span className='font-medium text-slate-700'>{formatTimestamp(submittedAt)}</span>
                </p>
                <div className='flex items-center justify-center gap-3 mt-6'>
                    <button
                        onClick={() => { setFormData(EMPTY_FORM); setSubmittedAt(null); setSubmittedSerial(null) }}
                        className='px-4 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                    >
                        Submit another request
                    </button>
                    <button
                        onClick={() => navigate('/recruitment')}
                        className='px-5 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition'
                    >
                        Back to vacancies
                    </button>
                </div>
            </div>
        )
    }

    // Edit URL had a jobId that doesn't exist
    if (isEdit && !existing) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className="fa-solid fa-triangle-exclamation text-4xl text-slate-300 mb-3"></i>
                <p className='text-slate-500 text-sm mb-4'>Request "{jobId}" was not found</p>
                <button
                    onClick={() => navigate('/recruitment')}
                    className='px-4 py-2 text-sm font-medium text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition'
                >
                    Back to vacancies
                </button>
            </div>
        )
    }

    const fieldProps = { onChange: handleChange }

    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

            {/* Header */}
            <div className='flex items-center gap-3 px-4 md:px-6 py-4 border-b border-slate-100'>
                <button
                    onClick={() => navigate('/recruitment')}
                    className='w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition shrink-0'
                    title='Back to vacancies'
                >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                </button>
                <div className='min-w-0'>
                    <h2 className='text-base md:text-lg font-bold text-slate-800 truncate'>
                        {isEdit ? `Edit Hiring Request — ${formData.designation}` : 'New Hiring Request'}
                    </h2>
                    <p className='text-[11px] md:text-xs text-slate-500 truncate'>
                        {isEdit ? `S.No: ${formData.jobId}` : 'Fill in the details and submit the request'}
                    </p>
                </div>
            </div>

            {/* Fields (same order as the Google Form) */}
            <div className='p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>

                {/* 1. Requestor Name — read-only, comes from the login */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-medium text-slate-700'>
                        Requestor Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-between gap-2'>
                        <span className='truncate' data-testid='requestor'>{requestorName || '—'}</span>
                        <i className="fa-solid fa-lock text-[10px] text-slate-400 shrink-0"></i>
                    </div>
                    <p className='text-[11px] text-slate-400'>
                        {isEdit ? 'Person who raised this request' : 'Filled automatically from your login'}
                    </p>
                </div>

                {/* 2. Designation */}
                <FormField label='Designation' name='designation' value={formData.designation} error={errors.designation} required options={DESIGNATIONS} {...fieldProps} />

                {/* 3. Branch */}
                <FormField label='Branch' name='branch' value={formData.branch} error={errors.branch} required options={BRANCHES} {...fieldProps} />

                {/* 4. Salary Range */}
                <FormField label='Salary Range' name='salaryRange' value={formData.salaryRange} error={errors.salaryRange} required options={SALARY_RANGES} {...fieldProps} />

                {/* 5. No. of vacancies */}
                <FormField label='No. of Vacancies' name='openings' type='number' value={formData.openings} error={errors.openings} required placeholder='e.g. 2' {...fieldProps} />

                {/* 6. Experience Required */}
                <FormField label='Experience Required' name='experienceRequired' value={formData.experienceRequired} error={errors.experienceRequired} required options={EXPERIENCE_LEVELS} {...fieldProps} />

                {/* 7. Target Date */}
                <FormField label='Target Date' name='targetDate' type='date' value={formData.targetDate} error={errors.targetDate} required {...fieldProps} />

                {/* Status — only when editing an existing request */}
                {isEdit && (
                    <FormField label='Status' name='status' value={formData.status} error={errors.status} required options={VACANCY_STATUSES} {...fieldProps} />
                )}

                {/* 8. Job Description */}
                <div className='md:col-span-2'>
                    <FormField label='Job Description' name='jobDescription' value={formData.jobDescription} error={errors.jobDescription} required textarea placeholder='Please provide complete details of job requirements / key responsibilities' {...fieldProps} />
                </div>
            </div>

            {/* Footer buttons */}
            <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50'>
                <button
                    type='button'
                    onClick={() => navigate('/recruitment')}
                    className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                >
                    Cancel
                </button>
                <button
                    type='button'
                    onClick={handleSubmit}
                    className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm'
                >
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                    {isEdit ? 'Save Changes' : 'Submit Request'}
                </button>
            </div>
        </div>
    )
}

export default VacancyFormView