import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage5, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

import Icon from '../../../Common/Icon'
import { primaryButton, secondaryButton } from '../../../Common/PageHeader'
// ---- File Upload Field ----
const FileUploadField = ({ label, file, onChange, onRemove, error, required = true }) => (
    <div>
        <label className='block text-xs font-medium text-slate-700 mb-1.5'>
            {label} {required && <span className='text-red-500'>*</span>}
        </label>

        {!file ? (
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${
                error
                    ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                    : 'border-slate-300 bg-white/50 hover:border-[#2b6485] hover:bg-[#f2f5f7]/70'
            }`}>
                <div aria-hidden='true' className='w-9 h-9 rounded-lg bg-gradient-to-br from-[#E3EEF6] to-[#CFE2F0] text-[var(--brand-600)] flex items-center justify-center shrink-0'>
                    <Icon className="fa-solid fa-cloud-arrow-up text-sm" />
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium text-slate-700'>Choose a file to upload PDF</p>
                    <p className='text-[10px] text-slate-400'>PDF only, up to 10 MB</p>
                </div>
                <input type='file' accept='application/pdf,.pdf' onChange={onChange} className='sr-only' />
            </label>
        ) : (
            <div className='flex items-center justify-between gap-3 px-3 py-2.5 border border-slate-200/80 rounded-xl bg-white/70'>
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200'>
                        <Icon className="fa-solid fa-file-pdf text-red-500 text-xs" />
                    </div>
                    <div className='min-w-0'>
                        <p className='text-xs font-medium text-slate-800 truncate'>{file.name}</p>
                        <p className='text-[10px] text-slate-500'>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                </div>
                <button type='button' onClick={onRemove}
                    aria-label='Remove file' className='press w-10 h-10 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                    <Icon className="fa-solid fa-xmark text-xs" />
                </button>
            </div>
        )}

        {error && (
            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-1'>
                <Icon className="fa-solid fa-circle-exclamation text-[10px]" />
                {error}
            </p>
        )}
    </div>
)

// ---- Yes/No Radio ----
const YesNoRadio = ({ label, name, value, onChange, error }) => (
    <div>
        <label className='block text-xs font-medium text-slate-700 mb-2'>
            {label} <span className='text-red-500'>*</span>
        </label>
        <div className='flex flex-col sm:flex-row gap-2'>
            {['Yes', 'No'].map((option) => (
                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl border cursor-pointer transition-colors ${
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

const Stage5FNFClearanceForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const record = useSelector(selectExitById(id))

    const [formData, setFormData] = useState({
        generateFNF: '',
        remarks: '',
        generateLetters: '',
        lastMonthPayslip: null,
        secondLastMonthPayslip: null,
        thirdLastMonthPayslip: null,
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(null)

    if (!record) return <LockScreen title='Record not found' navigate={navigate} />

    const validStatuses = ['No Due Cleared', 'No Due Pending']
    if (!validStatuses.includes(record.status) && !submitted) {
        return <LockScreen title='Stage 5 not available' record={record} navigate={navigate} />
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
        }
    }

    const handleFileChange = (field) => (e) => {
        const file = e.target.files?.[0] || null

        if (file) {
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                setErrors((prev) => ({ ...prev, [field]: 'Only PDF files are allowed' }))
                return
            }
            if (file.size > 10 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, [field]: 'File size must be under 10 MB' }))
                return
            }
        }

        setFormData((prev) => ({ ...prev, [field]: file }))
        if (errors[field]) {
            setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
        }
        e.target.value = ''
    }

    const removeFile = (field) => () => {
        setFormData((prev) => ({ ...prev, [field]: null }))
    }

    const validate = () => {
        const errs = {}
        if (!formData.generateFNF) errs.generateFNF = 'Please select Yes or No'

        if (formData.generateFNF === 'Yes') {
            if (!formData.remarks.trim()) errs.remarks = 'Remarks are required when generating F&F'
            if (!formData.generateLetters) errs.generateLetters = 'Please select Yes or No'
            if (!formData.lastMonthPayslip) errs.lastMonthPayslip = 'Last month payslip is required'
            if (!formData.secondLastMonthPayslip) errs.secondLastMonthPayslip = '2nd last month payslip is required'
            if (!formData.thirdLastMonthPayslip) errs.thirdLastMonthPayslip = '3rd last month payslip is required'
        }
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

        const isGenerating = formData.generateFNF === 'Yes'

        const payload = {
            generateFNF: formData.generateFNF,
            remarks: isGenerating ? formData.remarks : '',
            generateLetters: isGenerating ? formData.generateLetters : null,
            lastMonthPayslip: isGenerating && formData.lastMonthPayslip
                ? { name: formData.lastMonthPayslip.name, size: formData.lastMonthPayslip.size } : null,
            secondLastMonthPayslip: isGenerating && formData.secondLastMonthPayslip
                ? { name: formData.secondLastMonthPayslip.name, size: formData.secondLastMonthPayslip.size } : null,
            thirdLastMonthPayslip: isGenerating && formData.thirdLastMonthPayslip
                ? { name: formData.thirdLastMonthPayslip.name, size: formData.thirdLastMonthPayslip.size } : null,
        }

        dispatch(updateStage5({ _id: record._id, stage5: payload, status: 'Exited' }))
        setSubmitted(payload)
    }

    const handleCancel = () => navigate(`/exit-process/records/${record._id}`)
    const isYes = formData.generateFNF === 'Yes'

    // ---- SUCCESS SCREEN ----
    if (submitted) {
        return (
            <SuccessScreen
                title='Stage 5 submitted'
                subtitle='F&F clearance recorded and the employee is marked as exited'
                recordId={record._id}
            >
                <PreviewSection title='F&F decision' icon='fa-money-check-dollar'>
                    <PreviewRow label='Generate F&F' value={submitted.generateFNF} />
                    {submitted.generateFNF === 'Yes' && submitted.remarks && (
                        <PreviewRow label='Remarks' value={submitted.remarks} full />
                    )}
                </PreviewSection>

                {submitted.generateFNF === 'Yes' && (
                    <>
                        <PreviewSection title='Clearance steps' icon='fa-list-check'>
                            <PreviewRow label='Generate letters' value={submitted.generateLetters} />
                        </PreviewSection>

                        <PreviewSection title='Payslips attached' icon='fa-file-pdf'>
                            {submitted.lastMonthPayslip && (
                                <PreviewRow label='Last month payslip' value={`${submitted.lastMonthPayslip.name} (${(submitted.lastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
                            )}
                            {submitted.secondLastMonthPayslip && (
                                <PreviewRow label='2nd last month payslip' value={`${submitted.secondLastMonthPayslip.name} (${(submitted.secondLastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
                            )}
                            {submitted.thirdLastMonthPayslip && (
                                <PreviewRow label='3rd last month payslip' value={`${submitted.thirdLastMonthPayslip.name} (${(submitted.thirdLastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
                            )}
                        </PreviewSection>
                    </>
                )}
            </SuccessScreen>
        )
    }

    // ---- FORM ----
    return (
        <div className='w-full max-w-2xl mx-auto'>
            <button onClick={handleCancel} className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                <Icon className="fa-solid fa-arrow-left text-xs" />
                Back to record
            </button>

            <form onSubmit={handleSubmit} className='rise glass-strong rounded-2xl overflow-hidden'>

                <div className='flex items-center gap-3.5 px-5 py-4 border-b border-slate-200/70'>
                    <div aria-hidden='true' className='gradient-brand w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/20'>
                        <Icon className="fa-solid fa-money-check-dollar text-base" />
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-semibold leading-tight text-[var(--ink)] sm:text-[17px]'>Stage 5: F&F clearance</h2>
                        <p className='mt-0.5 text-[13px] text-slate-500'>Final clearance for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>

                    <YesNoRadio
                        label='Whether F&F is to be generated'
                        name='generateFNF'
                        value={formData.generateFNF}
                        onChange={handleChange}
                        error={errors.generateFNF}
                    />

                    {isYes && (
                        <>
                            <FormField
                                label='Remarks'
                                name='remarks'
                                value={formData.remarks}
                                onChange={handleChange}
                                required
                                error={errors.remarks}
                                textarea
                                placeholder='Add remarks about the F&F generation...'
                            />

                            {/* Divider */}
                            <div className='pt-2'>
                                <div className='flex items-center gap-3'>
                                    <div className='h-px flex-1 bg-slate-200'></div>
                                    <span className='text-xs font-semibold text-slate-500'>Clearance steps</span>
                                    <div className='h-px flex-1 bg-slate-200'></div>
                                </div>
                            </div>

                            <YesNoRadio
                                label='Whether experience and relieving letters are to be generated'
                                name='generateLetters'
                                value={formData.generateLetters}
                                onChange={handleChange}
                                error={errors.generateLetters}
                            />

                            <FileUploadField
                                label='Last month payslip'
                                file={formData.lastMonthPayslip}
                                onChange={handleFileChange('lastMonthPayslip')}
                                onRemove={removeFile('lastMonthPayslip')}
                                error={errors.lastMonthPayslip}
                            />

                            <FileUploadField
                                label='2nd last month salary'
                                file={formData.secondLastMonthPayslip}
                                onChange={handleFileChange('secondLastMonthPayslip')}
                                onRemove={removeFile('secondLastMonthPayslip')}
                                error={errors.secondLastMonthPayslip}
                            />

                            <FileUploadField
                                label='3rd last month salary'
                                file={formData.thirdLastMonthPayslip}
                                onChange={handleFileChange('thirdLastMonthPayslip')}
                                onRemove={removeFile('thirdLastMonthPayslip')}
                                error={errors.thirdLastMonthPayslip}
                            />
                        </>
                    )}

                    {formData.generateFNF === 'No' && (
                        <div className='flex items-start gap-2 bg-[#f2f5f7]/70 border border-[#cfdce5]/50 rounded-xl px-4 py-3'>
                            <Icon className="fa-solid fa-circle-info text-slate-400 text-xs mt-0.5" />
                            <p className='text-[11px] text-slate-600'>
                                Submitting this form will mark the employee as <strong>Exited</strong> and end the workflow.
                            </p>
                        </div>
                    )}

                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-5 py-4 border-t border-slate-200/70 bg-white/50'>
                    <button type='button' onClick={handleCancel}
                        className={`${secondaryButton} w-full sm:w-auto cursor-pointer`}>
                        Cancel
                    </button>
                    <button type='submit'
                        className={`${primaryButton} w-full sm:w-auto px-6 cursor-pointer`}>
                        Submit stage 5
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

export default Stage5FNFClearanceForm