import React from 'react'
import FormField from '../../../../Common/FormField'
import { DROPDOWN_OPTIONS, REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

// Suggested values plus whatever is already in use (from the backend), without duplicates
const merged = (defaults = [], inUse = []) => [...new Set([...defaults, ...inUse])]

const Step2Employment = ({ form, errors, onChange, requiredFields = REQUIRED_FIELDS, options }) => {
    const isReq = (f) => requiredFields.includes(f)
    const values = options?.values || {}

    return (
        <div className='space-y-4'>
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Employment information</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Job role, reporting structure and joining details</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Company' name='company' value={form.company} onChange={onChange} required={isReq('company')} error={errors.company} options={merged(DROPDOWN_OPTIONS.company, values.company)} />
                    <FormField label='Branch' name='branchId' value={form.branchId} onChange={onChange} required={isReq('branchId')} error={errors.branchId} options={options?.branches || []} />
                    <FormField label='Location' name='location' value={form.location} onChange={onChange} error={errors.location} options={merged(DROPDOWN_OPTIONS.location, values.location)} />
                    <FormField label='Department' name='department' value={form.department} onChange={onChange} required={isReq('department')} error={errors.department} options={merged(DROPDOWN_OPTIONS.department, values.department)} />
                    <FormField label='Division' name='division' value={form.division} onChange={onChange} error={errors.division} options={merged(DROPDOWN_OPTIONS.division, values.division)} />
                    <FormField label='Designation' name='designation' value={form.designation} onChange={onChange} required={isReq('designation')} error={errors.designation} options={merged(DROPDOWN_OPTIONS.designation, values.designation)} />
                    <FormField label='Reporting Manager' name='reportingManagerId' value={form.reportingManagerId} onChange={onChange} error={errors.reportingManagerId} options={(options?.managers || []).filter((manager) => manager.value !== form._id)} />
                    <FormField label='Date of Joining' name='dateOfJoining' value={form.dateOfJoining} onChange={onChange} required={isReq('dateOfJoining')} error={errors.dateOfJoining} type='date' />
                    <FormField label='Employee Type' name='employeeType' value={form.employeeType} onChange={onChange} required={isReq('employeeType')} error={errors.employeeType} options={DROPDOWN_OPTIONS.employeeType} />
                    <FormField label='Employment Status' name='employmentStatus' value={form.employmentStatus} onChange={onChange} error={errors.employmentStatus} options={DROPDOWN_OPTIONS.employmentStatus} />
                </div>
            </div>

            {/* What attendance needs to work out each day */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Attendance set-up</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Biometric code, shift and week offs used to calculate attendance</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Biometric Code' name='biometricCode' value={form.biometricCode} onChange={onChange} error={errors.biometricCode} placeholder='Code on the attendance device, e.g. 1004' />
                    <FormField label='Category' name='category' value={form.category} onChange={onChange} error={errors.category} options={merged([], values.category)} />
                    <FormField label='Shift Start' name='shiftStart' value={form.shiftStart} onChange={onChange} error={errors.shiftStart} type='time' />
                    <FormField label='Shift End' name='shiftEnd' value={form.shiftEnd} onChange={onChange} error={errors.shiftEnd} type='time' />
                    <FormField label='Week-off Policy' name='weekOffPolicyId' value={form.weekOffPolicyId} onChange={onChange} error={errors.weekOffPolicyId} options={options?.weekOffPolicies || []} />
                </div>
            </div>
        </div>
    )
}

export default Step2Employment
