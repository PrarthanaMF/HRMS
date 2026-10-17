import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage3, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection, RatingPreview } from '../../../Common/SuccessScreen'
import RatingRow from '../../../Common/RatingRow'

import Icon from '../../../Common/Icon'
import { primaryButton, secondaryButton } from '../../../Common/PageHeader'
const FormSection = ({ title, subtitle, icon, children }) => (
    <div className='glass-panel rounded-2xl p-5 md:p-6'>
        <div className='flex items-center gap-3 mb-5 pb-3 border-b border-slate-100'>
            <div aria-hidden='true' className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#E3EEF6] to-[#CFE2F0] text-[var(--brand-600)] ring-1 ring-inset ring-white flex items-center justify-center shrink-0'>
                <Icon className={`fa-solid ${icon} text-sm`} />
            </div>
            <div className='min-w-0'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>{title}</h3>
                {subtitle && <p className='mt-0.5 text-xs text-slate-500'>{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
)

const YesNoRadio = ({ label, name, value, onChange, error }) => (
    <div>
        <label className='block text-xs font-medium text-slate-700 mb-2'>
            {label} <span className='text-red-500'>*</span>
        </label>
        <div className='flex flex-col sm:flex-row gap-2'>
            {['Yes', 'No'].map((option) => (
                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-2.5 min-h-11 rounded-xl border cursor-pointer transition-colors ${
                    value === option
                        ? 'border-[#2b6485] bg-[#f2f5f7] ring-2 ring-[#2b6485]/20'
                        : 'border-slate-200/80 bg-white/70 hover:border-[#cfdce5] hover:bg-white'
                }`}>
                    <input type='radio' name={name} value={option}
                        checked={value === option} onChange={onChange}
                        className='w-4 h-4 accent-[#1f4e6b]' />
                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                </label>
            ))}
        </div>
        {error && (
            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                <Icon className="fa-solid fa-circle-exclamation text-[10px]" />
                {error}
            </p>
        )}
    </div>
)

const Stage3ExitInterviewForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const record = useSelector(selectExitById(id))

    const rmRatingFields = [
        { key: 'recognition', label: 'Were you provided recognition in your job?' },
        { key: 'regularFeedback', label: 'Regular feedback was provided on performance' },
        { key: 'promptResolutions', label: 'Resolved complaints & concerns promptly' },
        { key: 'equitableTreatment', label: 'Demonstrated equitable treatment (was impartial)' },
        { key: 'knowledgeUpgrade', label: 'Upgraded your knowledge & was interested in your development' },
        { key: 'encouragedFeedback', label: 'Encouraged feedback and suggestions from you' },
        { key: 'providedLeadership', label: 'Provided leadership' },
    ]

    const companyRatingFields = [
        { key: 'performanceReviewSystem', label: "Company's Performance Review System" },
        { key: 'inductionProgram', label: "Company's Induction program" },
        { key: 'payRate', label: 'Rate of pay for your job role' },
        { key: 'careerDevelopment', label: 'Career development / Advancement opportunities' },
        { key: 'workEnvironment', label: 'Work environment and Timing' },
        { key: 'sensitiveToNeeds', label: "Company was sensitive to employees' needs?" },
        { key: 'administration', label: 'Administration' },
        { key: 'duties', label: 'Duties and responsibilities given to you' },
        { key: 'benefits', label: 'Employee benefit facilities' },
        { key: 'employeeInforming', label: 'Keeping employee informed' },
        { key: 'fairTreatment', label: 'Treating employee fairly' },
        { key: 'cooperation', label: 'Cooperation within your department' },
        { key: 'recommendation', label: 'Recommend family/friends members for any job opening here' },
    ]

    const [formData, setFormData] = useState({
        preventDepartureAnswer: '',
        likedMost: '',
        likedLeast: '',
        dutiesMetExpectations: '',
        reportingManagerRatings: {},
        companyRatings: {},
        newCompanyAttraction: '',
        suggestions: '',
        remarks: '',
        removedFromWhatsappGroup: 'Yes',
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(null)

    if (!record) return <LockScreen title='Record not found' navigate={navigate} />
    if (record.status !== 'F&F Initiated' && !submitted) {
        return <LockScreen title='Stage 3 not available' record={record} navigate={navigate} />
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
        }
    }

    const handleRmRating = (key, value) => {
        setFormData((prev) => ({ ...prev, reportingManagerRatings: { ...prev.reportingManagerRatings, [key]: value } }))
        if (errors[`rm_${key}`]) {
            setErrors((prev) => { const n = { ...prev }; delete n[`rm_${key}`]; return n })
        }
    }

    const handleCompanyRating = (key, value) => {
        setFormData((prev) => ({ ...prev, companyRatings: { ...prev.companyRatings, [key]: value } }))
        if (errors[`co_${key}`]) {
            setErrors((prev) => { const n = { ...prev }; delete n[`co_${key}`]; return n })
        }
    }

    const validate = () => {
        const errs = {}
        if (!formData.preventDepartureAnswer.trim()) errs.preventDepartureAnswer = 'This field is required'
        if (!formData.likedMost.trim()) errs.likedMost = 'This field is required'
        if (!formData.likedLeast.trim()) errs.likedLeast = 'This field is required'
        if (!formData.dutiesMetExpectations) errs.dutiesMetExpectations = 'Please select Yes or No'
        rmRatingFields.forEach((f) => { if (!formData.reportingManagerRatings[f.key]) errs[`rm_${f.key}`] = 'Please rate' })
        companyRatingFields.forEach((f) => { if (!formData.companyRatings[f.key]) errs[`co_${f.key}`] = 'Please rate' })
        if (!formData.newCompanyAttraction.trim()) errs.newCompanyAttraction = 'This field is required'
        if (!formData.suggestions.trim()) errs.suggestions = 'This field is required'
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            const firstKey = Object.keys(errs)[0]
            const el = document.querySelector(`[name="${firstKey}"]`)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        const payload = {
            preventDepartureAnswer: formData.preventDepartureAnswer,
            likedMost: formData.likedMost,
            likedLeast: formData.likedLeast,
            dutiesMetExpectations: formData.dutiesMetExpectations,
            reportingManagerRatings: formData.reportingManagerRatings,
            companyRatings: formData.companyRatings,
            newCompanyAttraction: formData.newCompanyAttraction,
            suggestions: formData.suggestions,
            remarks: formData.remarks,
            removedFromWhatsappGroup: formData.removedFromWhatsappGroup,
        }

        dispatch(updateStage3({ _id: record._id, stage3: payload, status: 'F&F Pending' }))
        setSubmitted(payload)
    }

    const handleCancel = () => navigate(`/exit-process/records/${record._id}`)

    // ---- SUCCESS SCREEN ----
    if (submitted) {
        return (
            <SuccessScreen
                title='Stage 3 submitted'
                subtitle='Exit interview feedback has been recorded'
                recordId={record._id}
            >
                <PreviewSection title='Open questions' icon='fa-comment'>
                    <PreviewRow label='What prevented departure?' value={submitted.preventDepartureAnswer} full />
                    <PreviewRow label='Liked most' value={submitted.likedMost} full />
                    <PreviewRow label='Liked least' value={submitted.likedLeast} full />
                    <PreviewRow label='Duties met expectations' value={submitted.dutiesMetExpectations} />
                    <PreviewRow label='New company attraction' value={submitted.newCompanyAttraction} full />
                    <PreviewRow label='Suggestions' value={submitted.suggestions} full />
                    {submitted.remarks && <PreviewRow label='Remarks' value={submitted.remarks} full />}
                    <PreviewRow label='Removed from WhatsApp groups' value={submitted.removedFromWhatsappGroup} />
                </PreviewSection>

                <PreviewSection title='Reporting manager ratings' icon='fa-user-tie'>
                    {rmRatingFields.map((f) => (
                        <RatingPreview key={f.key} label={f.label} value={submitted.reportingManagerRatings[f.key]} />
                    ))}
                </PreviewSection>

                <PreviewSection title='Company ratings' icon='fa-building'>
                    {companyRatingFields.map((f) => (
                        <RatingPreview key={f.key} label={f.label} value={submitted.companyRatings[f.key]} />
                    ))}
                </PreviewSection>
            </SuccessScreen>
        )
    }

    // ---- FORM ----
    return (
        <div className='w-full max-w-4xl mx-auto pb-8'>
            <button onClick={handleCancel} className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                <Icon className="fa-solid fa-arrow-left text-xs" />
                Back to record
            </button>

            <form onSubmit={handleSubmit} className='space-y-4'>

                <div className='rise glass-strong rounded-2xl overflow-hidden'>
                    <div className='flex items-center gap-3.5 px-5 py-4 border-b border-slate-200/70'>
                        <div aria-hidden='true' className='gradient-brand w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/20'>
                            <Icon className="fa-solid fa-comment-dots text-base" />
                        </div>
                        <div className='min-w-0'>
                            <h2 className='text-base font-semibold leading-tight text-[var(--ink)] sm:text-[17px]'>Stage 3: Exit interview feedback</h2>
                            <p className='mt-0.5 text-[13px] text-slate-500'>Exit interview for {record.name}</p>
                        </div>
                    </div>
                    <div className='px-5 py-3 bg-[#f2f5f7]/70 text-xs text-slate-600 flex items-start gap-2'>
                        <Icon className="fa-solid fa-circle-info text-[#2b6485] text-xs mt-0.5" />
                        <span>Ratings use a <strong>1 to 5 scale</strong>, from very poor (1) to excellent (5).</span>
                    </div>
                </div>

                <FormSection title='Open questions' subtitle='General feedback about the employee experience' icon='fa-comment'>
                    <div className='space-y-4'>
                        <FormField label='What circumstances would have prevented your departure?' name='preventDepartureAnswer'
                            value={formData.preventDepartureAnswer} onChange={handleChange}
                            required error={errors.preventDepartureAnswer} textarea placeholder='NA if none' />
                        <FormField label='What did you like most about your job?' name='likedMost'
                            value={formData.likedMost} onChange={handleChange}
                            required error={errors.likedMost} textarea />
                        <FormField label='What did you like least about your job?' name='likedLeast'
                            value={formData.likedLeast} onChange={handleChange}
                            required error={errors.likedLeast} textarea />

                        <YesNoRadio
                            label='Did your duties and responsibilities meet with your expectations?'
                            name='dutiesMetExpectations'
                            value={formData.dutiesMetExpectations}
                            onChange={handleChange}
                            error={errors.dutiesMetExpectations}
                        />
                    </div>
                </FormSection>

                <FormSection title='Rate your reporting manager'
                    subtitle='What do you think of your reporting manager on the following heads?' icon='fa-user-tie'>
                    <div className='space-y-0'>
                        {rmRatingFields.map((f) => (
                            <RatingRow key={f.key} label={f.label}
                                value={formData.reportingManagerRatings[f.key] || 0}
                                onChange={(v) => handleRmRating(f.key, v)}
                                error={errors[`rm_${f.key}`]} />
                        ))}
                    </div>
                </FormSection>

                <FormSection title='Rate our company'
                    subtitle='What do you think of our company on the following heads?' icon='fa-building'>
                    <div className='space-y-0'>
                        {companyRatingFields.map((f) => (
                            <RatingRow key={f.key} label={f.label}
                                value={formData.companyRatings[f.key] || 0}
                                onChange={(v) => handleCompanyRating(f.key, v)}
                                error={errors[`co_${f.key}`]} />
                        ))}
                    </div>
                </FormSection>

                <FormSection title='Final questions' subtitle='A few last questions before you go' icon='fa-clipboard-list'>
                    <div className='space-y-4'>
                        <FormField label='What is more attractive about the new company you are joining?' name='newCompanyAttraction'
                            value={formData.newCompanyAttraction} onChange={handleChange}
                            required error={errors.newCompanyAttraction} textarea />
                        <FormField label='What suggestions do you have to make Marutiflex a better place to work?' name='suggestions'
                            value={formData.suggestions} onChange={handleChange}
                            required error={errors.suggestions} textarea />
                        <FormField label='Remarks (Do you have anything else to tell us?)' name='remarks'
                            value={formData.remarks} onChange={handleChange} textarea />

                        <YesNoRadio label='Whether removed from all official WhatsApp groups?'
                            name='removedFromWhatsappGroup'
                            value={formData.removedFromWhatsappGroup}
                            onChange={handleChange}
                            error={errors.removedFromWhatsappGroup} />
                    </div>
                </FormSection>

                <div className='glass-strong rounded-2xl flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-5 py-4'>
                    <button type='button' onClick={handleCancel}
                        className={`${secondaryButton} w-full sm:w-auto cursor-pointer`}>
                        Cancel
                    </button>
                    <button type='submit'
                        className={`${primaryButton} w-full sm:w-auto px-6 cursor-pointer`}>
                        Submit stage 3
                    </button>
                </div>

            </form>
        </div>
    )
}

const LockScreen = ({ title, record, navigate }) => (
    <div className='w-full max-w-2xl mx-auto'>
        <button onClick={() => navigate('/exit-process')} className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
            <Icon className="fa-solid fa-arrow-left text-xs" />
            Back to exit dashboard
        </button>
        <div className='rise glass-panel rounded-2xl p-8 sm:p-12 text-center'>
            <span aria-hidden='true' className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-[#E3EEF6] text-slate-500 ring-1 ring-inset ring-white'><Icon className="fa-solid fa-lock text-2xl" /></span>
            <h3 className='text-base font-semibold text-[var(--ink)] mb-1'>{title}</h3>
            {record ? (
                <>
                    <p className='text-sm text-slate-500'>This record is at stage: <span className='font-semibold'>{record.status}</span></p>
                    <button onClick={() => navigate(`/exit-process/records/${record._id}`)} className={`${primaryButton} mt-5 cursor-pointer`}>View record</button>
                </>
            ) : (
                <p className='text-sm text-slate-500'>This resignation record does not exist. Go back to the exit dashboard to open another one.</p>
            )}
        </div>
    </div>
)

export default Stage3ExitInterviewForm