import React from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { selectExitById } from '../../../Store/Redux/ExitProcess/ExitSlice'
import { RatingPreview } from '../../Common/SuccessScreen'
import { primaryButton } from '../../Common/PageHeader'

import Icon from '../../Common/Icon'
// ============================================================
// Shared helpers
// ============================================================
const Card = ({ children, className = '', style }) => (
    <div className={`glass-panel rounded-2xl ${className}`} style={style}>{children}</div>
)

const SectionHeader = ({ title, icon, badge }) => (
    <div className='flex items-center gap-3 mb-4 pb-3 border-b border-slate-200/70'>
        <div aria-hidden='true' className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#E3EEF6] to-[#CFE2F0] text-[var(--brand-600)] ring-1 ring-inset ring-white flex items-center justify-center shrink-0'>
            <Icon className={`fa-solid ${icon} text-sm`} />
        </div>
        <h2 className='text-[15px] font-semibold text-[var(--ink)] flex-1 min-w-0'>{title}</h2>
        {badge}
    </div>
)

const CompletedBadge = () => (
    <span className='inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200'>
        <Icon className="fa-solid fa-check text-[10px]" />
        Completed
    </span>
)

const InfoGrid = ({ items, columns = 3 }) => {
    const gridCols =
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
    return (
        <dl className={`grid ${gridCols} gap-x-6 gap-y-4`}>
            {items.map((item, i) => (
                <div key={i} className={item.full ? 'sm:col-span-2 lg:col-span-3' : ''}>
                    <dt className='text-xs text-slate-500 mb-1'>{item.label}</dt>
                    <dd className={`text-sm text-slate-800 break-words ${item.mono ? 'font-mono text-xs tabular-nums' : ''}`}>{item.value || '—'}</dd>
                </div>
            ))}
        </dl>
    )
}

