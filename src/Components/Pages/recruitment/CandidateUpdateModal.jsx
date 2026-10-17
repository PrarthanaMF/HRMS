import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { updateCandidate } from '../../../Store/Redux/Recruitment/VacancySlice'
import FormField from '../../Common/FormField'
import SearchableSelect from '../../Common/SearchableSelect'
import FormSection from '../../Common/FormSection'
import { todayISO } from '../../../Utils/formatDate'
import { RECRUITMENT_STAGES, NEXT_DATE_STAGES, COMPANIES, FINAL_STATUSES, DECLINE_REASONS, JOINING_FORM_LINK, INTERVIEWERS } from '../../../Utils/mockRecruitment'
import { primaryButton, secondaryButton } from '../../Common/PageHeader'
import { stageBadgeClass, labelClass, modalPanel, modalHeader, modalTitle, modalClose } from './ui'

import Icon from '../../Common/Icon'
const MAX_FILE_BYTES = 10 * 1024 * 1024
const FIELD_ORDER = ['stage', 'remarks', 'nextDate', 'currentSalary', 'negotiable', 'remarksOfCandidate', 'interviewer', 'offerDate', 'joiningDate', 'company', 'declineReason', 'connectFuture', 'nextConnectDate', 'hiredCost', 'employeeId', 'joiningForm']

const ErrorText = ({ children }) => children ? (
    <p className='text-[12px] text-red-600 flex items-center gap-1'>
        <Icon className='fa-solid fa-circle-exclamation text-[10px]' />{children}
    </p>
) : null

