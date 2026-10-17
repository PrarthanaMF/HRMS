import React from 'react'
import { useNavigate } from 'react-router-dom'
import RatingRow from './RatingRow'

import Icon from './Icon'
// ============================================================
// Main SuccessScreen
// ============================================================
const SuccessScreen = ({ title, subtitle, recordId, children }) => {
    const navigate = useNavigate()

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <div className='glass-strong rise overflow-hidden rounded-2xl'>

                {/* Success header */}
                <div role='status' className='flex flex-col items-center border-b border-emerald-100 bg-gradient-to-b from-emerald-50 to-white/60 px-6 py-8 text-center'>
                    <div aria-hidden='true' className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_24px_-10px_rgb(5_150_105/0.8)] [animation:ui-pop_320ms_var(--ease-spring)_backwards]'>
                        <Icon className="fa-solid fa-check text-white text-2xl" />
                    </div>
                    <h2 className='text-[20px] font-semibold text-[var(--ink)]'>{title}</h2>
                    {subtitle && <p className='mt-1 text-[13px] text-slate-500'>{subtitle}</p>}
                </div>

                {/* Read-only data preview */}
                <div className='p-5 md:p-6 space-y-4'>
                    {children}
                </div>

                {/* Footer */}
                <div className='flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-white/50 px-5 py-4 sm:flex-row'>
                    <button
                        onClick={() => navigate(`/exit-process/records/${recordId}`)}
                        className='press gradient-brand w-full sm:w-auto px-5 h-10 text-[13px] font-semibold text-white rounded-xl shadow-[0_10px_22px_-12px_rgb(8_26_46/0.95)] hover:brightness-110 cursor-pointer'
                    >
                        Back to Record
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================
// Preview sub-components
// ============================================================

export const PreviewRow = ({ label, value, full = false }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
        <p className='mb-1 text-[12px] font-medium text-slate-500'>{label}</p>
        <p className='text-sm text-slate-700 break-words'>{value || '—'}</p>
    </div>
)

export const PreviewSection = ({ title, icon, children }) => (
    <div className='pt-4 border-t border-slate-100 first:pt-0 first:border-t-0'>
        <div className='flex items-center gap-2 mb-3'>
            <div aria-hidden='true' className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f5f7] ring-1 ring-[#dce6ed]'>
                <Icon className={`fa-solid ${icon} text-[#1f4e6b] text-[14px]`} />
            </div>
            <h4 className='text-[14px] font-semibold text-[var(--ink)]'>{title}</h4>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3'>
            {children}
        </div>
    </div>
)

// RatingPreview — thin wrapper around the shared RatingRow (read-only mode)
export const RatingPreview = ({ label, value }) => (
    <RatingRow label={label} value={value} readOnly />
)

export default SuccessScreen