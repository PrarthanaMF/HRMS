import React, { useMemo, useState } from 'react'
import VacancyStatusBadge from './VacancyStatusBadge'
import { STAGE_STYLES } from '../../../Utils/mockRecruitment'
import { formatTimestamp } from '../../../Utils/formatDate'

const Field = ({ label, children, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide'>{label}</p>
        <p className='text-[13px] text-slate-700 break-words mt-0.5'>{children || '—'}</p>
    </div>
)

const initials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'

const Stars = ({ value }) => (
    <span className='inline-flex items-center gap-0.5' title={`${value}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={`fa-solid fa-star text-[11px] ${n <= Number(value) ? 'text-amber-400' : 'text-slate-200'}`}></i>
        ))}
    </span>
)

export const CandidateCard = ({ c, position, location }) => (
    <div className='bg-white border border-slate-200 rounded-xl p-4 shadow-sm'>
        <div className='flex items-start gap-3'>
            <div className='w-10 h-10 shrink-0 rounded-full bg-[#062139] text-white text-sm font-semibold flex items-center justify-center'>
                {initials(c.name)}
            </div>
            <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <p className='text-[15px] font-bold text-slate-800 truncate'>{c.name}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STAGE_STYLES[c.stage] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {c.stage || '—'}
                    </span>
                </div>
                <div className='flex items-center gap-2 mt-1'>
                    <Stars value={c.rating} />
                    <span className='text-[11px] text-slate-400'>{c.rating ? `${c.rating}/5` : 'Not rated'}</span>
                </div>
            </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-slate-100'>
            <Field label='Contact Number'>{c.contact}</Field>
            <Field label='Email'>{c.email}</Field>
            <Field label='Salary Expectation'>{c.salaryExpectation}</Field>
            <Field label='Position Applied For'>{c.position || position}</Field>
            <Field label='Location'>{c.location || location}</Field>
            <Field label='HR Name'>{c.hrName}</Field>
            <Field label='Recruitment Source'>{c.recruitmentSource}</Field>
            <Field label='Division'>{c.division}</Field>
            <Field label='Next Schedule Date'>{formatTimestamp(c.nextScheduleDate)}</Field>
            <Field label='Logged On'>{formatTimestamp(c.loggedOn)}</Field>
            {c.referredBy && <Field label='Reference By'>{c.referredBy}</Field>}
            <Field label='Resume'>
                {c.resumeFileName && (
                    <span className='inline-flex items-center gap-1.5'>
                        <i className='fa-solid fa-file-lines text-slate-400 text-xs'></i>{c.resumeFileName}
                    </span>
                )}
            </Field>
        </div>

        <div className='mt-3 pt-3 border-t border-slate-100'>
            <Field label='Remarks / Reason / Conversation'>
                <span className='whitespace-pre-line'>{c.remarks}</span>
            </Field>
        </div>

        {/* Filled in from Update -> Stage when the candidate reaches Offer / Join */}
        {(c.offerDate || c.expectedJoiningDate || c.company) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <p className='text-[11px] font-semibold text-slate-500 mb-2'>Offer Details</p>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3'>
                    <Field label='Offer Date'>{formatTimestamp(c.offerDate)}</Field>
                    <Field label='Expected Date of Joining'>{formatTimestamp(c.expectedJoiningDate)}</Field>
                    <Field label='Company'>{c.company}</Field>
                </div>
            </div>
        )}

        {(c.employeeId || c.hiredCost) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <p className='text-[11px] font-semibold text-slate-500 mb-2'>Joining Details</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                    <Field label='Hired Cost'>{c.hiredCost}</Field>
                    <Field label='Final Status'>{c.finalStatus}</Field>
                    <Field label='Employee ID'>{c.employeeId}</Field>
                    <Field label='Joining Form'>
                        {c.joiningFormFileName && (
                            <span className='inline-flex items-center gap-1.5'>
                                <i className='fa-solid fa-file-lines text-slate-400 text-xs'></i>{c.joiningFormFileName}
                            </span>
                        )}
                    </Field>
                </div>
            </div>
        )}

        {(c.declineReason || c.connectFuture) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <p className='text-[11px] font-semibold text-slate-500 mb-2'>Reason for Decline</p>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3'>
                    <Field label='Decline Reason'>{c.declineReason}</Field>
                    <Field label='Connect in Future'>{c.connectFuture}</Field>
                    {c.connectFuture === 'Yes' && <Field label='Next Connect Date'>{formatTimestamp(c.nextConnectDate)}</Field>}
                </div>
            </div>
        )}

        {c.history?.length > 0 && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <p className='text-[11px] font-semibold text-slate-500 mb-2'>Update History</p>
                <ul className='space-y-2'>
                    {[...c.history].reverse().map((h) => (
                        <li key={h.id} className='text-[12px] text-slate-600 flex flex-col sm:flex-row sm:gap-3'>
                            <span className='text-slate-400 sm:w-40 shrink-0'>{formatTimestamp(h.at)}</span>
                            <span className='min-w-0 break-words'>
                                <span className='font-medium text-slate-700'>
                                    {h.type === 'stage' && `Stage: ${h.stage}`}
                                    {h.type === 'remarks' && 'Remark added'}
                                    {h.type === 'schedule' && `Rescheduled to ${formatTimestamp(h.nextScheduleDate)}`}
                                </span>
                                {h.type === 'stage' && h.nextScheduleDate ? ` · next on ${formatTimestamp(h.nextScheduleDate)}` : ''}
                                {h.remarks ? ` — ${h.remarks}` : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
)

// Pop-up listing every candidate logged against a vacancy, one card per candidate
// with their complete details. Opened by clicking the candidates count/icon in
// Current Vacancy and Recruitment Tracker. Scrolls inside the pop-up and has a
// search box, so it stays usable even when there are many candidates.
const CandidateDetailsModal = ({ vacancy, onClose }) => {
    const [query, setQuery] = useState('')

    const candidates = useMemo(() => {
        const all = [...(vacancy?.candidates || [])].reverse() // newest first
        const q = query.trim().toLowerCase()
        if (!q) return all
        return all.filter((c) =>
            [c.name, c.email, c.contact, c.stage, c.recruitmentSource].some((f) => (f || '').toLowerCase().includes(q))
        )
    }, [vacancy, query])

    if (!vacancy) return null
    const total = (vacancy.candidates || []).length

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner */}
                <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-5 shrink-0'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                        aria-label='Close'
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                    <p className='font-mono text-xs text-slate-300 mb-1'>S.No {vacancy.jobId} · {vacancy.branch}</p>
                    <h2 className='text-lg font-bold text-white pr-10'>Candidates — {vacancy.designation}</h2>
                    <div className='mt-2 flex items-center gap-2'>
                        <VacancyStatusBadge status={vacancy.status} />
                        <span className='text-xs text-slate-300'>{total} candidate{total === 1 ? '' : 's'}</span>
                    </div>
                </div>

                {/* Search (only worth showing once there's a handful) */}
                {total > 2 && (
                    <div className='px-6 pt-4 shrink-0'>
                        <div className='relative'>
                            <i className='fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400'></i>
                            <input
                                type='text'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Search by name, email, contact or stage...'
                                className='w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
                            />
                        </div>
                    </div>
                )}

                {/* Candidate cards */}
                <div className='p-6 overflow-y-auto space-y-4'>
                    {total === 0 ? (
                        <div className='text-center py-10'>
                            <i className='fa-solid fa-users text-4xl text-slate-300 mb-3'></i>
                            <p className='text-sm text-slate-500'>No candidates have been logged for this position yet.</p>
                            <p className='text-xs text-slate-400 mt-1'>Use Update → New Recruitment to add one.</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <p className='text-sm text-slate-400 text-center py-8'>No candidates match “{query}”.</p>
                    ) : (
                        candidates.map((c) => (
                            <CandidateCard key={c.id} c={c} position={vacancy.designation} location={vacancy.branch} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default CandidateDetailsModal