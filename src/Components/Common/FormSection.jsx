import React from 'react'
import Icon from './Icon'

// A titled panel that groups related fields in a form. `step` is optional (shows "1." before the title).
const FormSection = ({ step, icon, title, subtitle, children }) => (
    <section className='glass-panel rounded-2xl p-4 sm:p-5'>
        <div className='mb-4 flex items-center gap-3'>
            <span aria-hidden='true' className='gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)]'>
                <Icon className={`fa-solid ${icon} text-[15px]`} />
            </span>
            <div className='min-w-0'>
                <h2 className='text-[15px] font-semibold leading-tight text-[var(--ink)]'>
                    {step && <span className='mr-1.5 font-medium text-slate-400'>{step}.</span>}{title}
                </h2>
                {subtitle && <p className='mt-0.5 text-[12px] text-slate-500'>{subtitle}</p>}
            </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>{children}</div>
    </section>
)

export default FormSection
