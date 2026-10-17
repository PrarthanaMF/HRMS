import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addExit, selectAllExits } from '../../../Store/Redux/ExitProcess/ExitSlice'
import { MOCK_USERS } from '../../../Utils/mockUsers'
import { validateResignationForm } from '../../../Utils/validation'
import FormField from '../../Common/FormField'
import SuccessScreen, { PreviewRow, PreviewSection } from '../../Common/SuccessScreen'

import Icon from '../../Common/Icon'
import { primaryButton, secondaryButton } from '../../Common/PageHeader'
const ResignationFormView = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const exits = useSelector(selectAllExits)

    const [formData, setFormData] = useState({
        empId: '',
        lastWorkingDate: '',
        reasonForResignation: '',
    })
    const [errors, setErrors] = useState({})
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [submitted, setSubmitted] = useState(null)   // null or the submitted payload

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

        if (name === 'empId') {
            const found = MOCK_USERS[value.trim()]
            setSelectedEmployee(found || null)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const errs = validateResignationForm(formData, exits, MOCK_USERS)
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        const employee = MOCK_USERS[formData.empId.trim()]

        const payload = {
            empId: employee.empId,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            branch: employee.branches?.[0] || '',
            location: employee.location || '',
            department: employee.department,
            division: employee.division || '',
            designation: employee.designation,
            reportingManager: employee.reportingManager || '',
            reportingManagerContact: employee.reportingManagerContact || '',
            divisionHead: employee.divisionHead || '',
            divisionHeadContact: employee.divisionHeadContact || '',
            resignationDate: new Date().toISOString().split('T')[0],
            lastWorkingDate: formData.lastWorkingDate,
            reason: formData.reasonForResignation,
            noticePeriod: '30 days',
            removalType: 'Resigned',
            status: 'Pending HR',
            stage1: null,
            stage2: null,
            stage3: null,
            stage4: null,
            stage5: null,
        }

        dispatch(addExit(payload))

        // Show success screen with a temporary ID (the real _id is generated in the slice)
        setSubmitted({
            ...payload,
            _id: 'pending',   // we don't have the real _id here
        })
    }

    const handleCancel = () => navigate('/exit-process')

    // ---- SUCCESS SCREEN ----
    if (submitted) {
        return (
            <SuccessScreen
                title='Resignation submitted'
                subtitle='The resignation has been recorded and is now pending HR review'
                recordId={submitted._id}
            >
                <PreviewSection title='Employee details' icon='fa-user'>
                    <PreviewRow label='Employee ID' value={submitted.empId} />
                    <PreviewRow label='Name' value={submitted.name} />
                    <PreviewRow label='Email' value={submitted.email} />
                    <PreviewRow label='Department' value={submitted.department} />
                    <PreviewRow label='Designation' value={submitted.designation} />
                    <PreviewRow label='Branch' value={submitted.branch} />
                </PreviewSection>

                <PreviewSection title='Resignation details' icon='fa-file-signature'>
                    <PreviewRow label='Resignation date' value={submitted.resignationDate} />
                    <PreviewRow label='Expected last working date' value={submitted.lastWorkingDate} />
                    <PreviewRow label='Notice period' value={submitted.noticePeriod} />
                    <PreviewRow label='Reason for resignation' value={submitted.reason} full />
                </PreviewSection>
            </SuccessScreen>
        )
    }

    // ---- FORM ----
    return (
        <div className='w-full max-w-xl mx-auto'>
            <form onSubmit={handleSubmit} className='rise glass-strong rounded-2xl overflow-hidden'>

                {/* Header */}
                <div className='flex items-center gap-3.5 px-5 py-4 border-b border-slate-200/70'>
                    <button
                        type='button'
                        onClick={handleCancel}
                        className='press w-10 h-10 rounded-xl hover:bg-white/80 hover:text-[var(--ink)] flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                        title='Back to exit process'
                        aria-label='Back to exit process'
                    >
                        <Icon className="fa-solid fa-arrow-left text-sm" />
                    </button>

                    <div aria-hidden='true' className='gradient-brand w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/20'>
                        <Icon className="fa-solid fa-file-signature text-base" />
                    </div>

                    <div className='min-w-0'>
                        <h2 className='text-base font-semibold leading-tight text-[var(--ink)] sm:text-[17px]'>Resignation form</h2>
                        <p className='mt-0.5 text-[13px] text-slate-500'>Submit a new resignation request</p>
                    </div>
                </div>

                {/* Body */}
                <div className='p-5 space-y-4'>

                    <div>
                        <FormField
                            label='Employee ID'
                            name='empId'
                            value={formData.empId}
                            onChange={handleChange}
                            required
                            error={errors.empId}
                            placeholder='e.g. 1008'
                        />
                        {selectedEmployee && !errors.empId && (
                            <div className='mt-2.5 flex items-center gap-2.5 bg-[#f2f5f7]/70 rounded-xl px-3 py-2 border border-[#cfdce5]/50'>
                                <div aria-hidden='true' className='gradient-brand w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold text-white shrink-0'>
                                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <p className='text-xs font-semibold text-slate-800 truncate'>{selectedEmployee.name}</p>
                                    <p className='text-[11px] text-slate-500 truncate'>
                                        {selectedEmployee.designation}, {selectedEmployee.department}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <FormField
                        label='Expected relieving date'
                        name='lastWorkingDate'
                        type='date'
                        value={formData.lastWorkingDate}
                        onChange={handleChange}
                        required
                        error={errors.lastWorkingDate}
                    />

                    <FormField
                        label='Reason for resignation'
                        name='reasonForResignation'
                        value={formData.reasonForResignation}
                        onChange={handleChange}
                        required
                        error={errors.reasonForResignation}
                        textarea
                        placeholder='Please provide a brief reason for the resignation...'
                    />

                </div>

                {/* Footer */}
                <div className='flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-5 py-4 border-t border-slate-200/70 bg-white/50'>
                    <button
                        type='button'
                        onClick={handleCancel}
                        className={`${secondaryButton} w-full sm:w-auto cursor-pointer`}
                    >
                        Cancel
                    </button>

                    <button
                        type='submit'
                        className={`${primaryButton} w-full sm:w-auto px-6 cursor-pointer`}
                    >
                        Submit resignation
                    </button>
                </div>

            </form>
        </div>
    )
}

export default ResignationFormView