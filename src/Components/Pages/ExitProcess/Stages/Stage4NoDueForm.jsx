import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateStage4, selectExitById } from '../../../../Store/Redux/ExitProcess/ExitSlice'
import FormField from '../../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../../Common/SuccessScreen'

import Icon from '../../../Common/Icon'
import { primaryButton, secondaryButton } from '../../../Common/PageHeader'
const Stage4NoDueForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const record = useSelector(selectExitById(id))

    const [formData, setFormData] = useState({
        noDueFormAttachments: [],
        dueStatus: '',
        noDueRemarks: '',
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(null)

    if (!record) return <LockScreen title='Record not found' navigate={navigate} />
    if (record.status !== 'F&F Pending' && !submitted) {
        return <LockScreen title='Stage 4 not available' record={record} navigate={navigate} />
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
        }
    }

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || [])
        const existing = formData.noDueFormAttachments
        const room = 5 - existing.length
        const toAdd = files.slice(0, room)

        const oversized = toAdd.filter((f) => f.size > 10 * 1024 * 1024)
        if (oversized.length > 0) {
            setErrors((prev) => ({
                ...prev,
                noDueFormAttachments: `File(s) too large: ${oversized.map(f => f.name).join(', ')} — Max 10 MB each`,
            }))
            return
        }

        setFormData((prev) => ({
            ...prev,
            noDueFormAttachments: [...prev.noDueFormAttachments, ...toAdd],
        }))
        if (errors.noDueFormAttachments) {
            setErrors((prev) => { const n = { ...prev }; delete n.noDueFormAttachments; return n })
        }
        e.target.value = ''
    }

    const removeFile = (index) => {
        setFormData((prev) => ({
            ...prev,
            noDueFormAttachments: prev.noDueFormAttachments.filter((_, i) => i !== index),
        }))
    }

    const validate = () => {
        const errs = {}
        if (formData.noDueFormAttachments.length === 0) {
            errs.noDueFormAttachments = 'At least one No Due Form attachment is required'
        }
        if (!formData.dueStatus) errs.dueStatus = 'Please select the status of due'
        if (!formData.noDueRemarks.trim()) errs.noDueRemarks = 'Remarks are required'
        else if (formData.noDueRemarks.trim().length < 5) errs.noDueRemarks = 'Please provide at least 5 characters'
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        const nextStatus = formData.dueStatus === 'All due Cleared' ? 'No Due Cleared' : 'No Due Pending'

        const payload = {
            noDueFormAttachments: formData.noDueFormAttachments.map((f) => ({
                name: f.name,
                size: f.size,
            })),
            dueStatus: formData.dueStatus,
            noDueRemarks: formData.noDueRemarks,
        }

        dispatch(updateStage4({ _id: record._id, stage4: payload, status: nextStatus }))
        setSubmitted({ ...payload, status: nextStatus })
    }

    const handleCancel = () => navigate(`/exit-process/records/${record._id}`)

    // ---- SUCCESS SCREEN ----
    if (submitted) {
        return (
            <SuccessScreen
                title='Stage 4 submitted'
                subtitle={`No due clearance recorded. Status is now ${submitted.status}.`}
                recordId={record._id}
            >
                <PreviewSection title='Clearance details' icon='fa-clipboard-check'>
                    <PreviewRow label='Due status' value={submitted.dueStatus} />
                    <PreviewRow label='Number of attachments' value={`${submitted.noDueFormAttachments.length} file(s)`} />
                    <PreviewRow label='Remarks' value={submitted.noDueRemarks} full />
                </PreviewSection>

                {submitted.noDueFormAttachments.length > 0 && (
                    <PreviewSection title='Attached files' icon='fa-paperclip'>
                        {submitted.noDueFormAttachments.map((file, i) => (
                            <PreviewRow
                                key={i}
                                label={`File ${i + 1}`}
                                value={`${file.name} (${(file.size / 1024).toFixed(0)} KB)`}
                                full
                            />
                        ))}
                    </PreviewSection>
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
                        <Icon className="fa-solid fa-clipboard-check text-base" />
                    </div>
                    <div className='min-w-0'>
                        <h2 className='text-base font-semibold leading-tight text-[var(--ink)] sm:text-[17px]'>Stage 4: No due clearance</h2>
                        <p className='mt-0.5 text-[13px] text-slate-500'>Clearance for {record.name}</p>
                    </div>
                </div>

                <div className='p-5 space-y-5'>

                    {/* Attachments */}
                    <div>
                        <label className='block text-xs font-medium text-slate-700 mb-2'>
                            No due form attachments <span className='text-red-500'>*</span>
                        </label>

                        {formData.noDueFormAttachments.length > 0 && (
                            <div className='space-y-2 mb-3'>
                                {formData.noDueFormAttachments.map((file, i) => (
                                    <div key={i} className='flex items-center justify-between gap-3 px-3 py-2.5 border border-slate-200/80 rounded-xl bg-white/70'>
                                        <div className='flex items-center gap-3 min-w-0'>
                                            <div className='w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200'>
                                                <Icon className="fa-solid fa-file-lines text-slate-500 text-xs" />
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-xs font-medium text-slate-800 truncate'>{file.name}</p>
                                                <p className='text-[10px] text-slate-500'>{(file.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                        </div>
                                        <button type='button' onClick={() => removeFile(i)}
                                            aria-label='Remove file' className='press w-10 h-10 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                                            <Icon className="fa-solid fa-xmark text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.noDueFormAttachments.length < 5 && (
                            <label className={`flex flex-col items-center justify-center gap-2 w-full px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${
                                errors.noDueFormAttachments
                                    ? 'border-red-300 bg-red-50/40 hover:bg-red-50'
                                    : 'border-slate-300 bg-white/50 hover:border-[#2b6485] hover:bg-[#f2f5f7]/70'
                            }`}>
                                <Icon className="fa-solid fa-cloud-arrow-up text-xl text-slate-400" />
                                <p className='text-sm font-medium text-slate-700'>
                                    Choose a file to upload {formData.noDueFormAttachments.length > 0 ? 'more' : ''}
                                </p>
                                <p className='text-[10px] text-slate-400'>
                                    Up to {5 - formData.noDueFormAttachments.length} more files. PDF, PNG or JPG, up to 10 MB each
                                </p>
                                <input type='file' multiple accept='image/*,.pdf' onChange={handleFiles} className='sr-only' />
                            </label>
                        )}

                        {formData.noDueFormAttachments.length > 0 && (
                            <p className='text-[10px] text-slate-400 mt-2'>
                                {formData.noDueFormAttachments.length} of 5 file(s) attached
                            </p>
                        )}

                        {errors.noDueFormAttachments && (
                            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-1'>
                                <Icon className="fa-solid fa-circle-exclamation text-[10px]" />
                                {errors.noDueFormAttachments}
                            </p>
                        )}
                    </div>

                    {/* Status of Due */}
                    <div>
                        <label className='block text-xs font-medium text-slate-700 mb-2'>
                            Status of dues <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex flex-col sm:flex-row gap-2'>
                            {['All due Cleared', 'Pending'].map((option) => (
                                <label key={option} className={`flex-1 flex items-center gap-3 px-4 py-3 min-h-11 rounded-xl border cursor-pointer transition-colors ${
                                    formData.dueStatus === option
                                        ? 'border-[#2b6485] bg-[#f2f5f7] ring-2 ring-[#2b6485]/20'
                                        : 'border-slate-200/80 bg-white/70 hover:border-[#cfdce5] hover:bg-white'
                                }`}>
                                    <input type='radio' name='dueStatus' value={option}
                                        checked={formData.dueStatus === option} onChange={handleChange}
                                        className='w-4 h-4 accent-[#1f4e6b]' />
                                    <span className='text-sm font-medium text-slate-700'>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.dueStatus && (
                            <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                                <Icon className="fa-solid fa-circle-exclamation text-[10px]" />
                                {errors.dueStatus}
                            </p>
                        )}
                    </div>

                    {/* Remarks */}
                    <FormField
                        label='No due remarks'
                        name='noDueRemarks'
                        value={formData.noDueRemarks}
                        onChange={handleChange}
                        required
                        error={errors.noDueRemarks}
                        textarea
                        placeholder='Add any clearance notes or pending items...'
                    />

                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-5 py-4 border-t border-slate-200/70 bg-white/50'>
                    <button type='button' onClick={handleCancel}
                        className={`${secondaryButton} w-full sm:w-auto cursor-pointer`}>
                        Cancel
                    </button>
                    <button type='submit'
                        className={`${primaryButton} w-full sm:w-auto px-6 cursor-pointer`}>
                        Submit stage 4
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

export default Stage4NoDueForm