// Each status keeps its colour meaning; badges are tags (rounded-md + inset ring), not pills
const StatusBadge = ({ status, size = 'md' }) => {
    const styles = {
        'Pending HR': 'bg-amber-50 text-amber-800 ring-amber-200',
        'HR Reviewing': 'bg-blue-50 text-[#1f4e6b] ring-blue-200',
        'F&F Initiated': 'bg-indigo-50 text-indigo-800 ring-indigo-200',
        'F&F Pending': 'bg-violet-50 text-violet-800 ring-violet-200',
        'No Due Cleared': 'bg-teal-50 text-teal-800 ring-teal-200',
        'No Due Pending': 'bg-orange-50 text-orange-800 ring-orange-200',
        'Withdrawn': 'bg-slate-50 text-slate-600 ring-slate-200',
        'Exited': 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    }
    const dots = {
        'Pending HR': 'bg-amber-500', 'HR Reviewing': 'bg-blue-500', 'F&F Initiated': 'bg-indigo-500',
        'F&F Pending': 'bg-violet-500', 'No Due Cleared': 'bg-teal-500', 'No Due Pending': 'bg-orange-500',
        'Withdrawn': 'bg-slate-400', 'Exited': 'bg-emerald-500',
    }
    const sizing = size === 'lg' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[11px]'
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ring-inset whitespace-nowrap ${sizing} ${styles[status] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
            <span aria-hidden='true' className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`}></span>
            {status}
        </span>
    )
}

const Chip = ({ icon, text, mono = false }) => (
    <span className='glass inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-slate-600'>
        <Icon className={`fa-solid ${icon} text-slate-400 text-[11px]`} />
        <span className={mono ? 'font-mono tabular-nums' : ''}>{text}</span>
    </span>
)

// ============================================================
// Horizontal stepper
// ============================================================
const HorizontalStepper = ({ record }) => {
    const stages = [
        { key: 'stage0', label: 'Submitted', done: true },
        { key: 'stage1', label: 'HR acceptance', done: !!record.stage1 },
        { key: 'stage2', label: 'Decision', done: !!record.stage2 },
        { key: 'stage3', label: 'Exit interview', done: !!record.stage3 },
        { key: 'stage4', label: 'No due', done: !!record.stage4 },
        { key: 'stage5', label: 'F&F clearance', done: !!record.stage5 },
    ]
    return (
        // Scrolls inside its own box on phones so the page never scrolls sideways
        <div className='-mx-1 overflow-x-auto hide-scrollbar px-1'>
            <ol className='flex min-w-[540px] sm:min-w-0 pb-1'>
                {stages.map((s, i) => {
                    const isNext = !s.done && (i === 0 || stages[i - 1].done)
                    const nextDone = i < stages.length - 1 && stages[i + 1].done
                    return (
                        <li key={s.key} className='relative flex flex-1 flex-col items-center gap-2' aria-current={isNext ? 'step' : undefined}>
                            {i < stages.length - 1 && (
                                <span
                                    aria-hidden='true'
                                    className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-0.5 -translate-y-1/2 rounded-full ${
                                        nextDone ? 'bg-gradient-to-r from-[#1f4e6b] to-[#2b6485]' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                            <span className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors ${
                                s.done ? 'gradient-brand text-white shadow-[0_6px_14px_-8px_rgb(8_26_46/0.9)] ring-1 ring-white/30'
                                : isNext ? 'bg-white text-[var(--brand-600)] border-2 border-[#1f4e6b] ring-4 ring-[#2b6485]/20'
                                : 'bg-white/80 text-slate-400 border border-slate-200'
                            }`}>
                                {s.done ? <Icon className="fa-solid fa-check text-xs" /> : i + 1}
                                <span className='sr-only'>{s.done ? ' completed' : isNext ? ' current' : ' upcoming'}</span>
                            </span>
                            <span className={`px-1 text-center text-xs leading-tight ${
                                s.done ? 'font-medium text-slate-700' : isNext ? 'font-semibold text-[var(--ink)]' : 'text-slate-400'
                            }`}>{s.label}</span>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

// ============================================================
// Next action resolver
// ============================================================
const getNextAction = (record) => {
    switch (record.status) {
        case 'Pending HR':      return { label: 'Start HR acceptance',    icon: 'fa-check-circle',       stage: 1 }
        case 'HR Reviewing':    return { label: 'Start decision',         icon: 'fa-gavel',              stage: 2 }
        case 'F&F Initiated':   return { label: 'Start exit interview',   icon: 'fa-comment-dots',       stage: 3 }
        case 'F&F Pending':     return { label: 'Start no due clearance', icon: 'fa-clipboard-check',    stage: 4 }
        case 'No Due Cleared':  return { label: 'Start F&F clearance',    icon: 'fa-money-check-dollar', stage: 5 }
        case 'No Due Pending':  return { label: 'Start F&F clearance',    icon: 'fa-money-check-dollar', stage: 5 }
        default:                return null
    }
}

// ============================================================
// Sub-components
// ============================================================
const BackLink = ({ navigate }) => (
    <button
        type='button'
        onClick={() => navigate('/exit-process')}
        className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
    >
        <Icon className="fa-solid fa-arrow-left text-xs" />
        Back to exit dashboard
    </button>
)

const NotFound = ({ navigate }) => (
    <div className='w-full max-w-3xl mx-auto px-4 md:px-6 py-6'>
        <Card className='rise px-6 py-10 sm:p-12 text-center'>
            <span aria-hidden='true' className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-[#E3EEF6] text-slate-500 ring-1 ring-inset ring-white'>
                <Icon className="fa-solid fa-triangle-exclamation text-2xl" />
            </span>
            <h3 className='text-base font-semibold text-[var(--ink)] mb-1'>Record not found</h3>
            <p className='text-sm text-slate-500 mb-5'>This resignation record does not exist. Go back to the exit dashboard to open another one.</p>
            <button type='button' onClick={() => navigate('/exit-process')} className={`${primaryButton} cursor-pointer`}>Back to exit dashboard</button>
        </Card>
    </div>
)

const TerminalCard = ({ record }) => (
    <div className='flex h-10 items-center gap-2 px-4 rounded-xl bg-slate-100/80 ring-1 ring-inset ring-slate-200 text-slate-600 text-[13px] font-medium shrink-0'>
        <Icon className="fa-solid fa-lock text-xs" />
        Workflow {record.status === 'Exited' ? 'completed' : 'closed'}
    </div>
)

// ============================================================
// Main component: header card with chips and stepper
// ============================================================
const ExitDetailView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const record = useSelector(selectExitById(id))

    if (!record) return <NotFound navigate={navigate} />

    const initials = record.name
        ? record.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?'
    const nextAction = getNextAction(record)
    const isTerminal = record.status === 'Exited' || record.status === 'Withdrawn'

    return (
        <div className='w-full max-w-6xl mx-auto pb-24 lg:pb-6'>
            <BackLink navigate={navigate} />

            {/* ============================================================
                Header card
                ============================================================ */}
            <Card className='rise p-5 md:p-6 mb-4'>

                <div className='flex flex-col md:flex-row md:items-center gap-4 mb-5'>
                    <div aria-hidden='true' className='gradient-brand w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-semibold text-white shrink-0 shadow-[0_10px_24px_-12px_rgb(8_26_46/0.9)] ring-1 ring-white/20'>
                        {initials}
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap mb-1'>
                            <h1 className='text-[22px] font-semibold leading-tight text-[var(--ink)] truncate'>{record.name}</h1>
                            <StatusBadge status={record.status} size='lg' />
                        </div>
                        <p className='text-[13px] text-slate-500 truncate'>{record.designation}, {record.department}</p>
                    </div>

                    {nextAction && (
                        <div className='hidden md:block shrink-0'>
                            <button
                                type='button'
                                onClick={() => navigate(`/exit-process/records/${record._id}/stage-${nextAction.stage}`)}
                                className={`${primaryButton} px-5 cursor-pointer`}
                            >
                                <Icon className={`fa-solid ${nextAction.icon} text-sm`} />
                                {nextAction.label}
                            </button>
                        </div>
                    )}

                    {isTerminal && (
                        <div className='hidden md:block'>
                            <TerminalCard record={record} />
                        </div>
                    )}
                </div>

                {/* Chips */}
                <div className='flex flex-wrap gap-2 mb-5'>
                    <Chip icon='fa-id-badge' text={record.empId} mono />
                    <Chip icon='fa-location-dot' text={record.branch} />
                    <Chip icon='fa-map-pin' text={record.location} />
                    <Chip icon='fa-building' text={record.division} />
                    <Chip icon='fa-calendar-days' text={`Resigned on ${record.resignationDate}`} />
                    <Chip icon='fa-calendar-check' text={`Last day ${record.lastWorkingDate}`} />
                    <Chip icon='fa-clock' text={record.noticePeriod} />
                </div>

                {/* Stepper */}
                <div className='pt-4 border-t border-slate-200/70'>
                    <h2 className='text-[13px] font-semibold text-slate-700 mb-3'>Workflow progress</h2>
                    <HorizontalStepper record={record} />
                </div>

            </Card>

            {/* ============================================================
                Content sections
                ============================================================ */}
            <div className='space-y-4'>

                {/* Employee Information */}
                <Card className='p-5 md:p-6'>
                    <SectionHeader title='Employee information' icon='fa-user' />
                    <InfoGrid items={[
                        { label: 'Employee ID', value: record.empId, mono: true },
                        { label: 'Name', value: record.name },
                        { label: 'Email', value: record.email },
                        { label: 'Phone', value: record.phone },
                        { label: 'Branch', value: record.branch },
                        { label: 'Location', value: record.location },
                        { label: 'Department', value: record.department },
                        { label: 'Division', value: record.division },
                        { label: 'Designation', value: record.designation },
                    ]} columns={3} />
                </Card>

                {/* Reporting */}
                <Card className='p-5 md:p-6'>
                    <SectionHeader title='Reporting structure' icon='fa-sitemap' />
                    <InfoGrid items={[
                        { label: 'Reporting manager', value: record.reportingManager },
                        { label: 'RM contact', value: record.reportingManagerContact, mono: true },
                        { label: 'Division head', value: record.divisionHead },
                        { label: 'DH contact', value: record.divisionHeadContact, mono: true },
                    ]} columns={2} />
                </Card>

                {/* Resignation Details */}
                <Card className='p-5 md:p-6'>
                    <SectionHeader title='Resignation details' icon='fa-file-signature' />
                    <InfoGrid items={[
                        { label: 'Resignation date', value: record.resignationDate },
                        { label: 'Expected last working date', value: record.lastWorkingDate },
                        { label: 'Notice period', value: record.noticePeriod },
                        { label: 'Removal type', value: record.removalType },
                        { label: 'Reason for resignation', value: record.reason, full: true },
                    ]} columns={3} />
                </Card>

                {/* Stage 1 */}
                {record.stage1 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 1: Employee acceptance of withdrawal' icon='fa-check-circle'
                            badge={<CompletedBadge />} />
                        <InfoGrid items={[
                            { label: 'Accepted withdrawal', value: record.stage1.employeeAcceptedWithdrawal },
                            { label: 'Submitted at', value: record.stage1.submittedAt },
                            ...(record.stage1.emailScreenshot ? [{ label: 'Email screenshot', value: record.stage1.emailScreenshot.name }] : []),
                            { label: 'Remarks', value: record.stage1.remarks, full: true },
                        ]} columns={2} />
                    </Card>
                )}

                {/* Stage 2 */}
                {record.stage2 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 2: Decision of resignation' icon='fa-gavel'
                            badge={<CompletedBadge />} />
                        <InfoGrid items={[
                            { label: 'Send F&F', value: record.stage2.sendFNF },
                            { label: 'Last working date', value: record.stage2.lastWorkingDate },
                            { label: 'Date of F&F', value: record.stage2.dateOfFNF },
                            { label: 'Submitted at', value: record.stage2.submittedAt },
                            { label: 'Feedback about the employee', value: record.stage2.feedbackAboutEmployee, full: true },
                        ]} columns={3} />
                    </Card>
                )}

                {/* Stage 3 */}
                {record.stage3 && (
                    <>
                        <Card className='p-5 md:p-6'>
                            <SectionHeader title='Stage 3: Exit interview feedback' icon='fa-comment-dots'
                                badge={<CompletedBadge />} />
                            <InfoGrid items={[
                                { label: 'Duties met expectations', value: record.stage3.dutiesMetExpectations },
                                { label: 'Removed from WhatsApp groups', value: record.stage3.removedFromWhatsappGroup },
                                { label: 'Submitted at', value: record.stage3.submittedAt },
                                { label: 'What prevented departure?', value: record.stage3.preventDepartureAnswer, full: true },
                                { label: 'Liked most', value: record.stage3.likedMost, full: true },
                                { label: 'Liked least', value: record.stage3.likedLeast, full: true },
                                { label: 'New company attraction', value: record.stage3.newCompanyAttraction, full: true },
                                { label: 'Suggestions', value: record.stage3.suggestions, full: true },
                                { label: 'Remarks', value: record.stage3.remarks, full: true },
                            ]} columns={3} />
                        </Card>

                        {record.stage3.reportingManagerRatings && (
                            <Card className='p-5 md:p-6'>
                                <SectionHeader title='Reporting manager ratings' icon='fa-user-tie' />
                                <div className='space-y-0'>
                                    <RatingPreview label='Recognition in your job?' value={record.stage3.reportingManagerRatings.recognition} />
                                    <RatingPreview label='Regular feedback on performance' value={record.stage3.reportingManagerRatings.regularFeedback} />
                                    <RatingPreview label='Resolved complaints & concerns promptly' value={record.stage3.reportingManagerRatings.promptResolutions} />
                                    <RatingPreview label='Equitable treatment (impartial)' value={record.stage3.reportingManagerRatings.equitableTreatment} />
                                    <RatingPreview label='Upgraded knowledge & development interest' value={record.stage3.reportingManagerRatings.knowledgeUpgrade} />
                                    <RatingPreview label='Encouraged feedback & suggestions' value={record.stage3.reportingManagerRatings.encouragedFeedback} />
                                    <RatingPreview label='Provided leadership' value={record.stage3.reportingManagerRatings.providedLeadership} />
                                </div>
                            </Card>
                        )}

                        {record.stage3.companyRatings && (
                            <Card className='p-5 md:p-6'>
                                <SectionHeader title='Company ratings' icon='fa-building' />
                                <div className='space-y-0'>
                                    <RatingPreview label="Performance review system" value={record.stage3.companyRatings.performanceReviewSystem} />
                                    <RatingPreview label="Induction program" value={record.stage3.companyRatings.inductionProgram} />
                                    <RatingPreview label='Rate of pay for your job role' value={record.stage3.companyRatings.payRate} />
                                    <RatingPreview label='Career development opportunities' value={record.stage3.companyRatings.careerDevelopment} />
                                    <RatingPreview label='Work environment and timing' value={record.stage3.companyRatings.workEnvironment} />
                                    <RatingPreview label="Sensitive to employees' needs" value={record.stage3.companyRatings.sensitiveToNeeds} />
                                    <RatingPreview label='Administration' value={record.stage3.companyRatings.administration} />
                                    <RatingPreview label='Duties and responsibilities' value={record.stage3.companyRatings.duties} />
                                    <RatingPreview label='Employee benefit facilities' value={record.stage3.companyRatings.benefits} />
                                    <RatingPreview label='Keeping employee informed' value={record.stage3.companyRatings.employeeInforming} />
                                    <RatingPreview label='Treating employee fairly' value={record.stage3.companyRatings.fairTreatment} />
                                    <RatingPreview label='Cooperation within department' value={record.stage3.companyRatings.cooperation} />
                                    <RatingPreview label='Recommend for job openings' value={record.stage3.companyRatings.recommendation} />
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* Stage 4 */}
                {record.stage4 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 4: No due clearance' icon='fa-clipboard-check'
                            badge={<CompletedBadge />} />
                        <InfoGrid items={[
                            { label: 'Due status', value: record.stage4.dueStatus },
                            { label: 'Submitted at', value: record.stage4.submittedAt },
                            ...(record.stage4.noDueFormAttachments?.length > 0 ? [{ label: 'Attachments', value: `${record.stage4.noDueFormAttachments.length} file(s) attached` }] : []),
                            { label: 'Remarks', value: record.stage4.noDueRemarks, full: true },
                        ]} columns={3} />
                    </Card>
                )}

                {/* Stage 5 */}
                {record.stage5 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 5: F&F clearance' icon='fa-money-check-dollar'
                            badge={<CompletedBadge />} />
                        <InfoGrid items={[
                            { label: 'Generate F&F', value: record.stage5.generateFNF },
                            { label: 'Generate letters', value: record.stage5.generateLetters },
                            { label: 'Submitted at', value: record.stage5.submittedAt },
                            { label: 'Remarks', value: record.stage5.remarks, full: true },
                        ]} columns={3} />
                    </Card>
                )}

            </div>

            {/* Mobile sticky action bar: stays at the page root so no glass card's backdrop-filter traps it */}
            {nextAction && (
                <div className='lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/70 shadow-[0_-10px_24px_-16px_rgb(11_27_43/0.35)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
                    <button
                        type='button'
                        onClick={() => navigate(`/exit-process/records/${record._id}/stage-${nextAction.stage}`)}
                        className={`${primaryButton} w-full h-11 px-5 cursor-pointer`}
                    >
                        <Icon className={`fa-solid ${nextAction.icon} text-sm`} />
                        {nextAction.label}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ExitDetailView
