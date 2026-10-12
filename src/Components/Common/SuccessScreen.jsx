import React from 'react'
import { useNavigate } from 'react-router-dom'
import RatingRow from './RatingRow'

// ============================================================
// Main SuccessScreen
// ============================================================
const SuccessScreen = ({ title, subtitle, recordId, children }) => {
    const navigate = useNavigate()

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

                {/* Success header */}
                <div className='flex flex-col items-center text-center px-6 py-8 bg-emerald-50 border-b border-emerald-100'>
                    <div className='w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-sm'>
                        <i className="fa-solid fa-check text-white text-2xl"></i>
                    </div>
                    <h2 className='text-lg font-bold text-slate-800'>{title}</h2>
                    {subtitle && <p className='text-xs text-slate-500 mt-1'>{subtitle}</p>}
                </div>

                {/* Read-only data preview */}
                <div className='p-5 md:p-6 space-y-4'>
                    {children}
                </div>

                {/* Footer */}
                <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50'>
                    <button
                        onClick={() => navigate(`/exit-process/records/${recordId}`)}
                        className='w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition shadow-sm hover:shadow-md cursor-pointer'
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
        <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide mb-1'>{label}</p>
        <p className='text-sm text-slate-700 break-words'>{value || '—'}</p>
    </div>
)

export const PreviewSection = ({ title, icon, children }) => (
    <div className='pt-4 border-t border-slate-100 first:pt-0 first:border-t-0'>
        <div className='flex items-center gap-2 mb-3'>
            <div className='w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0'>
                <i className={`fa-solid ${icon} text-slate-500 text-[10px]`}></i>
            </div>
            <h4 className='text-xs font-bold text-slate-800'>{title}</h4>
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