import React from 'react'
import FormField from '../../../../Common/FormField'

// Salary and bank details: only Super Admin, Admin and HR Manager see or change them
const Step4Financial = ({ form, errors, onChange, canSalary }) => {
    if (!canSalary) {
        return (
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
                <i className='fa-solid fa-lock mr-2 text-slate-400'></i>
                Salary and bank details can only be seen and changed by an HR Manager or an Admin.
            </div>
        )
    }

    return (
        <div className='space-y-8'>

            {/* Salary */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Salary</h3>
                <p className='text-xs text-slate-500 mb-5'>Gross monthly salary (the salary break-up is managed with payroll)</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Monthly Salary (gross)' name='monthlySalary' value={form.monthlySalary} onChange={onChange} error={errors.monthlySalary} type='number' min={0} placeholder='e.g. 45000' />
                </div>
            </div>

            {/* Bank */}
            <div className='pt-6 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Bank Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Where the salary is credited</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Bank Name' name='bankName' value={form.bankName} onChange={onChange} error={errors.bankName} placeholder='e.g. HDFC Bank' />
                    <FormField label='Account Number' name='accountNumber' value={form.accountNumber} onChange={onChange} error={errors.accountNumber} placeholder='Account number' />
                    <FormField label='IFSC Code' name='ifscCode' value={form.ifscCode} onChange={onChange} error={errors.ifscCode} placeholder='e.g. HDFC0001234' />
                </div>
            </div>

        </div>
    )
}

export default Step4Financial
