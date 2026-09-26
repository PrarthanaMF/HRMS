import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateCandidate } from '../../../Store/Redux/Recruitment/VacancySlice'
import FormField from '../../Common/FormField'
import SearchableSelect from '../../Common/SearchableSelect'
import FormSection from '../../Common/FormSection'
import { todayISO } from '../../../Utils/formatDate'
import { RECRUITMENT_STAGES, NEXT_DATE_STAGES, COMPANIES, FINAL_STATUSES, DECLINE_REASONS, JOINING_FORM_LINK, STAGE_STYLES, INTERVIEWERS } from '../../../Utils/mockRecruitment'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const FIELD_ORDER = ['stage', 'remarks', 'nextDate', 'currentSalary', 'negotiable', 'remarksOfCandidate', 'interviewer', 'offerDate', 'joiningDate', 'company', 'declineReason', 'connectFuture', 'nextConnectDate', 'hiredCost', 'employeeId', 'joiningForm']

const ErrorText = ({ children }) => children ? (
    <p className='text-[11px] text-red-600 flex items-center gap-1'>
        <i className='fa-solid fa-circle-exclamation text-[10px]'></i>{children}
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
        <div className='flex justify-end gap-2 pt-4 mt-1'>
            <button type='button' onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition'>
                Cancel
            </button>
            <button type='submit'
                className='px-4 py-2 text-sm font-semibold text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition'>
                {label}
            </button>
        </div>
    )

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className={`bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto transition-all ${step === 'stage' ? 'max-w-2xl' : 'max-w-md'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Banner */}
                <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-5'>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                        aria-label='Close'
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                    <p className='text-xs text-slate-300 mb-1'>{candidate.position || candidate.vacancyDesignation} · {candidate.location || candidate.vacancyBranch}</p>
                    <h2 className='text-lg font-bold text-white pr-10'>{candidate.name}</h2>
                    <span className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STAGE_STYLES[candidate.stage] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {candidate.stage || 'No stage'}
                    </span>
                </div>

                <div className='p-6'>
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
                                            <FormField label='Next Schedule Date' name='nextDate' type='date' min={todayISO()}
                                                value={f.nextDate} onChange={onChange} required error={errors.nextDate} />
                                        </div>
                                    )}
                                    <div id='u-remarks' className='md:col-span-2'>
                                        <FormField label='Remarks/Reason/Conversation' name='remarks' textarea
                                            value={f.remarks} onChange={onChange} required error={errors.remarks} />
                                    </div>
                                </div>

                                {showInterview && (
                                    <FormSection icon='fa-comments' title='Interview Update Section' subtitle=''>
                                        <div id='u-currentSalary'>
                                            <FormField label='Current Salary' name='currentSalary' value={f.currentSalary}
                                                onChange={onChange} required error={errors.currentSalary} />
                                        </div>

                                        <div id='u-negotiable' className='flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-slate-700'>
                                                Negotiable <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='flex gap-4 pt-1'>
                                                {['Yes', 'No'].map((opt) => (
                                                    <label key={opt} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='negotiable' checked={f.negotiable === opt}
                                                            onChange={() => set('negotiable', opt)} className='accent-[#062139]' />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorText>{errors.negotiable}</ErrorText>
                                        </div>

                                        <div id='u-negotiableRemarks'>
                                            <FormField label='Negotiable Remarks' name='negotiableRemarks' value={f.negotiableRemarks}
                                                onChange={onChange} error={errors.negotiableRemarks} />
                                        </div>

                                        <div id='u-remarksOfCandidate'>
                                            <FormField label='Remarks Of Candidate' name='remarksOfCandidate' value={f.remarksOfCandidate}
                                                onChange={onChange} required error={errors.remarksOfCandidate} />
                                        </div>

                                        <div id='u-interviewer' className='md:col-span-2'>
                                            <SearchableSelect label='Interviewer' name='interviewer' value={f.interviewer} onChange={onChange}
                                                options={INTERVIEWERS} required error={errors.interviewer} placeholder='Choose' />
                                        </div>
                                    </FormSection>
                                )}

                                {showOffer && (
                                    <FormSection icon='fa-file-signature' title='Offer Details' subtitle='If we offered'>
                                        <div id='u-offerDate'>
                                            <FormField label='Offer Date' name='offerDate' type='date'
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
                                    <FormSection icon='fa-user-check' title='Joining Details' subtitle='If joined'>
                                        <div className='md:col-span-2 flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-slate-700'>
                                                Final Status <span className='text-slate-400 text-[10px] ml-1 font-normal'>(optional)</span>
                                            </label>
                                            <div className='flex flex-wrap gap-x-4 gap-y-2 pt-1'>
                                                {FINAL_STATUSES.map((s) => (
                                                    <label key={s} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='finalStatus' checked={f.finalStatus === s}
                                                            onChange={() => set('finalStatus', s)} className='accent-[#062139]' />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div id='u-hiredCost'>
                                            <FormField label='Hired Cost' name='hiredCost' value={f.hiredCost}
                                                onChange={onChange} required error={errors.hiredCost} />
                                        </div>

                                        <div id='u-employeeId'>
                                            <FormField label='Employee ID' name='employeeId' value={f.employeeId}
                                                onChange={onChange} required error={errors.employeeId} />
                                            <p className='text-[11px] font-semibold text-amber-700 mt-1.5 flex items-center gap-1'>
                                                <i className='fa-solid fa-triangle-exclamation text-[10px]'></i>
                                                This is very critical, check twice before you submit.
                                            </p>
                                        </div>

                                        <div id='u-joiningForm' className='flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-slate-700'>
                                                Upload Joining Form <span className='text-red-500'>*</span>
                                            </label>
                                            {!joiningForm ? (
                                                <label className={`flex items-center gap-3 border border-dashed rounded-lg bg-white px-3 py-2.5 cursor-pointer transition ${errors.joiningForm ? 'border-red-300' : 'border-slate-300 hover:border-[#062139]'}`}>
                                                    <i className='fa-solid fa-cloud-arrow-up text-slate-400'></i>
                                                    <span className='text-sm text-slate-600'><b className='text-[#062139] font-medium'>Add file</b> (1 file, max 10 MB)</span>
                                                    <input type='file' className='hidden' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleFile} />
                                                </label>
                                            ) : (
                                                <div className='flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'>
                                                    <span className='truncate text-slate-700'>{joiningForm.name} · {(joiningForm.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                    <button type='button' onClick={() => setJoiningForm(null)} aria-label='Remove file'
                                                        className='text-slate-400 hover:text-slate-700 text-lg leading-none px-1'>&times;</button>
                                                </div>
                                            )}
                                            <ErrorText>{errors.joiningForm}</ErrorText>
                                        </div>

                                        <div id='u-kybForm' className='flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-slate-700'>
                                                KYB Form <span className='text-slate-400 text-[10px] ml-1 font-normal'>(optional)</span>
                                            </label>
                                            {!kybForm ? (
                                                <label className={`flex items-center gap-3 border border-dashed rounded-lg bg-white px-3 py-2.5 cursor-pointer transition ${errors.kybForm ? 'border-red-300' : 'border-slate-300 hover:border-[#062139]'}`}>
                                                    <i className='fa-solid fa-cloud-arrow-up text-slate-400'></i>
                                                    <span className='text-sm text-slate-600'><b className='text-[#062139] font-medium'>Add file</b> (1 file, max 10 MB)</span>
                                                    <input type='file' className='hidden' accept='.pdf,.doc,.docx,.jpg,.jpeg,.png' onChange={handleKybFile} />
                                                </label>
                                            ) : (
                                                <div className='flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm'>
                                                    <span className='truncate text-slate-700'>{kybForm.name} · {(kybForm.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                    <button type='button' onClick={() => setKybForm(null)} aria-label='Remove file'
                                                        className='text-slate-400 hover:text-slate-700 text-lg leading-none px-1'>&times;</button>
                                                </div>
                                            )}
                                            <ErrorText>{errors.kybForm}</ErrorText>
                                        </div>

                                        <div className='md:col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5'>
                                            <i className='fa-solid fa-circle-info text-amber-500 text-xs mt-0.5'></i>
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
                                    <FormSection icon='fa-user-xmark' title='Reason for Decline' subtitle=''>
                                        <div id='u-declineReason' className='md:col-span-2'>
                                            <SearchableSelect label='Decline reasons' name='declineReason' value={f.declineReason} onChange={onChange}
                                                options={DECLINE_REASONS} required error={errors.declineReason} placeholder='Choose' />
                                        </div>

                                        <div id='u-connectFuture' className='flex flex-col gap-1.5 md:col-span-2'>
                                            <label className='text-xs font-medium text-slate-700'>
                                                Whether to Connect This Candidate in Future <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='flex gap-4 pt-1'>
                                                {['Yes', 'No'].map((opt) => (
                                                    <label key={opt} className='inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer'>
                                                        <input type='radio' name='connectFuture' checked={f.connectFuture === opt}
                                                            onChange={() => set('connectFuture', opt)} className='accent-[#062139]' />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorText>{errors.connectFuture}</ErrorText>
                                        </div>

                                        {showNextConnect && (
                                            <div id='u-nextConnectDate'>
                                                <FormField label='Next Connect Date' name='nextConnectDate' type='date' min={todayISO()}
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
    )
}

export default CandidateUpdateModal