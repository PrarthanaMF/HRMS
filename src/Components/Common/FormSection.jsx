import React from 'react'

// A titled card that groups related fields in a form. `step` is optional (shows "1." before the title).
const FormSection = ({ step, icon, title, subtitle, children }) => (
    <section className='border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/40'>
        <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 shrink-0 rounded-lg bg-[#062139] text-white flex items-center justify-center'>
                <i className={`fa-solid ${icon} text-xs`}></i>
            </div>
            <div className='min-w-0'>
                <p className='text-sm font-semibold text-slate-800 leading-tight'>
                    {step && <span className='text-slate-400 font-medium mr-1.5'>{step}.</span>}{title}
                </p>
                {subtitle && <p className='text-[11px] text-slate-400 mt-0.5'>{subtitle}</p>}
            </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{children}</div>
    </section>
)

export default FormSection