import React from 'react'
import FormField from '../FormField'
import { DROPDOWN_OPTIONS, REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

const Step1Personal = ({ form, errors, onChange }) => {
    const isReq = (f) => REQUIRED_FIELDS.includes(f)

    return (
        <div className='space-y-8'>

            {/* Personal Information */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Personal Information</h3>
                <p className='text-xs text-slate-500 mb-5'>Basic details and photo</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Employee Name' name='name' value={form.name} onChange={onChange} required={isReq('name')} error={errors.name} placeholder='e.g. Rahul Mehta' />
                    <FormField label='Gender' name='gender' value={form.gender} onChange={onChange} required={isReq('gender')} error={errors.gender} options={DROPDOWN_OPTIONS.gender} />
                    <FormField label='Personal Number' name='personalNumber' value={form.personalNumber} onChange={onChange} required={isReq('personalNumber')} error={errors.personalNumber} placeholder='+91 98765 43210' />
                    <FormField label='Personal Email' name='personalEmail' value={form.personalEmail} onChange={onChange} required={isReq('personalEmail')} error={errors.personalEmail} type='email' placeholder='rahul@example.com' />
                    <FormField label='Date of Birth' name='dateOfBirth' value={form.dateOfBirth} onChange={onChange} required={isReq('dateOfBirth')} error={errors.dateOfBirth} type='date' />
                    <FormField label='Date of Anniversary' name='dateOfAnniversary' value={form.dateOfAnniversary} onChange={onChange} error={errors.dateOfAnniversary} type='date' />
                    <FormField label='Blood Group' name='bloodGroup' value={form.bloodGroup} onChange={onChange} required={isReq('bloodGroup')} error={errors.bloodGroup} options={DROPDOWN_OPTIONS.bloodGroup} />
                    <FormField label='Photo' name='photo' value={form.photo} onChange={onChange} error={errors.photo} type='file' accept='image/*' />
                </div>
            </div>

            {/* Address Details */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Address Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Present and permanent address</p>

                <div className='grid grid-cols-1 gap-4'>
                    <FormField label='Present Address' name='presentAddress' value={form.presentAddress} onChange={onChange} required={isReq('presentAddress')} error={errors.presentAddress} textarea placeholder='House no, street, city, state, pincode' />
                    <FormField label='Permanent Address' name='permanentAddress' value={form.permanentAddress} onChange={onChange} error={errors.permanentAddress} textarea placeholder='House no, street, city, state, pincode' />
                </div>
            </div>

        </div>
    )
}

export default Step1Personal