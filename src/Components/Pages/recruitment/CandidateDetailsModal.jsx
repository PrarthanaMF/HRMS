import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import VacancyStatusBadge from './VacancyStatusBadge'
import { formatTimestamp } from '../../../Utils/formatDate'
import { stageBadgeClass, inputClass, modalPanel, modalHeader, modalTitle, modalClose, metaLabel } from './ui'

import Icon from '../../Common/Icon'
const Field = ({ label, children, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className={metaLabel}>{label}</p>
        <p className='text-[13px] text-slate-700 break-words mt-0.5'>{children || '—'}</p>
    </div>
)

const SectionTitle = ({ children }) => (
    <p className='text-[13px] font-semibold text-[var(--ink)] mb-2'>{children}</p>
)

const initials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'

const Stars = ({ value }) => (
    <span className='inline-flex items-center gap-0.5' title={`${value}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
            <Icon key={n} className={`fa-solid fa-star text-[11px] ${n <= Number(value) ? 'text-amber-400' : 'text-slate-200'}`} />
        ))}
    </span>
)

export const CandidateCard = ({ c, position, location }) => (
    <div className='glass-panel rounded-2xl p-4'>
        <div className='flex items-start gap-3'>
            <div aria-hidden='true' className='gradient-brand w-10 h-10 shrink-0 rounded-xl text-white text-sm font-semibold flex items-center justify-center'>
                {initials(c.name)}
            </div>
            <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                    <p className='text-[15px] font-semibold text-[var(--ink)] truncate'>{c.name}</p>
                    <span className={`${stageBadgeClass(c.stage)} shrink-0`}>
                        {c.stage || '—'}
                    </span>
                </div>
                <div className='flex items-center gap-2 mt-1'>
                    <Stars value={c.rating} />
                    <span className='text-xs text-slate-500 tabular-nums'>{c.rating ? `${c.rating}/5` : 'Not rated'}</span>
                </div>
            </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-slate-100'>
            <Field label='Contact number'>{c.contact}</Field>
            <Field label='Email'>{c.email}</Field>
            <Field label='Salary expectation'>{c.salaryExpectation}</Field>
            <Field label='Position applied for'>{c.position || position}</Field>
            <Field label='Location'>{c.location || location}</Field>
            <Field label='HR name'>{c.hrName}</Field>
            <Field label='Recruitment source'>{c.recruitmentSource}</Field>
            <Field label='Division'>{c.division}</Field>
            <Field label='Next schedule date'>{formatTimestamp(c.nextScheduleDate)}</Field>
            <Field label='Logged on'>{formatTimestamp(c.loggedOn)}</Field>
            {c.referredBy && <Field label='Reference by'>{c.referredBy}</Field>}
            <Field label='Resume'>
                {c.resumeFileName && (
                    <span className='inline-flex items-center gap-1.5'>
                        <Icon className='fa-solid fa-file-lines text-slate-400 text-xs' />{c.resumeFileName}
                    </span>
                )}
            </Field>
        </div>

        <div className='mt-3 pt-3 border-t border-slate-100'>
            <Field label='Remarks / reason / conversation'>
                <span className='whitespace-pre-line'>{c.remarks}</span>
            </Field>
        </div>

        {/* Filled in from Update -> Stage when the candidate reaches Offer / Join */}
        {(c.offerDate || c.expectedJoiningDate || c.company) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <SectionTitle>Offer details</SectionTitle>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3'>
                    <Field label='Offer date'>{formatTimestamp(c.offerDate)}</Field>
                    <Field label='Expected date of joining'>{formatTimestamp(c.expectedJoiningDate)}</Field>
                    <Field label='Company'>{c.company}</Field>
                </div>
            </div>
        )}

        {(c.employeeId || c.hiredCost) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <SectionTitle>Joining details</SectionTitle>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                    <Field label='Hired cost'>{c.hiredCost}</Field>
                    <Field label='Final status'>{c.finalStatus}</Field>
                    <Field label='Employee ID'>{c.employeeId}</Field>
                    <Field label='Joining form'>
                        {c.joiningFormFileName && (
                            <span className='inline-flex items-center gap-1.5'>
                                <Icon className='fa-solid fa-file-lines text-slate-400 text-xs' />{c.joiningFormFileName}
                            </span>
                        )}
                    </Field>
                </div>
            </div>
        )}

        {(c.declineReason || c.connectFuture) && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <SectionTitle>Reason for decline</SectionTitle>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3'>
                    <Field label='Decline reason'>{c.declineReason}</Field>
                    <Field label='Connect in future'>{c.connectFuture}</Field>
                    {c.connectFuture === 'Yes' && <Field label='Next connect date'>{formatTimestamp(c.nextConnectDate)}</Field>}
                </div>
            </div>
        )}

        {c.history?.length > 0 && (
            <div className='mt-3 pt-3 border-t border-slate-100'>
                <SectionTitle>Update history</SectionTitle>
                <ul className='space-y-2'>
                    {[...c.history].reverse().map((h) => (
                        <li key={h.id} className='text-[13px] text-slate-600 flex flex-col sm:flex-row sm:gap-3'>
                            <span className='text-xs text-slate-500 sm:w-40 shrink-0 tabular-nums sm:pt-px'>{formatTimestamp(h.at)}</span>
                            <span className='min-w-0 break-words'>
                                <span className='font-medium text-slate-700'>
                                    {h.type === 'stage' && `Stage: ${h.stage}`}
                                    {h.type === 'remarks' && 'Remark added'}
                                    {h.type === 'schedule' && `Rescheduled to ${formatTimestamp(h.nextScheduleDate)}`}
                                </span>
                                {h.type === 'stage' && h.nextScheduleDate ? `, next on ${formatTimestamp(h.nextScheduleDate)}` : ''}
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

    return createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={onClose}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='candidate-list-title'
                className={`${modalPanel} max-w-3xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalHeader}>
                    <div className='min-w-0'>
                        <p className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium text-slate-500'>
                            <span className='tabular-nums'>S.No {vacancy.jobId}</span>
                            <span className='inline-flex items-center gap-1'>
                                <Icon className='fa-solid fa-location-dot text-[10px] text-slate-400' />{vacancy.branch}
                            </span>
                        </p>
                        <h2 id='candidate-list-title' className={`${modalTitle} mt-0.5 text-lg`}>Candidates — {vacancy.designation}</h2>
                        <div className='mt-2 flex items-center gap-2'>
                            <VacancyStatusBadge status={vacancy.status} />
                            <span className='text-xs text-slate-500 tabular-nums'>{total} candidate{total === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className={modalClose} aria-label='Close'>
                        <Icon className='fa-solid fa-xmark' />
                    </button>
                </div>

                {/* Search (only worth showing once there's a handful) */}
                {total > 2 && (
                    <div className='px-5 pt-4 shrink-0'>
                        <div className='relative'>
                            <Icon className='fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400' />
                            <input
                                type='text'
                                aria-label='Search candidates'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Search by name, email, contact or stage'
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </div>
                )}

                {/* Candidate cards */}
                <div className='p-4 sm:p-5 overflow-y-auto space-y-4'>
                    {total === 0 ? (
                        <div className='text-center py-10'>
                            <span aria-hidden='true' className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
                                <Icon className='fa-solid fa-users text-xl' />
                            </span>
                            <p className='text-sm font-medium text-[var(--ink)]'>No candidates have been logged for this position yet.</p>
                            <p className='text-[13px] text-slate-500 mt-1'>Use Update, then New recruitment, to add one.</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <p className='text-sm text-slate-500 text-center py-8'>No candidates match “{query}”.</p>
                    ) : (
                        candidates.map((c) => (
                            <CandidateCard key={c.id} c={c} position={vacancy.designation} location={vacancy.branch} />
                        ))
                    )}
                </div>
            </div>
        </div>
    , document.body)
}

export default CandidateDetailsModal
