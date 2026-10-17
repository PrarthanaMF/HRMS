import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DatePicker } from '../../Common/DateTimePicker'
import { useDispatch, useSelector } from 'react-redux'
import { updateVacancy, addCandidateToVacancy } from '../../../Store/Redux/Recruitment/VacancySlice'
import VacancyStatusBadge from './VacancyStatusBadge'
import RecruitmentTrackerForm from './RecruitmentTrackerForm'
import { todayISO } from '../../../Utils/formatDate'
import { primaryButton, secondaryButton } from '../../Common/PageHeader'
import { inputClass, labelClass, modalPanel, modalHeader, modalTitle, modalClose } from './ui'

import Icon from '../../Common/Icon'
const OPTIONS = [
    {
        key: 'postpone',
        icon: 'fa-calendar-days',
        title: 'Postpone timeline',
        desc: 'Push the target hiring date to a new deadline.',
    },
    {
        key: 'new-recruitment',
        icon: 'fa-user-plus',
        title: 'New recruitment',
        desc: 'Open the candidate application form for this position.',
    },
    {
        key: 'closed',
        icon: 'fa-circle-check',
        title: 'Closed hiring',
        desc: 'Mark this hiring request as closed.',
    },
]

const backButton = 'press -ml-2 inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'

const VacancyUpdateModal = ({ vacancy, onClose }) => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.value) // currently logged-in account

    const [step, setStep] = useState('menu') // 'menu' | 'postpone' | 'closed'
    const [newTargetDate, setNewTargetDate] = useState('')
    const [saving, setSaving] = useState(false)

    // Reset internal state every time a new vacancy is opened / modal is closed
    useEffect(() => {
        setStep('menu')
        setNewTargetDate(vacancy?.targetDate || '')
        setSaving(false)
    }, [vacancy])

    if (!vacancy) return null

    const close = () => {
        setStep('menu')
        onClose()
    }

    const handlePostponeSave = () => {
        if (!newTargetDate || newTargetDate < todayISO()) return
        dispatch(updateVacancy({ _id: vacancy._id, targetDate: newTargetDate }))
        close()
    }

    const handleConfirmClosed = () => {
        setSaving(true)
        dispatch(updateVacancy({ _id: vacancy._id, status: 'Closed' }))
        close()
    }

    // Submission from the in-app Recruitment Tracker Form: each submission is one
    // candidate logged against this vacancy, so it's appended to the vacancy's
    // candidate history (this is what the "No. of Candidates" column counts) —
    // rather than overwriting the vacancy's own fields with just the latest one.
    // The vacancy's overall pipeline stage is still kept in sync separately, since
    // that's a property of the hiring request, not of any one candidate.
    const handleTrackerSubmit = (payload) => {
        dispatch(addCandidateToVacancy({
            _id: vacancy._id,
            candidate: {
                id: `cand_${Date.now()}`,
                requestId: payload.requestId,
                name: payload.name,
                contact: payload.contact,
                email: payload.email,
                salaryExpectation: payload.salary,
                position: payload.position,
                location: payload.location,
                hrName: payload.hrName,
                stage: payload.stage,
                recruitmentSource: payload.source,
                division: payload.division,
                resumeFileName: payload.resumeFileName,
                remarks: payload.remarks,
                referredBy: payload.referredBy,
                referredByEmpId: payload.referredByEmpId,
                rating: payload.rating,
                nextScheduleDate: payload.nextDate,
                loggedOn: new Date().toISOString(),
            },
        }))
        dispatch(updateVacancy({ _id: vacancy._id, stage: payload.stage }))
    }

    // ---------- Step: New Recruitment (in-app Recruitment Tracker Form) ----------
    // Same centered-popup treatment as every other step in this modal, just a
    // wider dialog to fit the extra fields, with its own scroll.
    if (step === 'new-recruitment') {
        return createPortal(
            <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={close}>
                <div
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='new-recruitment-title'
                    className={`${modalPanel} max-w-2xl`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={modalHeader}>
                        <div className='min-w-0'>
                            <button onClick={() => setStep('menu')} className={`${backButton} -mt-1.5 mb-1`}>
                                <Icon className="fa-solid fa-arrow-left text-[11px]" />
                                Back
                            </button>
                            <p className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium text-slate-500'>
                                <span className='tabular-nums'>S.No {vacancy.jobId}</span>
                                <span className='inline-flex items-center gap-1'>
                                    <Icon className='fa-solid fa-location-dot text-[10px] text-slate-400' />{vacancy.branch}
                                </span>
                            </p>
                            <h2 id='new-recruitment-title' className={`${modalTitle} mt-0.5 text-lg`}>New recruitment — {vacancy.designation}</h2>
                        </div>
                        <button onClick={close} className={modalClose} aria-label='Close'>
                            <Icon className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    <div className='p-4 sm:p-5 overflow-y-auto'>
                        <RecruitmentTrackerForm
                            vacancy={vacancy}
                            hrName={user?.name || ''}
                            requestId={vacancy.jobId ? `REQ-${vacancy.jobId}` : ''}
                            onCancel={close}
                            onSubmit={handleTrackerSubmit}
                        />
                    </div>
                </div>
            </div>
        , document.body)
    }

    return createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={close}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='vacancy-update-title'
                className={`${modalPanel} max-w-md`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalHeader}>
                    <div className='min-w-0'>
                        <p className='text-xs font-medium text-slate-500 tabular-nums'>S.No {vacancy.jobId}</p>
                        <h2 id='vacancy-update-title' className={`${modalTitle} mt-0.5 text-lg`}>{vacancy.designation}</h2>
                        <div className='mt-2'><VacancyStatusBadge status={vacancy.status} /></div>
                    </div>
                    <button onClick={close} className={modalClose} aria-label='Close'>
                        <Icon className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div className='p-4 sm:p-5 overflow-y-auto'>
                    {/* ---------- Step 1: choose an update type ---------- */}
                    {step === 'menu' && (
                        <div className='space-y-2.5'>
                            {OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setStep(opt.key)}
                                    className='glass-panel lift press group flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left hover:border-[#cfdce5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
                                >
                                    <div aria-hidden='true' className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60 transition-colors group-hover:bg-[var(--brand-600)] group-hover:text-white'>
                                        <Icon className={`fa-solid ${opt.icon}`} />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-[var(--ink)]'>{opt.title}</p>
                                        <p className='text-[13px] text-slate-500'>{opt.desc}</p>
                                    </div>
                                    <Icon className="fa-solid fa-chevron-right text-slate-400 ml-auto text-xs shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ---------- Step: Postpone Timeline ---------- */}
                    {step === 'postpone' && (
                        <div>
                            <button onClick={() => setStep('menu')} className={`${backButton} mb-3`}>
                                <Icon className="fa-solid fa-arrow-left text-[11px]" />
                                Back
                            </button>

                            <p className='text-[15px] font-semibold text-[var(--ink)] mb-1'>Postpone timeline</p>
                            <p className='text-[13px] text-slate-500 mb-4'>
                                Current target date: <span className='font-medium text-slate-700 tabular-nums'>{vacancy.targetDate || '—'}</span>
                            </p>

                            <label htmlFor='vacancy-new-target-date' className={labelClass}>New target date <span className='text-red-500'>*</span></label>
                            <div className='mt-1.5'>
                                <DatePicker id='vacancy-new-target-date' value={newTargetDate} min={todayISO()} onChange={setNewTargetDate} placeholder='New target date' />
                            </div>
                            {newTargetDate && newTargetDate < todayISO() && (
                                <p className='text-[12px] text-red-600 flex items-center gap-1 mt-2'>
                                    <Icon className="fa-solid fa-circle-exclamation text-[11px]" />
                                    Date can't be before today. Please pick today or a later date.
                                </p>
                            )}

                            <div className='flex flex-wrap justify-end gap-2 mt-5'>
                                <button onClick={() => setStep('menu')} className={secondaryButton}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePostponeSave}
                                    disabled={!newTargetDate || newTargetDate < todayISO()}
                                    className={primaryButton}
                                >
                                    Save new date
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- Step: Closed Hiring ---------- */}
                    {step === 'closed' && (
                        <div>
                            <button onClick={() => setStep('menu')} className={`${backButton} mb-3`}>
                                <Icon className="fa-solid fa-arrow-left text-[11px]" />
                                Back
                            </button>

                            <div className='flex items-start gap-3 rounded-xl bg-amber-50/70 p-4 ring-1 ring-inset ring-amber-200'>
                                <Icon className="fa-solid fa-circle-exclamation text-amber-500 mt-0.5 shrink-0" />
                                <p className='text-sm text-slate-700'>
                                    Mark <span className='font-semibold'>{vacancy.designation}</span> ({vacancy.jobId}) as <span className='font-semibold'>Closed</span>?
                                    This hiring request will stop appearing as an open vacancy.
                                </p>
                            </div>

                            <div className='flex flex-wrap justify-end gap-2 mt-5'>
                                <button onClick={() => setStep('menu')} className={secondaryButton}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmClosed}
                                    disabled={saving}
                                    className={primaryButton}
                                >
                                    Yes, close hiring
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    , document.body)
}

export default VacancyUpdateModal
