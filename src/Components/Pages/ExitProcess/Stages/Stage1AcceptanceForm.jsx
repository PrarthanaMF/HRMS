import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage1, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

const Stage1AcceptanceForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const record = useSelector(selectExitById(id))

    const [formData, setFormData] = useState({
        employeeAcceptedWithdrawal: '',
        remarks: '',
        emailScreenshot: null,
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(null)

    if (!record) {
        return <LockScreen title='Record Not Found' navigate={navigate} />
    }

    if (record.status !== 'Pending HR' && !submitted) {
        return <LockScreen title='Stage 1 Already Completed' record={record} navigate={navigate} />
    }

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

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null
        if (file && file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, emailScreenshot: 'File size must be under 10 MB' }))
            return
        }
        setFormData((prev) => ({ ...prev, emailScreenshot: file }))
        if (errors.emailScreenshot) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next.emailScreenshot
                return next
            })
        }
    }

    const validate = () => {
        const errs = {}
        if (!formData.employeeAcceptedWithdrawal) errs.employeeAcceptedWithdrawal = 'Please select Yes or No'
        if (!formData.remarks || formData.remarks.trim() === '') errs.remarks = 'Remarks are required'
        if (formData.employeeAcceptedWithdrawal === 'Yes' && !formData.emailScreenshot) {
            errs.emailScreenshot = 'Email screenshot is required when withdrawal is accepted'
        }
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        const isAccepted = formData.employeeAcceptedWithdrawal === 'Yes'
        const nextStatus = isAccepted ? 'Withdrawn' : 'HR Reviewing'

        const payload = {
            employeeAcceptedWithdrawal: formData.employeeAcceptedWithdrawal,
            remarks: formData.remarks,
            emailScreenshot: formData.emailScreenshot
                ? { name: formData.emailScreenshot.name, size: formData.emailScreenshot.size }
                : null,
        }

        dispatch(updateStage1({ _id: record._id, stage1: payload, status: nextStatus }))
        setSubmitted({ ...payload, status: nextStatus })
    }

    const handleCancel = () => navigate(`/exit-process/records/${record._id}`)
    const isYes = formData.employeeAcceptedWithdrawal === 'Yes'

    // ---- SUCCESS SCREEN ----
    if (submitted) {
        return (
            <SuccessScreen
                title='Stage 1 Submitted'
                subtitle={submitted.status === 'Withdrawn'
                    ? 'The workflow has ended — employee accepted withdrawal'
                    : 'The resignation will now proceed to the Decision stage'}
                recordId={record._id}
            >
                <PreviewSection title='Submission Details' icon='fa-check-circle'>
                    <PreviewRow label='Employee Accepted Withdrawal' value={submitted.employeeAcceptedWithdrawal} />
                    {submitted.emailScreenshot && (
                        <PreviewRow label='Email Screenshot' value={`${submitted.emailScreenshot.name} (${(submitted.emailScreenshot.size / 1024).toFixed(0)} KB)`} />
                    )}
                    <PreviewRow label='Remarks' value={submitted.remarks} full />
                </PreviewSection>
            </SuccessScreen>
        )
    }

    // ---- FORM ----
    return (
        <div className='w-full max-w-2xl mx-auto'>
            <button onClick={handleCancel} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
                <i className="fa-solid fa-arrow-left text-xs"></i>
                Back to Record
            </button>

            <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

                <div className='flex items-center gap-3 px-5 py-4 border-b border-slate-100'>
                    <div className='w-10 h-10 rounded-lg bg-[#062139] flex items-center justify-center shrink-0'>
                        <i className="fa-solid fa-check-circle text-white text-sm"></i>
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-bold text-slate-800'>Stage 1 — HR Acceptance</h2>
                        <p className='text-[11px] text-slate-500'>Employee Acceptance of Withdrawal for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>

                    <div>
                        <label className='block text-xs font-medium text-slate-700 mb-2'>
                            Employee Accepted Withdrawal <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex flex-col sm:flex-row gap-2'>
                            {['Yes', 'No'].map((option) => (
                                <label
                                    key={option}
                                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${
                                        formData.employeeAcceptedWithdrawal === option
                                            ? 'border-[#062139] bg-slate-50 ring-2 ring-slate-100'
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type='radio'
                                        name='employeeAcceptedWithdrawal'
                                        value={option}
                                        checked={formData.employeeAcceptedWithdrawal === option}
                                        onChange={handleChange}
                                        className='w-4 h-4 accent-[#062139]'
                                    />
                                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.employeeAcceptedWithdrawal && (
                            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                                {errors.employeeAcceptedWithdrawal}
                            </p>
                        )}

                        {isYes && (
                            <p className='text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 flex items-start gap-2'>
                                <i className="fa-solid fa-circle-info text-[10px] mt-0.5"></i>
                                If <strong>Yes</strong> is selected, the workflow ends here after submission. You must attach the email screenshot as proof.
                            </p>
                        )}
                    </div>

                    <FormField
                        label='Remarks'
                        name='remarks'
                        value={formData.remarks}
                        onChange={handleChange}
                        required
                        error={errors.remarks}
                        textarea
                        placeholder='Provide context or notes about this decision...'
                    />

                    {isYes && (
                        <div>
                            <label className='block text-xs font-medium text-slate-700 mb-1.5'>
                                Email Screenshot <span className='text-red-500'>*</span>
                            </label>

                            {!formData.emailScreenshot ? (
                                <label className={`flex flex-col items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
                                    errors.emailScreenshot
                                        ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                                        : 'border-slate-300 hover:border-[#062139] hover:bg-slate-50'
                                }`}>
                                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
                                    <p className='text-sm font-medium text-slate-700'>Click to upload</p>
                                    <p className='text-[10px] text-slate-400'>PNG, JPG, or PDF · Max 10 MB</p>
                                    <input type='file' accept='image/*,.pdf' onChange={handleFileChange} className='hidden' />
                                </label>
                            ) : (
                                <div className='flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50'>
                                    <div className='flex items-center gap-3 min-w-0'>
                                        <div className='w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200'>
                                            <i className="fa-solid fa-file-lines text-slate-500 text-xs"></i>
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-xs font-medium text-slate-800 truncate'>{formData.emailScreenshot.name}</p>
                                            <p className='text-[10px] text-slate-500'>{(formData.emailScreenshot.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => setFormData((prev) => ({ ...prev, emailScreenshot: null }))}
                                        className='w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer shrink-0'
                                    >
                                        <i className="fa-solid fa-xmark text-xs"></i>
                                    </button>
                                </div>
                            )}

                            {errors.emailScreenshot && (
                                <p className='text-[11px] text-red-600 flex items-center gap-1 mt-1'>
                                    <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                                    {errors.emailScreenshot}
                                </p>
                            )}
                        </div>
                    )}

                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50'>
                    <button
                        type='button'
                        onClick={handleCancel}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        className='w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm hover:shadow-md cursor-pointer'
                    >
                        Submit Stage 1
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

export default Stage1AcceptanceForm