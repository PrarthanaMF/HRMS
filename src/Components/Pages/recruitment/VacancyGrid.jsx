import React from 'react'
import { useSelector } from 'react-redux'
import { selectFilteredVacancies } from '../../../Store/Redux/Recruitment/VacancySlice'
import VacancyStatusBadge from './VacancyStatusBadge'
import { formatTimestamp } from '../../../Utils/formatDate'

const ActionButtons = ({ vacancy, onView, onUpdate }) => (
    <div className='flex items-center gap-2'>
        <button
            onClick={() => onView(vacancy)}
            title='View full details'
            className='w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center'
        >
            <i className="fa-solid fa-eye text-[11px]"></i>
        </button>
        {/* Update stays visible but is disabled once the hiring request is closed */}
        <button
            onClick={() => onUpdate(vacancy)}
            disabled={vacancy.status === 'Closed'}
            title={vacancy.status === 'Closed' ? 'This hiring request is closed' : 'Update'}
            className='h-7 px-2.5 rounded-lg bg-[#062139] hover:bg-[#0a2f52] text-white text-[11px] font-medium transition inline-flex items-center justify-center gap-1.5 whitespace-nowrap disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-slate-200 disabled:cursor-not-allowed'
        >
            Update
        </button>
    </div>
)

const VacancyGrid = ({ onView, onUpdate, onViewCandidates }) => {
    const vacancies = useSelector(selectFilteredVacancies)

    if (vacancies.length === 0) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className="fa-solid fa-briefcase text-4xl text-slate-300 mb-3"></i>
                <p className='text-slate-500 text-sm'>No vacancies match your filters</p>
            </div>
        )
    }

    return (
        <>
            {/* ============ DESKTOP TABLE ============ */}
            <div className='hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead className='bg-[#062139] border-b border-[#0a2f52]'>
                            <tr className='text-left text-[10px] uppercase text-slate-200 font-semibold tracking-wide'>
                                <th className='px-2.5 py-2.5'>S.No</th>
                                <th className='px-2.5 py-2.5'>Designation</th>
                                <th className='px-2.5 py-2.5'>Branch</th>
                                <th className='px-2.5 py-2.5'>Vacancies</th>
                                <th className='px-2.5 py-2.5'>Candidates</th>
                                <th className='px-2.5 py-2.5'>Salary Range</th>
                                <th className='px-2.5 py-2.5'>Experience</th>
                                <th className='px-2.5 py-2.5'>Target Date</th>
                                <th className='px-2.5 py-2.5'>Requested By</th>
                                <th className='px-2.5 py-2.5'>Timestamp</th>
                                <th className='px-2.5 py-2.5'>Status</th>
                                <th className='px-2.5 py-2.5 text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vacancies.map((v) => (
                                <tr key={v._id} className='border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition'>
                                    <td className='px-2.5 py-2.5'>
                                        <span className='text-[11px] font-semibold text-slate-700'>{v.jobId}</span>
                                    </td>
                                    <td className='px-2.5 py-2.5'>
                                        <button
                                            onClick={() => onView(v)}
                                            title='View details'
                                            className='text-[12.5px] font-medium text-slate-800 hover:text-[#062139] hover:underline truncate text-left'
                                        >
                                            {v.designation}
                                        </button>
                                    </td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px]'>{v.branch}</td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px]'>{v.openings || '—'}</td>
                                    <td className='px-2.5 py-2.5'>
                                        <button
                                            onClick={() => onViewCandidates(v)}
                                            title='View candidate details'
                                            className='inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-700 bg-slate-100 hover:bg-[#062139] hover:text-white rounded-full px-2 py-0.5 transition group'
                                        >
                                            <i className="fa-solid fa-users text-[9px] text-slate-400 group-hover:text-white/80"></i>
                                            {(v.candidates || []).length}
                                        </button>
                                    </td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px]'>{v.salaryRange || '—'}</td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px]'>{v.experienceRequired || '—'}</td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px]'>{v.targetDate || '—'}</td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px] truncate max-w-[120px]'>{v.requestorName || '—'}</td>
                                    <td className='px-2.5 py-2.5 text-slate-600 text-[12px] whitespace-nowrap'>{formatTimestamp(v.requestedOn)}</td>
                                    <td className='px-2.5 py-2.5'><VacancyStatusBadge status={v.status} /></td>
                                    <td className='px-2.5 py-2.5'>
                                        <div className='flex items-center justify-center'>
                                            <ActionButtons vacancy={v} onView={onView} onUpdate={onUpdate} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50'>
                    <p className='text-xs text-slate-500'>
                        Showing <span className='font-semibold text-slate-700'>{vacancies.length}</span> vacancies
                    </p>
                </div>
            </div>

            {/* ============ MOBILE CARDS ============ */}
            <div className='md:hidden'>
                <div className='space-y-3'>
                    {vacancies.map((v) => (
                        <div key={v._id} className='bg-white rounded-xl border border-slate-100 shadow-sm p-4'>

                            {/* Top row: ID chip + View / Update actions */}
                            <div className='flex items-center justify-between gap-2'>
                                <span className='inline-flex items-center h-7 px-3 rounded-full border border-slate-200 bg-slate-100 text-[12px] font-bold text-slate-600'>
                                    {v.jobId}
                                </span>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => onView(v)}
                                        title='View full details'
                                        aria-label='View full details'
                                        className='w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center'
                                    >
                                        <i className="fa-solid fa-eye text-[12px]"></i>
                                    </button>
                                    <button
                                        onClick={() => onUpdate(v)}
                                        disabled={v.status === 'Closed'}
                                        title={v.status === 'Closed' ? 'This hiring request is closed' : 'Update'}
                                        className='inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#062139] hover:bg-[#0a2f52] text-white text-[12px] font-semibold transition disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-slate-200 disabled:cursor-not-allowed'
                                    >
                                        <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                        Update
                                    </button>
                                </div>
                            </div>

                            {/* Designation: headline field, tap to view */}
                            <button onClick={() => onView(v)} className='text-left block w-full mt-3'>
                                <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Designation</p>
                                <h3 className='text-[16px] font-bold text-slate-800 leading-snug truncate mt-0.5'>{v.designation}</h3>
                            </button>

                            {/* Details grid */}
                            <div className='grid grid-cols-2 gap-x-3 gap-y-3 mt-4 pt-3.5 border-t border-slate-100'>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Branch</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.branch || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Status</p>
                                    <div className='mt-0.5'><VacancyStatusBadge status={v.status} /></div>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Vacancies</p>
                                    <p className='text-[13px] text-slate-800 font-medium mt-0.5'>{v.openings || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Candidates</p>
                                    <button
                                        onClick={() => onViewCandidates(v)}
                                        className='mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-slate-800 font-medium'
                                    >
                                        <i className="fa-solid fa-users text-[10px] text-slate-400"></i>
                                        {(v.candidates || []).length}
                                        <i className="fa-solid fa-chevron-right text-[8px] text-slate-300"></i>
                                    </button>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Experience</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.experienceRequired || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Target Date</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.targetDate || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Salary Range</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.salaryRange || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Requested By</p>
                                    <p className='text-[13px] text-slate-800 font-medium truncate mt-0.5'>{v.requestorName || '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className='text-xs text-slate-500 text-center mt-4 mb-2'>
                    Showing <span className='font-semibold text-slate-700'>{vacancies.length}</span> vacancies
                </p>
            </div>
        </>
    )
}

export default VacancyGrid