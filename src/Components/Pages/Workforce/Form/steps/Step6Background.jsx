import React from 'react'
import FormField from '../../../../Common/FormField'
import { REQUIRED_FIELDS } from '../../../../../Utils/employeeSchema'

const DOCUMENT_ACCEPT = 'application/pdf,image/jpeg,image/png'

// Exit details are recorded in the Exit Process module, not here
const Step6Background = ({ form, errors, onChange, requiredFields = REQUIRED_FIELDS, canSalary, fileHint }) => {
    const isReq = (f) => requiredFields.includes(f)

    return (
        <div className='space-y-4'>

            {/* Previous Employment */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Previous employment</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Previous company information and documents</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Previous Company Name' name='previousCompanyName' value={form.previousCompanyName} onChange={onChange} error={errors.previousCompanyName} />
                    <FormField label='Previous Company Manager' name='previousCompanyManager' value={form.previousCompanyManager} onChange={onChange} error={errors.previousCompanyManager} />
                    <FormField label='Previous Company Contact Number' name='previousCompanyContact' value={form.previousCompanyContact} onChange={onChange} error={errors.previousCompanyContact} placeholder='98765 43210' />
                    <FormField label='Relieving Letter' name='relievingLetter' value={form.relievingLetter} onChange={onChange} error={errors.relievingLetter} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('relievingLetter')} />
                    <FormField label='Experience Letter' name='experienceLetter' value={form.experienceLetter} onChange={onChange} error={errors.experienceLetter} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('experienceLetter')} />
                    {canSalary && <>
                        <FormField label='Last Pay Slip 1' name='lastPaySlip1' value={form.lastPaySlip1} onChange={onChange} error={errors.lastPaySlip1} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('lastPaySlip1')} />
                        <FormField label='Last Pay Slip 2' name='lastPaySlip2' value={form.lastPaySlip2} onChange={onChange} error={errors.lastPaySlip2} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('lastPaySlip2')} />
                        <FormField label='Last Pay Slip 3' name='lastPaySlip3' value={form.lastPaySlip3} onChange={onChange} error={errors.lastPaySlip3} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('lastPaySlip3')} />
                    </>}
                </div>
            </div>

            {/* Recruitment */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Joining documents</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Resume and offer letters</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Resume' name='resume' value={form.resume} onChange={onChange} error={errors.resume} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('resume')} />
                    <FormField label='Offer Letter' name='offerLetter' value={form.offerLetter} onChange={onChange} error={errors.offerLetter} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('offerLetter')} />
                    <FormField label='Appointment Letter' name='appointmentLetter' value={form.appointmentLetter} onChange={onChange} error={errors.appointmentLetter} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('appointmentLetter')} />
                </div>
            </div>

            {/* Company Contact */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Company contact</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Official email and company-provided number</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Official Email' name='officialEmail' value={form.officialEmail} onChange={onChange} required={isReq('officialEmail')} error={errors.officialEmail} type='email' placeholder='name@marutiflex.com' />
                    <FormField label='Company-Provided Contact Number' name='companyNumber' value={form.companyNumber} onChange={onChange} error={errors.companyNumber} placeholder='98765 43210' />
                </div>
            </div>

        </div>
    )
}

export default Step6Background