// Update pop-up for one candidate from the Recruitment Tracker. Same pattern as the vacancy
// Update pop-up, minus the menu step — it opens straight into the Stage form, pre-filled
// with the candidate's current stage. The fields that follow depend on the stage picked:
//        Interview -> Next Schedule Date + Interview Update Section (current salary, negotiable,
//                     negotiable remarks, remarks of candidate, interviewer)
//        Final Round / On Hold -> Next Schedule Date
//        Offer -> Next Schedule Date + Offer Details (offer date, expected joining date, company)
//        Join  -> Offer Details + Joining Details (final status, hired cost, employee ID,
//                     joining form, KYB form)
//        Reject -> Reason for Decline (decline reason, whether to connect in future, next connect date)
//        Shortlist -> nothing extra, straight to submit
const CandidateUpdateModal = ({ candidate, onClose }) => {
    const dispatch = useDispatch()
    const [step, setStep] = useState('stage')
    const [errors, setErrors] = useState({})

    const [f, setF] = useState({
        stage: candidate.stage || '',
        remarks: '',
        nextDate: '',
        offerDate: candidate.offerDate || '',
        joiningDate: candidate.expectedJoiningDate || '',
        company: candidate.company || '',
        hiredCost: candidate.hiredCost || '',
        finalStatus: candidate.finalStatus || '',
        employeeId: candidate.employeeId || '',
        declineReason: candidate.declineReason || '',
        connectFuture: candidate.connectFuture || '',
        nextConnectDate: candidate.nextConnectDate || '',
        currentSalary: candidate.currentSalary || '',
        negotiable: candidate.negotiable || '',
        negotiableRemarks: candidate.negotiableRemarks || '',
        remarksOfCandidate: candidate.remarksOfCandidate || '',
        interviewer: candidate.interviewer || '',
    })
    const [joiningForm, setJoiningForm] = useState(null)
    const [kybForm, setKybForm] = useState(null)

    const showNext = NEXT_DATE_STAGES.includes(f.stage)
    const showInterview = f.stage === 'Interview'
    // Offer Details (offer date, joining date, company) only apply to the Offer stage itself —
    // by the time a candidate reaches Join, those were already captured when they were at Offer.
    const showOffer = f.stage === 'Offer'
    const showJoin = f.stage === 'Join'
    const showReject = f.stage === 'Reject'
    const showNextConnect = showReject && f.connectFuture === 'Yes'

    const set = (name, value) => {
        setF((s) => ({ ...s, [name]: value }))
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    }
    const onChange = (e) => set(e.target.name, e.target.value)

    const save = (changes, historyEntry) => {
        dispatch(updateCandidate({
            vacancyId: candidate.vacancyId,
            candidateId: candidate.id,
            changes,
            historyEntry: { id: `h_${Date.now()}`, at: new Date().toISOString(), ...historyEntry },
        }))
        onClose()
    }

    // Shared by any file field in this modal — pass which setter/error-key to update.
    const makeFileHandler = (setFile, errorKey) => (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > MAX_FILE_BYTES) {
            setErrors((er) => ({ ...er, [errorKey]: 'That file is larger than 10 MB. Please choose a smaller file.' }))
            e.target.value = ''
            setFile(null)
            return
        }
        setFile(file)
        setErrors((er) => ({ ...er, [errorKey]: undefined }))
    }
    const handleFile = makeFileHandler(setJoiningForm, 'joiningForm')
    const handleKybFile = makeFileHandler(setKybForm, 'kybForm')

    // ---------- 1. Stage ----------
    const validateStage = () => {
        const er = {}
        const today = todayISO()
        if (!f.stage) er.stage = 'This field is required'
        if (!f.remarks.trim()) er.remarks = 'This field is required'
        if (showNext) {
            if (!f.nextDate) er.nextDate = 'This field is required'
            else if (f.nextDate < today) er.nextDate = "Date can't be before today"
        }
        if (showInterview) {
            if (!f.currentSalary.trim()) er.currentSalary = 'This field is required'
            if (!f.negotiable) er.negotiable = 'This field is required'
            if (!f.remarksOfCandidate.trim()) er.remarksOfCandidate = 'This field is required'
            if (!f.interviewer) er.interviewer = 'This field is required'
        }
        if (showOffer) {
            if (!f.offerDate) er.offerDate = 'This field is required'
            if (!f.joiningDate) er.joiningDate = 'This field is required'
            else if (f.offerDate && f.joiningDate < f.offerDate) er.joiningDate = "Can't be before the offer date"
            if (!f.company) er.company = 'This field is required'
        }
        if (showJoin) {
            if (!f.hiredCost.trim()) er.hiredCost = 'This field is required'
            else if (!/^\d+(\.\d+)?$/.test(f.hiredCost.replace(/,/g, '').trim())) er.hiredCost = 'Enter the cost as a number'
            if (!f.employeeId.trim()) er.employeeId = 'This field is required'
            if (!joiningForm) er.joiningForm = 'Please upload the joining form (max 10 MB)'
        }
        if (showReject) {
            if (!f.declineReason) er.declineReason = 'This field is required'
            if (!f.connectFuture) er.connectFuture = 'This field is required'
            if (showNextConnect) {
                if (!f.nextConnectDate) er.nextConnectDate = 'This field is required'
                else if (f.nextConnectDate < today) er.nextConnectDate = "Date can't be before today"
            }
        }
        setErrors(er)
        return er
    }

    const submitStage = (e) => {
        e.preventDefault()
        const er = validateStage()
        const first = FIELD_ORDER.find((k) => er[k])
        if (first) {
            document.getElementById(`u-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }
        const changes = {
            stage: f.stage,
            remarks: f.remarks.trim(),
            // The date only applies to some stages — clear a stale one when moving to Join / Reject / Shortlist
            nextScheduleDate: showNext ? f.nextDate : '',
        }
        if (showInterview) Object.assign(changes, {
            currentSalary: f.currentSalary.trim(), negotiable: f.negotiable,
            negotiableRemarks: f.negotiableRemarks.trim(), remarksOfCandidate: f.remarksOfCandidate.trim(),
            interviewer: f.interviewer,
        })
        if (showOffer) Object.assign(changes, { offerDate: f.offerDate, expectedJoiningDate: f.joiningDate, company: f.company })
        if (showJoin) Object.assign(changes, {
            hiredCost: f.hiredCost.trim(), finalStatus: f.finalStatus,
            employeeId: f.employeeId.trim(), joiningFormFileName: joiningForm.name,
            kybFormFileName: kybForm ? kybForm.name : '',
        })
        if (showReject) Object.assign(changes, {
            declineReason: f.declineReason, connectFuture: f.connectFuture,
            nextConnectDate: showNextConnect ? f.nextConnectDate : '',
        })
        save(changes, { type: 'stage', stage: f.stage, remarks: changes.remarks, nextScheduleDate: changes.nextScheduleDate })
    }

    const footer = (label) => (
        <div className='flex flex-wrap justify-end gap-2 pt-4 mt-4 border-t border-slate-100'>
            <button type='button' onClick={onClose} className={secondaryButton}>
                Cancel
            </button>
            <button type='submit' className={primaryButton}>
                {label}
            </button>
        </div>
    )

    return createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={onClose}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='candidate-update-title'
                className={`${modalPanel} ${step === 'stage' ? 'max-w-2xl' : 'max-w-md'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalHeader}>
                    <div className='min-w-0'>
                        <p className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium text-slate-500'>
                            <span className='inline-flex items-center gap-1'>
                                <Icon className='fa-solid fa-briefcase text-[10px] text-slate-400' />{candidate.position || candidate.vacancyDesignation}
                            </span>
                            <span className='inline-flex items-center gap-1'>
                                <Icon className='fa-solid fa-location-dot text-[10px] text-slate-400' />{candidate.location || candidate.vacancyBranch}
                            </span>
                        </p>
                        <h2 id='candidate-update-title' className={`${modalTitle} mt-0.5 text-lg`}>{candidate.name}</h2>
                        <span className={`${stageBadgeClass(candidate.stage)} mt-2`}>
                            {candidate.stage || 'No stage'}
                        </span>
                    </div>
                    <button onClick={onClose} className={modalClose} aria-label='Close'>
                        <Icon className='fa-solid fa-xmark' />
                    </button>
                </div>

                <div className='p-4 sm:p-5 overflow-y-auto'>
                    {/* ---------- 1. Stage ---------- */}
                    {step === 'stage' && (
                        <form onSubmit={submitStage} noValidate>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div id='u-stage'>
                                        <SearchableSelect label='Stage' name='stage' value={f.stage} onChange={onChange}
                                            options={RECRUITMENT_STAGES} required error={errors.stage} />
                                    </div>
                                    {showNext && (
                                        <div id='u-nextDate'>
                                            <FormField label='Next schedule date' name='nextDate' type='date' min={todayISO()}
                                                value={f.nextDate} onChange={onChange} required error={errors.nextDate} />
                                        </div>
                                    )}
                                    <div id='u-remarks' className='md:col-span-2'>
                                        <FormField label='Remarks / reason / conversation' name='remarks' textarea
                                            value={f.remarks} onChange={onChange} required error={errors.remarks} />
                                    </div>
                                </div>

                                {showInterview && (
                                    <FormSection icon='fa-comments' title='Interview update' subtitle=''>
                                        <div id='u-currentSalary'>
                                            <FormField label='Current salary' name='currentSalary' value={f.currentSalary}
                                                onChange={onChange} required error={errors.currentSalary} />
                                        </div>

                                        <div id='u-negotiable' className='flex flex-col gap-1.5'>
                                            <label className={labelClass}>
                                                Negotiable <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='flex gap-4'>
                                                {['Yes', 'No'].map((opt) => (
                                                    <label key={opt} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='negotiable' checked={f.negotiable === opt}
                                                            onChange={() => set('negotiable', opt)} className='h-4 w-4 accent-[#1f4e6b]' />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorText>{errors.negotiable}</ErrorText>
                                        </div>

                                        <div id='u-negotiableRemarks'>
                                            <FormField label='Negotiable remarks' name='negotiableRemarks' value={f.negotiableRemarks}
                                                onChange={onChange} error={errors.negotiableRemarks} />
                                        </div>

                                        <div id='u-remarksOfCandidate'>
                                            <FormField label='Remarks of candidate' name='remarksOfCandidate' value={f.remarksOfCandidate}
                                                onChange={onChange} required error={errors.remarksOfCandidate} />
                                        </div>

                                        <div id='u-interviewer' className='md:col-span-2'>
                                            <SearchableSelect label='Interviewer' name='interviewer' value={f.interviewer} onChange={onChange}
                                                options={INTERVIEWERS} required error={errors.interviewer} placeholder='Choose' />
                                        </div>
                                    </FormSection>
                                )}

                                {showOffer && (
                                    <FormSection icon='fa-file-signature' title='Offer details' subtitle='If we offered'>
                                        <div id='u-offerDate'>
                                            <FormField label='Offer date' name='offerDate' type='date'
                                                value={f.offerDate} onChange={onChange} required error={errors.offerDate} />
                                        </div>
                                        <div id='u-joiningDate'>
                                            <FormField label='Expected date of joining' name='joiningDate' type='date' min={f.offerDate || undefined}
                                                value={f.joiningDate} onChange={onChange} required error={errors.joiningDate} />
                                        </div>
                                        <div id='u-company' className='md:col-span-2'>
                                            <SearchableSelect label='Company' name='company' value={f.company} onChange={onChange}
                                                options={COMPANIES} required error={errors.company} placeholder='Choose' />
                                        </div>
                                    </FormSection>
                                )}

                                {showJoin && (
                                    <FormSection icon='fa-user-check' title='Joining details' subtitle='If joined'>
                                        <div className='md:col-span-2 flex flex-col gap-1.5'>
                                            <label className={labelClass}>
                                                Final status <span className='text-slate-500 text-xs ml-1 font-normal'>(optional)</span>
                                            </label>
                                            <div className='flex flex-wrap gap-x-4'>
                                                {FINAL_STATUSES.map((s) => (
                                                    <label key={s} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='finalStatus' checked={f.finalStatus === s}
                                                            onChange={() => set('finalStatus', s)} className='h-4 w-4 accent-[#1f4e6b]' />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div id='u-hiredCost'>
                                            <FormField label='Hired cost' name='hiredCost' value={f.hiredCost}
                                                onChange={onChange} required error={errors.hiredCost} />
                                        </div>

                                        <div id='u-employeeId'>
                                            <FormField label='Employee ID' name='employeeId' value={f.employeeId}
                                                onChange={onChange} required error={errors.employeeId} />
                                            <p className='text-xs font-medium text-amber-700 mt-1.5 flex items-center gap-1'>
                                                <Icon className='fa-solid fa-triangle-exclamation text-[10px]' />
                                                This is very critical, check twice before you submit.
                                            </p>
                                        </div>

                                        <div id='u-joiningForm' className='flex flex-col gap-1.5'>
                                            <label className={labelClass}>
                                                Upload joining form <span className='text-red-500'>*</span>
                                            </label>
                                            {!joiningForm ? (
                                                <label className={`flex min-h-10 items-center gap-3 border border-dashed rounded-xl bg-white/80 px-3 py-2.5 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${errors.joiningForm ? 'border-red-300' : 'border-slate-300 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                                                    <Icon className='fa-solid fa-cloud-arrow-up text-slate-400' />
                                                    <span className='text-sm text-slate-600'><b className='text-[var(--brand-600)] font-semibold'>Add file</b> (1 file, max 10 MB)</span>
                                                    <input type='file' className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleFile} />
                                                </label>
                                            ) : (
                                                <div className='flex min-h-10 items-center justify-between gap-3 bg-white/80 border border-slate-200/80 rounded-xl pl-3 pr-1 py-1 text-sm'>
                                                    <span className='flex min-w-0 items-baseline gap-2'><span className='truncate text-slate-700'>{joiningForm.name}</span><span className='shrink-0 text-xs text-slate-500 tabular-nums'>{(joiningForm.size / (1024 * 1024)).toFixed(2)} MB</span></span>
                                                    <button type='button' onClick={() => setJoiningForm(null)} aria-label='Remove file'
                                                        className='press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'><Icon className='fa-solid fa-xmark text-xs' /></button>
                                                </div>
                                            )}
                                            <ErrorText>{errors.joiningForm}</ErrorText>
                                        </div>

                                        <div id='u-kybForm' className='flex flex-col gap-1.5'>
                                            <label className={labelClass}>
                                                KYB form <span className='text-slate-500 text-xs ml-1 font-normal'>(optional)</span>
                                            </label>
                                            {!kybForm ? (
                                                <label className={`flex min-h-10 items-center gap-3 border border-dashed rounded-xl bg-white/80 px-3 py-2.5 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#2b6485] ${errors.kybForm ? 'border-red-300' : 'border-slate-300 hover:border-[#cfdce5] hover:bg-[#f2f5f7]/60'}`}>
                                                    <Icon className='fa-solid fa-cloud-arrow-up text-slate-400' />
                                                    <span className='text-sm text-slate-600'><b className='text-[var(--brand-600)] font-semibold'>Add file</b> (1 file, max 10 MB)</span>
                                                    <input type='file' className='sr-only' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleKybFile} />
                                                </label>
                                            ) : (
                                                <div className='flex min-h-10 items-center justify-between gap-3 bg-white/80 border border-slate-200/80 rounded-xl pl-3 pr-1 py-1 text-sm'>
                                                    <span className='flex min-w-0 items-baseline gap-2'><span className='truncate text-slate-700'>{kybForm.name}</span><span className='shrink-0 text-xs text-slate-500 tabular-nums'>{(kybForm.size / (1024 * 1024)).toFixed(2)} MB</span></span>
                                                    <button type='button' onClick={() => setKybForm(null)} aria-label='Remove file'
                                                        className='press inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'><Icon className='fa-solid fa-xmark text-xs' /></button>
                                                </div>
                                            )}
                                            <ErrorText>{errors.kybForm}</ErrorText>
                                        </div>

                                        <div className='md:col-span-2 flex items-start gap-2 bg-amber-50 ring-1 ring-inset ring-amber-200 rounded-xl px-3 py-2.5'>
                                            <Icon className='fa-solid fa-circle-info text-amber-500 text-xs mt-0.5' />
                                            <p className='text-xs text-amber-800'>
                                                Please submit the Employee Joining Form:{' '}
                                                <a href={JOINING_FORM_LINK} target='_blank' rel='noreferrer' className='font-medium underline'>
                                                    {JOINING_FORM_LINK}
                                                </a>
                                            </p>
                                        </div>
                                    </FormSection>
                                )}

                                {showReject && (
                                    <FormSection icon='fa-user-xmark' title='Reason for decline' subtitle=''>
                                        <div id='u-declineReason' className='md:col-span-2'>
                                            <SearchableSelect label='Decline reasons' name='declineReason' value={f.declineReason} onChange={onChange}
                                                options={DECLINE_REASONS} required error={errors.declineReason} placeholder='Choose' />
                                        </div>

                                        <div id='u-connectFuture' className='flex flex-col gap-1.5 md:col-span-2'>
                                            <label className={labelClass}>
                                                Whether to connect this candidate in future <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='flex gap-4'>
                                                {['Yes', 'No'].map((opt) => (
                                                    <label key={opt} className='inline-flex min-h-10 items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='connectFuture' checked={f.connectFuture === opt}
                                                            onChange={() => set('connectFuture', opt)} className='h-4 w-4 accent-[#1f4e6b]' />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorText>{errors.connectFuture}</ErrorText>
                                        </div>

                                        {showNextConnect && (
                                            <div id='u-nextConnectDate'>
                                                <FormField label='Next connect date' name='nextConnectDate' type='date' min={todayISO()}
                                                    value={f.nextConnectDate} onChange={onChange} required error={errors.nextConnectDate} />
                                            </div>
                                        )}
                                    </FormSection>
                                )}
                            </div>
                            {footer('Submit')}
                        </form>
                    )}

                </div>
            </div>
        </div>
    , document.body)
}

export default CandidateUpdateModal