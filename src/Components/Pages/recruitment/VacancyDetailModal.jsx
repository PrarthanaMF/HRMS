import React from 'react'
import VacancyStatusBadge from './VacancyStatusBadge'
import { formatTimestamp } from '../../../Utils/formatDate'

const InfoRow = ({ label, value }) => (
    <div className='flex flex-col py-2.5 border-b border-slate-100 last:border-0'>
        <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide'>{label}</p>
        <p className='text-sm text-slate-700 break-words whitespace-pre-line'>{value || '—'}</p>
    </div>
)

const VacancyDetailModal = ({ vacancy, onClose, onUpdate }) => {
    if (!vacancy) return null

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner */}
                <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-6'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <p className='font-mono text-xs text-slate-300 mb-1'>S.No {vacancy.jobId}</p>
                    <h2 className='text-xl font-bold text-white pr-10'>{vacancy.designation}</h2>
                    <div className='mt-2'><VacancyStatusBadge status={vacancy.status} /></div>
                </div>

                <div className='px-6 pb-6 pt-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
                        <InfoRow label='Requestor Name' value={vacancy.requestorName} />
                        <InfoRow label='Branch' value={vacancy.branch} />
                        <InfoRow label='Designation' value={vacancy.designation} />
                        <InfoRow label='Salary Range' value={vacancy.salaryRange} />
                        <InfoRow label='No. of Vacancies' value={vacancy.openings} />
                        <InfoRow label='Experience Required' value={vacancy.experienceRequired} />
                        <InfoRow label='Target Date' value={vacancy.targetDate} />
                        <InfoRow label='Requested On' value={formatTimestamp(vacancy.requestedOn)} />
                    </div>

                    <div className='mt-3'>
                        <InfoRow label='Job Description' value={vacancy.jobDescription} />
                    </div>

                    {/* Disabled (not hidden) once the hiring request is closed */}
                    <div className='flex justify-end mt-4'>
                        <button
                            onClick={() => onUpdate(vacancy)}
                            disabled={vacancy.status === 'Closed'}
                            title={vacancy.status === 'Closed' ? 'This hiring request is closed' : undefined}
                            className='flex items-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-slate-200 disabled:cursor-not-allowed'
                        >
                            Update Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VacancyDetailModal