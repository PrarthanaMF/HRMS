import React from 'react'
import FormField from '../../../../Common/FormField'
import { DROPDOWN_OPTIONS, REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

const Step2Employment = ({ form, errors, onChange }) => {
    const isReq = (f) => REQUIRED_FIELDS.includes(f)

    return (
        <div>
            <h3 className='text-sm font-bold text-slate-800 mb-1'>Employment Information</h3>
            <p className='text-xs text-slate-500 mb-5'>Job role, reporting structure and joining details</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField label='Company' name='company' value={form.company} onChange={onChange} required={isReq('company')} error={errors.company} options={DROPDOWN_OPTIONS.company} />
                <FormField label='Branch' name='branch' value={form.branch} onChange={onChange} required={isReq('branch')} error={errors.branch} options={DROPDOWN_OPTIONS.branch} />
                <FormField label='Location' name='location' value={form.location} onChange={onChange} error={errors.location} options={DROPDOWN_OPTIONS.location} />
                <FormField label='Department' name='department' value={form.department} onChange={onChange} required={isReq('department')} error={errors.department} options={DROPDOWN_OPTIONS.department} />
                <FormField label='Division' name='division' value={form.division} onChange={onChange} error={errors.division} options={DROPDOWN_OPTIONS.division} />
                <FormField label='Designation' name='designation' value={form.designation} onChange={onChange} required={isReq('designation')} error={errors.designation} options={DROPDOWN_OPTIONS.designation} />
                <FormField label='Reporting Manager' name='reportingManager' value={form.reportingManager} onChange={onChange} error={errors.reportingManager} options={DROPDOWN_OPTIONS.reportingManager} />
                <FormField label='Division Head' name='divisionHead' value={form.divisionHead} onChange={onChange} error={errors.divisionHead} options={DROPDOWN_OPTIONS.divisionHead} />
                <FormField label='Application Approver' name='applicationApprover' value={form.applicationApprover} onChange={onChange} error={errors.applicationApprover} options={DROPDOWN_OPTIONS.applicationApprover} />
                <FormField label='Date of Joining' name='dateOfJoining' value={form.dateOfJoining} onChange={onChange} required={isReq('dateOfJoining')} error={errors.dateOfJoining} type='date' />
                <FormField label='Employee Type' name='employeeType' value={form.employeeType} onChange={onChange} required={isReq('employeeType')} error={errors.employeeType} options={DROPDOWN_OPTIONS.employeeType} />
            </div>
        </div>
    )
}

export default Step2Employment