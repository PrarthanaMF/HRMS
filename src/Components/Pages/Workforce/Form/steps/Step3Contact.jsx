import React from 'react'
import FormField from '../../../../Common/FormField'
import { DROPDOWN_OPTIONS, REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

const Step3Contact = ({ form, errors, onChange }) => {
    const isReq = (f) => REQUIRED_FIELDS.includes(f)

    return (
        <div>
            <h3 className='text-sm font-bold text-slate-800 mb-1'>Emergency Contact Details</h3>
            <p className='text-xs text-slate-500 mb-5'>Who to contact in case of an emergency</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField label='Contact Name' name='emergencyContactName' value={form.emergencyContactName} onChange={onChange} required={isReq('emergencyContactName')} error={errors.emergencyContactName} placeholder='Full name' />
                <FormField label='Relation' name='emergencyContactRelation' value={form.emergencyContactRelation} onChange={onChange} required={isReq('emergencyContactRelation')} error={errors.emergencyContactRelation} options={DROPDOWN_OPTIONS.emergencyRelation} />
                <FormField label='Contact Number' name='emergencyContactNumber' value={form.emergencyContactNumber} onChange={onChange} required={isReq('emergencyContactNumber')} error={errors.emergencyContactNumber} placeholder='+91 98765 43210' />
            </div>
        </div>
    )
}

export default Step3Contact