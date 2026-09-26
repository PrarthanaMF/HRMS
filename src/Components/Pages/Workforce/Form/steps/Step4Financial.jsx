import React from 'react'
import FormField from '../../../../Common/FormField'
import { DROPDOWN_OPTIONS } from '../../../../../Utils/employeeSchema'

const Step4Financial = ({ form, errors, onChange }) => {
    return (
        <div className='space-y-8'>

            {/* Salary */}
            <div>
                <h3 className='text-sm font-bold text-slate-800 mb-1'>Salary & Increment Details</h3>
                <p className='text-xs text-slate-500 mb-5'>Salary structure and increment cycle</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField label='Monthly Salary' name='monthlySalary' value={form.monthlySalary} onChange={onChange} error={errors.monthlySalary} placeholder='e.g. 45000' />
                    <FormField label='Next Terms of Increment' name='nextIncrement' value={form.nextIncrement} onChange={onChange} error={errors.nextIncrement} type='date' />
                    <FormField label='Salary Terms' name='salaryTerms' value={form.salaryTerms} onChange={onChange} error={errors.salaryTerms} options={DROPDOWN_OPTIONS.salaryTerms} />
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