import React from 'react'
import FormField from '../../../../Common/FormField'

const DOCUMENT_ACCEPT = 'application/pdf,image/jpeg,image/png'

const Step5Identity = ({ form, errors, onChange, canSalary, fileHint }) => {
    return (
        <div className='space-y-8'>

            {/* Identity: numbers and copies are for salary roles only */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Identity & Government Documents</h3>
                <p className='text-xs text-slate-500 mb-5'>PAN and Aadhaar details</p>

                {canSalary ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <FormField label='PAN Number' name='panNumber' value={form.panNumber} onChange={onChange} error={errors.panNumber} placeholder='e.g. ABCDE1234F' />
                        <FormField label='PAN Copy' name='panPhoto' value={form.panPhoto} onChange={onChange} error={errors.panPhoto} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('panPhoto')} />
                        <FormField label='Aadhaar Number' name='aadhaarNumber' value={form.aadhaarNumber} onChange={onChange} error={errors.aadhaarNumber} placeholder='12-digit Aadhaar' />
                        <FormField label='Aadhaar Copy' name='aadhaarPhoto' value={form.aadhaarPhoto} onChange={onChange} error={errors.aadhaarPhoto} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('aadhaarPhoto')} />
                    </div>
                ) : (
                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
                        <i className='fa-solid fa-lock mr-2 text-slate-400'></i>
                        PAN and Aadhaar can only be seen and changed by an HR Manager or an Admin.
                        {form.aadhaarMasked && <span className='ml-1'>Aadhaar on file: <span className='font-mono'>{form.aadhaarMasked}</span></span>}
                    </div>
                )}
            </div>

            {/* Education */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Educational Qualification</h3>
                <p className='text-xs text-slate-500 mb-5'>Upload certificates or marksheets (PDF, JPG or PNG, up to 5 MB each)</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='10th Certificate / Marksheet' name='tenthCertificate' value={form.tenthCertificate} onChange={onChange} error={errors.tenthCertificate} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('tenthCertificate')} />
                    <FormField label='2nd PUC Certificate / Marksheet' name='twelfthCertificate' value={form.twelfthCertificate} onChange={onChange} error={errors.twelfthCertificate} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('twelfthCertificate')} />
                    <FormField label='Degree Certificate' name='degreeCertificate' value={form.degreeCertificate} onChange={onChange} error={errors.degreeCertificate} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('degreeCertificate')} />
                    <FormField label="Master's Degree Certificate" name='mastersCertificate' value={form.mastersCertificate} onChange={onChange} error={errors.mastersCertificate} type='file' accept={DOCUMENT_ACCEPT} hint={fileHint('mastersCertificate')} />
                </div>
            </div>

        </div>
    )
}

export default Step5Identity
