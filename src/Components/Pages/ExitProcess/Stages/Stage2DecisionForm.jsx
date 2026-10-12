import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage2, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

const Stage2DecisionForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const record = useSelector(selectExitById(id))

    const [formData, setFormData] = useState({
        sendFNF: '',
        feedbackAboutEmployee: '',
        lastWorkingDate: '',
        dateOfFNF: '',
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(null)

    if (!record) return <LockScreen title='Record Not Found' navigate={navigate} />
    if (record.status !== 'HR Reviewing' && !submitted) {
        return <LockScreen title='Stage 2 Not Available' record={record} navigate={navigate} />
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

    const validate = () => {
        const errs = {}
        if (!formData.sendFNF) errs.sendFNF = 'Please select Yes or No'
        if (!formData.feedbackAboutEmployee.trim()) errs.feedbackAboutEmployee = 'Feedback about employee is required'
        else if (formData.feedbackAboutEmployee.trim().length < 10) errs.feedbackAboutEmployee = 'Please provide at least 10 characters'
        if (!formData.lastWorkingDate) errs.lastWorkingDate = 'Last working date is required'
        if (!formData.dateOfFNF) errs.dateOfFNF = 'Date of F&F is required'
        else if (formData.lastWorkingDate && formData.dateOfFNF < formData.lastWorkingDate) {
            errs.dateOfFNF = 'Date of F&F cannot be before Last Working Date'
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

        const payload = {
            sendFNF: formData.sendFNF,
            feedbackAboutEmployee: formData.feedbackAboutEmployee,
            lastWorkingDate: formData.lastWorkingDate,
            dateOfFNF: formData.dateOfFNF,
        }

        dispatch(updateStage2({ _id: record._id, stage2: payload, status: 'F&F Initiated' }))
        setSubmitted(payload)
    }

    const handleCancel = () => navigate(`/exit-process/records/${record._id}`)

    if (submitted) {
        return (
            <SuccessScreen
                title='Stage 2 Submitted'
                subtitle='Decision of Resignation has been recorded'
                recordId={record._id}
            >
                <PreviewSection title='Decision Details' icon='fa-gavel'>
                    <PreviewRow label='Send F&F' value={submitted.sendFNF} />
                    <PreviewRow label='Last Working Date' value={submitted.lastWorkingDate} />
                    <PreviewRow label='Date of F&F' value={submitted.dateOfFNF} />
                    <PreviewRow label='Feedback About Employee' value={submitted.feedbackAboutEmployee} full />
                </PreviewSection>
            </SuccessScreen>
        )
    }

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <button onClick={handleCancel} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
                <i className="fa-solid fa-arrow-left text-xs"></i>
                Back to Record
            </button>

            <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

                <div className='flex items-center gap-3 px-5 py-4 border-b border-slate-100'>
                    <div className='w-10 h-10 rounded-lg bg-[#062139] flex items-center justify-center shrink-0'>
                        <i className="fa-solid fa-gavel text-white text-sm"></i>
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-bold text-slate-800'>Stage 2 — Decision of Resignation</h2>
                        <p className='text-[11px] text-slate-500'>Final decision details for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>
                    <div>
                        <label className='block text-xs font-medium text-slate-700 mb-2'>
                            Whether to Send F&F <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex flex-col sm:flex-row gap-2'>
                            {['Yes', 'No'].map((option) => (
                                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${
                                    formData.sendFNF === option
                                        ? 'border-[#062139] bg-slate-50 ring-2 ring-slate-100'
                                        : 'border-slate-200 hover:bg-slate-50'
                                }`}>
                                    <input type='radio' name='sendFNF' value={option}
                                        checked={formData.sendFNF === option} onChange={handleChange}
                                        className='w-4 h-4 accent-[#062139]' />
                                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.sendFNF && (
                            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                                {errors.sendFNF}
                            </p>
                        )}
                    </div>

                    <FormField
                        label='Your Feedback About Employee'
                        name='feedbackAboutEmployee'
                        value={formData.feedbackAboutEmployee}
                        onChange={handleChange}
                        required
                        error={errors.feedbackAboutEmployee}
                        textarea
                        placeholder='Share your observations about the employee...'
                    />

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <FormField label='Last Working Date' name='lastWorkingDate' type='date'
                            value={formData.lastWorkingDate} onChange={handleChange}
                            required error={errors.lastWorkingDate} />
                        <FormField label='Date of F&F' name='dateOfFNF' type='date'
                            value={formData.dateOfFNF} onChange={handleChange}
                            required error={errors.dateOfFNF} />
                    </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50'>
                    <button type='button' onClick={handleCancel}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'>
                        Cancel
                    </button>
                    <button type='submit'
                        className='w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm hover:shadow-md cursor-pointer'>
                        Submit Stage 2
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

export default Stage2DecisionForm