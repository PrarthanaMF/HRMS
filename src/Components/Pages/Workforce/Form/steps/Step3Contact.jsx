import React from 'react'
import FormField from '../../../../Common/FormField'
import { DROPDOWN_OPTIONS, REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

const Step3Contact = ({ form, errors, onChange, requiredFields = REQUIRED_FIELDS }) => {
    const isReq = (f) => requiredFields.includes(f)

    return (
        <div className='glass-panel rounded-2xl p-4 md:p-5'>
            <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Emergency contact</h3>
            <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Who to contact in case of an emergency</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField label='Contact Name' name='emergencyContactName' value={form.emergencyContactName} onChange={onChange} required={isReq('emergencyContactName')} error={errors.emergencyContactName} placeholder='Full name' />
                <FormField label='Relation' name='emergencyContactRelation' value={form.emergencyContactRelation} onChange={onChange} required={isReq('emergencyContactRelation')} error={errors.emergencyContactRelation} options={DROPDOWN_OPTIONS.emergencyRelation} />
                <FormField label='Contact Number' name='emergencyContactNumber' value={form.emergencyContactNumber} onChange={onChange} required={isReq('emergencyContactNumber')} error={errors.emergencyContactNumber} placeholder='98765 43210' />
            </div>
        </div>
    )
}

export default Step3Contact
