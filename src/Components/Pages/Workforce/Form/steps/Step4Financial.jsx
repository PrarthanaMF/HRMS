import React from 'react'
import FormField from '../../../../Common/FormField'

import Icon from '../../../../Common/Icon'
// Salary and bank details: only Super Admin, Admin and HR Manager see or change them
const Step4Financial = ({ form, errors, onChange, canSalary }) => {
    if (!canSalary) {
        return (
            <div className='glass-panel rounded-2xl p-4 text-[13px] text-slate-600'>
                <Icon className='fa-solid fa-lock mr-2 text-slate-400' />
                Salary and bank details can only be seen and changed by an HR Manager or an Admin.
            </div>
        )
    }

    return (
        <div className='space-y-4'>

            {/* Salary */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Salary</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Gross monthly salary (the salary break-up is managed with payroll)</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Monthly Salary (gross)' name='monthlySalary' value={form.monthlySalary} onChange={onChange} error={errors.monthlySalary} type='number' min={0} placeholder='e.g. 45000' />
                </div>
            </div>

            {/* Bank */}
            <div className='glass-panel rounded-2xl p-4 md:p-5'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)]'>Bank details</h3>
                <p className='mt-0.5 mb-4 text-[13px] text-slate-500'>Where the salary is credited</p>

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
