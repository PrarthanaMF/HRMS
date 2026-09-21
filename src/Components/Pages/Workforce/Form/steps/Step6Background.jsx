import React from 'react'
import FormField from '../FormField'
import { DROPDOWN_OPTIONS } from '../../../../../Utils/employeeSchema'

const Step6Background = ({ form, errors, onChange }) => {
    return (
        <div className='space-y-8'>

            {/* Previous Employment */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Previous Employment Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Previous company information and documents</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Previous Company Name' name='previousCompanyName' value={form.previousCompanyName} onChange={onChange} error={errors.previousCompanyName} />
                    <FormField label='Previous Company Manager' name='previousCompanyManager' value={form.previousCompanyManager} onChange={onChange} error={errors.previousCompanyManager} />
                    <FormField label='Previous Company Contact Number' name='previousCompanyContact' value={form.previousCompanyContact} onChange={onChange} error={errors.previousCompanyContact} placeholder='+91 98765 43210' />
                    <FormField label='Relieving Letter' name='relievingLetter' value={form.relievingLetter} onChange={onChange} error={errors.relievingLetter} type='file' accept='image/*,application/pdf' />
                    <FormField label='Experience Letter' name='experienceLetter' value={form.experienceLetter} onChange={onChange} error={errors.experienceLetter} type='file' accept='image/*,application/pdf' />
                    <FormField label='Last Pay Slip 1' name='lastPaySlip1' value={form.lastPaySlip1} onChange={onChange} error={errors.lastPaySlip1} type='file' accept='image/*,application/pdf' />
                    <FormField label='Last Pay Slip 2' name='lastPaySlip2' value={form.lastPaySlip2} onChange={onChange} error={errors.lastPaySlip2} type='file' accept='image/*,application/pdf' />
                    <FormField label='Last Pay Slip 3' name='lastPaySlip3' value={form.lastPaySlip3} onChange={onChange} error={errors.lastPaySlip3} type='file' accept='image/*,application/pdf' />
                </div>
            </div>

            {/* Recruitment */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Recruitment / Joining Documents</h3>
                <p className='text-xs text-slate-500 mb-5'>Resume and offer letters</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Resume' name='resume' value={form.resume} onChange={onChange} error={errors.resume} type='file' accept='image/*,application/pdf' />
                    <FormField label='Offer Letter' name='offerLetter' value={form.offerLetter} onChange={onChange} error={errors.offerLetter} type='file' accept='image/*,application/pdf' />
                    <FormField label='Appointment Letter' name='appointmentLetter' value={form.appointmentLetter} onChange={onChange} error={errors.appointmentLetter} type='file' accept='image/*,application/pdf' />
                </div>
            </div>

            {/* Company Contact */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Company Contact Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Official email and company-provided number</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Official Email' name='officialEmail' value={form.officialEmail} onChange={onChange} error={errors.officialEmail} type='email' placeholder='name@marutiflex.com' />
                    <FormField label='Company-Provided Contact Number' name='companyNumber' value={form.companyNumber} onChange={onChange} error={errors.companyNumber} placeholder='+91 98765 43210' />
                </div>
            </div>

            {/* Exit */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Exit Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Leave blank if the employee is still active</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Last Date of Working' name='lastWorkingDate' value={form.lastWorkingDate} onChange={onChange} error={errors.lastWorkingDate} type='date' />
                    <FormField label='Type of Removal' name='removalType' value={form.removalType} onChange={onChange} error={errors.removalType} options={DROPDOWN_OPTIONS.removalType} />
                    <FormField label='Exit Remarks' name='exitRemarks' value={form.exitRemarks} onChange={onChange} error={errors.exitRemarks} textarea />
                </div>
            </div>

        </div>
    )
}

export default Step6Background