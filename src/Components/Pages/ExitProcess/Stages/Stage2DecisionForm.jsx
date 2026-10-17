import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage2, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

import Icon from '../../../Common/Icon'
import { primaryButton, secondaryButton } from '../../../Common/PageHeader'
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

    if (!record) return <LockScreen title='Record not found' navigate={navigate} />
    if (record.status !== 'HR Reviewing' && !submitted) {
        return <LockScreen title='Stage 2 not available' record={record} navigate={navigate} />
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
                title='Stage 2 submitted'
                subtitle='The decision on this resignation has been recorded'
                recordId={record._id}
            >
                <PreviewSection title='Decision details' icon='fa-gavel'>
                    <PreviewRow label='Send F&F' value={submitted.sendFNF} />
                    <PreviewRow label='Last working date' value={submitted.lastWorkingDate} />
                    <PreviewRow label='Date of F&F' value={submitted.dateOfFNF} />
                    <PreviewRow label='Feedback about the employee' value={submitted.feedbackAboutEmployee} full />
                </PreviewSection>
            </SuccessScreen>
        )
    }

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <button onClick={handleCancel} className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                <Icon className="fa-solid fa-arrow-left text-xs" />
                Back to record
            </button>

            <form onSubmit={handleSubmit} className='rise glass-strong rounded-2xl overflow-hidden'>

                <div className='flex items-center gap-3.5 px-5 py-4 border-b border-slate-200/70'>
                    <div aria-hidden='true' className='gradient-brand w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/20'>
                        <Icon className="fa-solid fa-gavel text-base" />
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-semibold leading-tight text-[var(--ink)] sm:text-[17px]'>Stage 2: Decision of resignation</h2>
                        <p className='mt-0.5 text-[13px] text-slate-500'>Final decision details for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>
                    <div>
                        <label className='block text-xs font-medium text-slate-700 mb-2'>
                            Whether to send F&F <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex flex-col sm:flex-row gap-2'>
                            {['Yes', 'No'].map((option) => (
                                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl border cursor-pointer transition-colors ${
                                    formData.sendFNF === option
                                        ? 'border-[#2b6485] bg-[#f2f5f7] ring-2 ring-[#2b6485]/20'
                                        : 'border-slate-200/80 bg-white/70 hover:border-[#cfdce5] hover:bg-white'
                                }`}>
                                    <input type='radio' name='sendFNF' value={option}
                                        checked={formData.sendFNF === option} onChange={handleChange}
                                        className='w-4 h-4 accent-[#1f4e6b]' />
                                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.sendFNF && (
                            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                                <Icon className="fa-solid fa-circle-exclamation text-[10px]" />
                                {errors.sendFNF}
                            </p>
                        )}
                    </div>

                    <FormField
                        label='Your feedback about the employee'
                        name='feedbackAboutEmployee'
                        value={formData.feedbackAboutEmployee}
                        onChange={handleChange}
                        required
                        error={errors.feedbackAboutEmployee}
                        textarea
                        placeholder='Share your observations about the employee...'
                    />

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <FormField label='Last working date' name='lastWorkingDate' type='date'
                            value={formData.lastWorkingDate} onChange={handleChange}
                            required error={errors.lastWorkingDate} />
                        <FormField label='Date of F&F' name='dateOfFNF' type='date'
                            value={formData.dateOfFNF} onChange={handleChange}
                            required error={errors.dateOfFNF} />
                    </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-5 py-4 border-t border-slate-200/70 bg-white/50'>
                    <button type='button' onClick={handleCancel}
                        className={`${secondaryButton} w-full sm:w-auto cursor-pointer`}>
                        Cancel
                    </button>
                    <button type='submit'
                        className={`${primaryButton} w-full sm:w-auto px-6 cursor-pointer`}>
                        Submit stage 2
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

export default Stage2DecisionForm