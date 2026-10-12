import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage5, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

// ---- File Upload Field ----
const FileUploadField = ({ label, file, onChange, onRemove, error, required = true }) => (
    <div>
        <label className='block text-xs font-medium text-slate-700 mb-1.5'>
            {label} {required && <span className='text-red-500'>*</span>}
        </label>

        {!file ? (
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                error
                    ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                    : 'border-slate-300 hover:border-[#062139] hover:bg-slate-50'
            }`}>
                <div className='w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0'>
                    <i className="fa-solid fa-cloud-arrow-up text-slate-500 text-sm"></i>
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium text-slate-700'>Click to upload PDF</p>
                    <p className='text-[10px] text-slate-400'>PDF only · Max 10 MB</p>
                </div>
                <input type='file' accept='application/pdf,.pdf' onChange={onChange} className='hidden' />
            </label>
        ) : (
            <div className='flex items-center justify-between gap-3 px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50'>
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200'>
                        <i className="fa-solid fa-file-pdf text-red-500 text-xs"></i>
                    </div>
                    <div className='min-w-0'>
                        <p className='text-xs font-medium text-slate-800 truncate'>{file.name}</p>
                        <p className='text-[10px] text-slate-500'>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                </div>
                <button type='button' onClick={onRemove}
                    className='w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer shrink-0'>
                    <i className="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        )}

        {error && (
            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-1'>
                <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
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
                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${
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

    if (!record) return <LockScreen title='Record Not Found' navigate={navigate} />

    const validStatuses = ['No Due Cleared', 'No Due Pending']
    if (!validStatuses.includes(record.status) && !submitted) {
        return <LockScreen title='Stage 5 Not Available' record={record} navigate={navigate} />
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
                title='Stage 5 Submitted'
                subtitle='F&F Clearance recorded — employee marked as Exited'
                recordId={record._id}
            >
                <PreviewSection title='F&F Decision' icon='fa-money-check-dollar'>
                    <PreviewRow label='Generate F&F' value={submitted.generateFNF} />
                    {submitted.generateFNF === 'Yes' && submitted.remarks && (
                        <PreviewRow label='Remarks' value={submitted.remarks} full />
                    )}
                </PreviewSection>

                {submitted.generateFNF === 'Yes' && (
                    <>
                        <PreviewSection title='Clearance Steps' icon='fa-list-check'>
                            <PreviewRow label='Generate Letters' value={submitted.generateLetters} />
                        </PreviewSection>

                        <PreviewSection title='Payslips Attached' icon='fa-file-pdf'>
                            {submitted.lastMonthPayslip && (
                                <PreviewRow label='Last Month Payslip' value={`${submitted.lastMonthPayslip.name} (${(submitted.lastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
                            )}
                            {submitted.secondLastMonthPayslip && (
                                <PreviewRow label='2nd Last Month Payslip' value={`${submitted.secondLastMonthPayslip.name} (${(submitted.secondLastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
                            )}
                            {submitted.thirdLastMonthPayslip && (
                                <PreviewRow label='3rd Last Month Payslip' value={`${submitted.thirdLastMonthPayslip.name} (${(submitted.thirdLastMonthPayslip.size / 1024).toFixed(0)} KB)`} full />
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
            <button onClick={handleCancel} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
                <i className="fa-solid fa-arrow-left text-xs"></i>
                Back to Record
            </button>

            <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

                <div className='flex items-center gap-3 px-5 py-4 border-b border-slate-100'>
                    <div className='w-10 h-10 rounded-lg bg-[#062139] flex items-center justify-center shrink-0'>
                        <i className="fa-solid fa-money-check-dollar text-white text-sm"></i>
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-bold text-slate-800'>Stage 5 — F&F Clearance</h2>
                        <p className='text-[11px] text-slate-500'>Final clearance for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>

                    <YesNoRadio
                        label='Whether F&F to be Generated'
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
                                    <span className='text-[10px] uppercase font-bold text-slate-500 tracking-widest'>Clearance Steps</span>
                                    <div className='h-px flex-1 bg-slate-200'></div>
                                </div>
                            </div>

                            <YesNoRadio
                                label='Whether Experience Letter & Relieving Letter to Be Generated'
                                name='generateLetters'
                                value={formData.generateLetters}
                                onChange={handleChange}
                                error={errors.generateLetters}
                            />

                            <FileUploadField
                                label='Last Month Payslip'
                                file={formData.lastMonthPayslip}
                                onChange={handleFileChange('lastMonthPayslip')}
                                onRemove={removeFile('lastMonthPayslip')}
                                error={errors.lastMonthPayslip}
                            />

                            <FileUploadField
                                label='2nd Last Month Salary'
                                file={formData.secondLastMonthPayslip}
                                onChange={handleFileChange('secondLastMonthPayslip')}
                                onRemove={removeFile('secondLastMonthPayslip')}
                                error={errors.secondLastMonthPayslip}
                            />

                            <FileUploadField
                                label='3rd Last Month Salary'
                                file={formData.thirdLastMonthPayslip}
                                onChange={handleFileChange('thirdLastMonthPayslip')}
                                onRemove={removeFile('thirdLastMonthPayslip')}
                                error={errors.thirdLastMonthPayslip}
                            />
                        </>
                    )}

                    {formData.generateFNF === 'No' && (
                        <div className='flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3'>
                            <i className="fa-solid fa-circle-info text-slate-400 text-xs mt-0.5"></i>
                            <p className='text-[11px] text-slate-600'>
                                Submitting this form will mark the employee as <strong>Exited</strong> and end the workflow.
                            </p>
                        </div>
                    )}

                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50'>
                    <button type='button' onClick={handleCancel}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'>
                        Cancel
                    </button>
                    <button type='submit'
                        className='w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm hover:shadow-md cursor-pointer'>
                        Submit Stage 5
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

export default Stage5FNFClearanceForm