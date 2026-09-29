import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage3, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection, RatingPreview } from '../../../Common/SuccessScreen'
import RatingRow from '../../../Common/RatingRow'

const FormSection = ({ title, subtitle, icon, children }) => (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-5 md:p-6'>
        <div className='flex items-center gap-3 mb-5 pb-3 border-b border-slate-100'>
            <div className='w-9 h-9 rounded-lg bg-[#062139] flex items-center justify-center shrink-0'>
                <i className={`fa-solid ${icon} text-white text-sm`}></i>
            </div>
            <div className='min-w-0'>
                <h3 className='text-sm font-bold text-slate-800'>{title}</h3>
                {subtitle && <p className='text-[11px] text-slate-500'>{subtitle}</p>}
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
                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
                    value === option
                        ? 'border-[#062139] bg-slate-50 ring-2 ring-slate-100'
                        : 'border-slate-200 hover:bg-slate-50'
                }`}>
                    <input type='radio' name={name} value={option}
                        checked={value === option} onChange={onChange}
                        className='w-4 h-4 accent-[#062139]' />
                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                </label>
            ))}
        </div>
        {error && (
            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
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

    if (!record) return <LockScreen title='Record Not Found' navigate={navigate} />
    if (record.status !== 'F&F Initiated' && !submitted) {
        return <LockScreen title='Stage 3 Not Available' record={record} navigate={navigate} />
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
                title='Stage 3 Submitted'
                subtitle='Exit interview feedback has been recorded'
                recordId={record._id}
            >
                <PreviewSection title='Open Questions' icon='fa-comment'>
                    <PreviewRow label='What prevented departure?' value={submitted.preventDepartureAnswer} full />
                    <PreviewRow label='Liked Most' value={submitted.likedMost} full />
                    <PreviewRow label='Liked Least' value={submitted.likedLeast} full />
                    <PreviewRow label='Duties Met Expectations' value={submitted.dutiesMetExpectations} />
                    <PreviewRow label='New Company Attraction' value={submitted.newCompanyAttraction} full />
                    <PreviewRow label='Suggestions' value={submitted.suggestions} full />
                    {submitted.remarks && <PreviewRow label='Remarks' value={submitted.remarks} full />}
                    <PreviewRow label='Removed from WhatsApp' value={submitted.removedFromWhatsappGroup} />
                </PreviewSection>

                <PreviewSection title='Reporting Manager Ratings' icon='fa-user-tie'>
                    {rmRatingFields.map((f) => (
                        <RatingPreview key={f.key} label={f.label} value={submitted.reportingManagerRatings[f.key]} />
                    ))}
                </PreviewSection>

                <PreviewSection title='Company Ratings' icon='fa-building'>
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
            <button onClick={handleCancel} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
                <i className="fa-solid fa-arrow-left text-xs"></i>
                Back to Record
            </button>

            <form onSubmit={handleSubmit} className='space-y-4'>

                <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
                    <div className='flex items-center gap-3 px-5 py-4 border-b border-slate-100'>
                        <div className='w-10 h-10 rounded-lg bg-[#062139] flex items-center justify-center shrink-0'>
                            <i className="fa-solid fa-comment-dots text-white text-sm"></i>
                        </div>
                        <div className='min-w-0'>
                            <h2 className='text-base font-bold text-slate-800'>Stage 3 — Exit Interview Feedback</h2>
                            <p className='text-[11px] text-slate-500'>Exit interview for {record.name}</p>
                        </div>
                    </div>
                    <div className='px-5 py-3 bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2'>
                        <i className="fa-solid fa-circle-info text-slate-400 text-[10px] mt-0.5"></i>
                        <span>Ratings use a <strong>1–5 scale</strong>: Very Poor · Poor · Average · Good · Excellent</span>
                    </div>
                </div>

                <FormSection title='Open Questions' subtitle='General feedback about the employee experience' icon='fa-comment'>
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

                <FormSection title='Rate Your Reporting Manager'
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

                <FormSection title='Rate Our Company'
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

                <FormSection title='Final Questions' subtitle='A few last questions before you go' icon='fa-clipboard-list'>
                    <div className='space-y-4'>
                        <FormField label='What is more attractive about the new company you are joining?' name='newCompanyAttraction'
                            value={formData.newCompanyAttraction} onChange={handleChange}
                            required error={errors.newCompanyAttraction} textarea />
                        <FormField label='What suggestions do you have to make Marutiflex a better place to work?' name='suggestions'
                            value={formData.suggestions} onChange={handleChange}
                            required error={errors.suggestions} textarea />
                        <FormField label='Remarks (Do you have anything else to tell us?)' name='remarks'
                            value={formData.remarks} onChange={handleChange} textarea />

                        <YesNoRadio label='Whether removed from All official WhatsApp Group?'
                            name='removedFromWhatsappGroup'
                            value={formData.removedFromWhatsappGroup}
                            onChange={handleChange}
                            error={errors.removedFromWhatsappGroup} />
                    </div>
                </FormSection>

                <div className='bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4'>
                    <button type='button' onClick={handleCancel}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'>
                        Cancel
                    </button>
                    <button type='submit'
                        className='w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm hover:shadow-md cursor-pointer'>
                        Submit Stage 3
                    </button>
                </div>

            </form>
        </div>
    )
}

const LockScreen = ({ title, record, navigate }) => (
    <div className='w-full max-w-2xl mx-auto'>
        <button onClick={() => navigate('/exit-process')} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
            <i className="fa-solid fa-arrow-left text-xs"></i>
            Back to Exit Dashboard
        </button>
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
            <i className="fa-solid fa-lock text-4xl text-slate-300 mb-3"></i>
            <h3 className='text-base font-bold text-slate-700 mb-1'>{title}</h3>
            {record ? (
                <>
                    <p className='text-sm text-slate-500'>This record is at stage: <span className='font-semibold'>{record.status}</span></p>
                    <button onClick={() => navigate(`/exit-process/records/${record._id}`)} className='mt-4 px-5 py-2.5 text-sm font-medium text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition cursor-pointer'>View Record</button>
                </>
            ) : (
                <p className='text-sm text-slate-500'>This resignation record does not exist.</p>
            )}
        </div>
    </div>
)

export default Stage3ExitInterviewForm