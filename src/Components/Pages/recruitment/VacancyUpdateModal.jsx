import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateVacancy, addCandidateToVacancy } from '../../../Store/Redux/Recruitment/VacancySlice'
import VacancyStatusBadge from './VacancyStatusBadge'
import RecruitmentTrackerForm from './RecruitmentTrackerForm'
import { todayISO } from '../../../Utils/formatDate'

const OPTIONS = [
    {
        key: 'postpone',
        icon: 'fa-calendar-days',
        title: 'Postpone Timeline',
        desc: 'Push the target hiring date to a new deadline.',
    },
    {
        key: 'new-recruitment',
        icon: 'fa-user-plus',
        title: 'New Recruitment',
        desc: 'Open the candidate application form for this position.',
    },
    {
        key: 'closed',
        icon: 'fa-circle-check',
        title: 'Closed Hiring',
        desc: 'Mark this hiring request as closed.',
    },
]

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
        return (
            <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={close}>
                <div
                    className='bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all'
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Banner */}
                    <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-5'>
                        <button
                            onClick={() => setStep('menu')}
                            className='flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white mb-2'
                        >
                            <i className="fa-solid fa-arrow-left text-[10px]"></i>
                            Back
                        </button>
                        <button
                            onClick={close}
                            className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                            aria-label='Close'
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <p className='font-mono text-xs text-slate-300 mb-1'>S.No {vacancy.jobId} · {vacancy.branch}</p>
                        <h2 className='text-lg font-bold text-white pr-10'>New Recruitment — {vacancy.designation}</h2>
                    </div>

                    <div className='p-6'>
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
        )
    }

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={close}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner */}
                <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-5'>
                    <button
                        onClick={close}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <p className='font-mono text-xs text-slate-300 mb-1'>S.No {vacancy.jobId}</p>
                    <h2 className='text-lg font-bold text-white pr-10'>{vacancy.designation}</h2>
                    <div className='mt-2'><VacancyStatusBadge status={vacancy.status} /></div>
                </div>

                <div className='p-6'>
                    {/* ---------- Step 1: choose an update type ---------- */}
                    {step === 'menu' && (
                        <div className='space-y-3'>
                            {OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setStep(opt.key)}
                                    className='w-full flex items-center gap-3.5 text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#062139] hover:bg-slate-50 transition group'
                                >
                                    <div className='w-10 h-10 shrink-0 rounded-lg bg-slate-100 group-hover:bg-[#062139] flex items-center justify-center transition'>
                                        <i className={`fa-solid ${opt.icon} text-slate-500 group-hover:text-white transition`}></i>
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-slate-800'>{opt.title}</p>
                                        <p className='text-xs text-slate-500 truncate'>{opt.desc}</p>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-xs shrink-0"></i>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ---------- Step: Postpone Timeline ---------- */}
                    {step === 'postpone' && (
                        <div>
                            <button
                                onClick={() => setStep('menu')}
                                className='flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 mb-4'
                            >
                                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                Back
                            </button>

                            <p className='text-sm font-semibold text-slate-800 mb-1'>Postpone Timeline</p>
                            <p className='text-xs text-slate-500 mb-4'>
                                Current target date: <span className='font-medium text-slate-700'>{vacancy.targetDate || '—'}</span>
                            </p>

                            <label className='text-xs font-medium text-slate-700'>New Target Date <span className='text-red-500'>*</span></label>
                            <input
                                type='date'
                                value={newTargetDate}
                                onChange={(e) => setNewTargetDate(e.target.value)}
                                min={todayISO()}
                                className='mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
                            />
                            {newTargetDate && newTargetDate < todayISO() && (
                                <p className='text-[11px] text-red-600 flex items-center gap-1 mt-2'>
                                    <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                                    Date can't be before today. Please pick today or a later date.
                                </p>
                            )}

                            <div className='flex justify-end gap-2 mt-5'>
                                <button
                                    onClick={() => setStep('menu')}
                                    className='px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePostponeSave}
                                    disabled={!newTargetDate || newTargetDate < todayISO()}
                                    className='px-4 py-2 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition'
                                >
                                    Save New Date
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- Step: Closed Hiring ---------- */}
                    {step === 'closed' && (
                        <div>
                            <button
                                onClick={() => setStep('menu')}
                                className='flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 mb-4'
                            >
                                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                Back
                            </button>

                            <div className='flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4'>
                                <i className="fa-solid fa-circle-exclamation text-amber-500 mt-0.5"></i>
                                <p className='text-sm text-slate-700'>
                                    Mark <span className='font-semibold'>{vacancy.designation}</span> ({vacancy.jobId}) as <span className='font-semibold'>Closed</span>?
                                    This hiring request will stop appearing as an open vacancy.
                                </p>
                            </div>

                            <div className='flex justify-end gap-2 mt-5'>
                                <button
                                    onClick={() => setStep('menu')}
                                    className='px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmClosed}
                                    disabled={saving}
                                    className='px-4 py-2 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] disabled:opacity-40 rounded-lg transition'
                                >
                                    Yes, Close Hiring
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VacancyUpdateModal