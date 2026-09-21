import React from 'react'
import FormField from '../FormField'

const Step5Identity = ({ form, errors, onChange }) => {
    return (
        <div className='space-y-8'>

            {/* Identity */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Identity & Government Documents</h3>
                <p className='text-xs text-slate-500 mb-5'>PAN and Aadhaar details</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='PAN Number' name='panNumber' value={form.panNumber} onChange={onChange} error={errors.panNumber} placeholder='e.g. ABCDE1234F' />
                    <FormField label='PAN Photo' name='panPhoto' value={form.panPhoto} onChange={onChange} error={errors.panPhoto} type='file' accept='image/*,application/pdf' />
                    <FormField label='Aadhaar Number' name='aadhaarNumber' value={form.aadhaarNumber} onChange={onChange} error={errors.aadhaarNumber} placeholder='12-digit Aadhaar' />
                    <FormField label='Aadhaar Photo' name='aadhaarPhoto' value={form.aadhaarPhoto} onChange={onChange} error={errors.aadhaarPhoto} type='file' accept='image/*,application/pdf' />
                </div>
            </div>

            {/* Education */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Educational Qualification</h3>
                <p className='text-xs text-slate-500 mb-5'>Upload certificates or marksheets</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='10th Certificate / Marksheet' name='tenthCertificate' value={form.tenthCertificate} onChange={onChange} error={errors.tenthCertificate} type='file' accept='image/*,application/pdf' />
                    <FormField label='2nd PUC Certificate / Marksheet' name='twelfthCertificate' value={form.twelfthCertificate} onChange={onChange} error={errors.twelfthCertificate} type='file' accept='image/*,application/pdf' />
                    <FormField label='Degree Certificate' name='degreeCertificate' value={form.degreeCertificate} onChange={onChange} error={errors.degreeCertificate} type='file' accept='image/*,application/pdf' />
                    <FormField label="Master's Degree Certificate" name='mastersCertificate' value={form.mastersCertificate} onChange={onChange} error={errors.mastersCertificate} type='file' accept='image/*,application/pdf' />
                </div>
            </div>

        </div>
    )
}

export default Step5Identity