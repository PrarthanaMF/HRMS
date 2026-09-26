import React from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { selectExitById } from '../../../Store/Redux/ExitProcess/ExitSlice'

// ============================================================
// Shared helpers
// ============================================================
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
)

const SectionHeader = ({ title, icon, badge }) => (
    <div className='flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100'>
        <div className='w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0'>
            <i className={`fa-solid ${icon} text-slate-500 text-xs`}></i>
        </div>
        <h4 className='text-sm font-bold text-slate-800 flex-1'>{title}</h4>
        {badge}
    </div>
)

const InfoGrid = ({ items, columns = 3 }) => {
    const gridCols =
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
    return (
        <div className={`grid ${gridCols} gap-x-6 gap-y-4`}>
            {items.map((item, i) => (
                <div key={i} className={item.full ? 'sm:col-span-2 lg:col-span-3' : ''}>
                    <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide mb-1'>{item.label}</p>
                    <p className={`text-sm text-slate-700 break-words ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value || '—'}</p>
                </div>
            ))}
        </div>
    )
}

const StatusBadge = ({ status, size = 'md' }) => {
    const styles = {
        'Pending HR': 'bg-amber-50 text-amber-700 border-amber-200',
        'HR Reviewing': 'bg-blue-50 text-blue-700 border-blue-200',
        'F&F Initiated': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'F&F Pending': 'bg-purple-50 text-purple-700 border-purple-200',
        'No Due Cleared': 'bg-teal-50 text-teal-700 border-teal-200',
        'Withdrawn': 'bg-slate-100 text-slate-600 border-slate-200',
        'Exited': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
    const dots = {
        'Pending HR': 'bg-amber-500', 'HR Reviewing': 'bg-blue-500', 'F&F Initiated': 'bg-indigo-500',
        'F&F Pending': 'bg-purple-500', 'No Due Cleared': 'bg-teal-500', 'Withdrawn': 'bg-slate-400', 'Exited': 'bg-emerald-500',
    }
    const sizing = size === 'lg' ? 'px-3 py-1 text-[11px]' : 'px-2.5 py-0.5 text-[10px]'
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border whitespace-nowrap ${sizing} ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`}></span>
            {status}
        </span>
    )
}

const RatingRow = ({ label, value }) => (
    <div className='flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0'>
        <p className='text-xs text-slate-600 flex-1'>{label}</p>
        <div className='flex items-center gap-0.5 shrink-0'>
            {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className={`fa-solid fa-star text-[10px] ${star <= value ? 'text-amber-400' : 'text-slate-200'}`}></i>
            ))}
            <span className='text-[11px] text-slate-500 ml-1.5 font-medium'>{value}/5</span>
        </div>
    </div>
)

const Chip = ({ icon, text, mono = false }) => (
    <span className='inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full'>
        <i className={`fa-solid ${icon} text-slate-400 text-[10px]`}></i>
        <span className={mono ? 'font-mono' : ''}>{text}</span>
    </span>
)

// ============================================================
// Horizontal stepper (all 6 stages)
// ============================================================
const HorizontalStepper = ({ record }) => {
    const stages = [
        { key: 'stage0', label: 'Submitted', done: true },
        { key: 'stage1', label: 'HR Acceptance', done: !!record.stage1 },
        { key: 'stage2', label: 'Decision', done: !!record.stage2 },
        { key: 'stage3', label: 'Exit Interview', done: !!record.stage3 },
        { key: 'stage4', label: 'No Due', done: !!record.stage4 },
        { key: 'stage5', label: 'F&F Clearance', done: !!record.stage5 },
    ]
    return (
        <div className='overflow-x-auto hide-scrollbar'>
            <div className='flex items-center min-w-max pb-2'>
                {stages.map((s, i) => {
                    const isNext = !s.done && (i === 0 || stages[i - 1].done)
                    return (
                        <React.Fragment key={s.key}>
                            <div className='flex flex-col items-center gap-2 shrink-0'>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition ${
                                    s.done ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isNext ? 'bg-[#062139] border-[#062139] text-white'
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}>
                                    {s.done ? <i className="fa-solid fa-check text-[10px]"></i> : i + 1}
                                </div>
                                <p className={`text-[10px] font-medium whitespace-nowrap ${
                                    s.done ? 'text-slate-800' : isNext ? 'text-[#062139] font-semibold' : 'text-slate-400'
                                }`}>{s.label}</p>
                            </div>
                            {i < stages.length - 1 && (
                                <div className={`h-0.5 w-6 md:w-12 shrink-0 mb-6 mx-1 ${
                                    stages[i + 1].done ? 'bg-emerald-500' : 'bg-slate-200'
                                }`} />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

// ============================================================
// Next action resolver
// ============================================================
const getNextAction = (record) => {
    switch (record.status) {
        case 'Pending HR':      return { label: 'Start HR Acceptance',    icon: 'fa-check-circle',       stage: 1 }
        case 'HR Reviewing':    return { label: 'Start Decision',         icon: 'fa-gavel',              stage: 2 }
        case 'F&F Initiated':   return { label: 'Start Exit Interview',   icon: 'fa-comment-dots',       stage: 3 }
        case 'F&F Pending':     return { label: 'Start No Due Clearance', icon: 'fa-clipboard-check',    stage: 4 }
        case 'No Due Cleared':  return { label: 'Start F&F Clearance',    icon: 'fa-money-check-dollar', stage: 5 }
        default:                return null
    }
}

// ============================================================
// Sub-components
// ============================================================
const BackLink = ({ navigate }) => (
    <button onClick={() => navigate('/exit-process')} className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'>
        <i className="fa-solid fa-arrow-left text-xs"></i>
        Back to Exit Dashboard
    </button>
)

const NotFound = ({ navigate }) => (
    <div className='w-full max-w-3xl mx-auto px-4 md:px-6 py-6'>
        <Card className='p-12 text-center'>
            <i className="fa-solid fa-triangle-exclamation text-4xl text-slate-300 mb-3"></i>
            <h3 className='text-base font-bold text-slate-700 mb-1'>Record Not Found</h3>
            <p className='text-sm text-slate-500 mb-4'>This resignation record does not exist.</p>
            <button onClick={() => navigate('/exit-process')} className='px-5 py-2.5 text-sm font-medium text-white bg-[#062139] hover:bg-[#0a2f52] rounded-lg transition cursor-pointer'>Back to Exit Dashboard</button>
        </Card>
    </div>
)

const TerminalCard = ({ record }) => (
    <div className='flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium shrink-0'>
        <i className="fa-solid fa-lock text-xs"></i>
        Workflow {record.status === 'Exited' ? 'Completed' : 'Closed'}
    </div>
)

// ============================================================
// Main component — Design 2
// ============================================================
const ExitDetailView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const record = useSelector(selectExitById(id))

    if (!record) return <NotFound navigate={navigate} />

    const initials = record.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const nextAction = getNextAction(record)
    const isTerminal = record.status === 'Exited' || record.status === 'Withdrawn'

    return (
        <div className='w-full max-w-6xl mx-auto pb-24 lg:pb-6'>
            <BackLink navigate={navigate} />

            {/* ============================================================
                Header Bar — profile + chips + stepper
                ============================================================ */}
            <Card className='p-5 md:p-6 mb-4'>

                {/* Top row: avatar + name + action button */}
                <div className='flex flex-col md:flex-row md:items-center gap-4 mb-5'>
                    <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm'>
                        {initials}
                    </div>

                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap mb-1'>
                            <h1 className='text-xl font-bold text-slate-800 truncate'>{record.name}</h1>
                            <StatusBadge status={record.status} size='lg' />
                        </div>
                        <p className='text-sm text-slate-500 truncate'>{record.designation} · {record.department}</p>
                    </div>

                    {nextAction && (
                        <button
                            onClick={() => navigate(`/exit-process/records/${record._id}/stage-${nextAction.stage}`)}
                            className='hidden md:flex items-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md cursor-pointer shrink-0'
                        >
                            <i className={`fa-solid ${nextAction.icon} text-xs`}></i>
                            {nextAction.label}
                        </button>
                    )}

                    {isTerminal && (
                        <div className='hidden md:block'>
                            <TerminalCard record={record} />
                        </div>
                    )}
                </div>

                {/* Quick chips */}
                <div className='flex flex-wrap gap-2 mb-5'>
                    <Chip icon='fa-id-badge' text={record.empId} mono />
                    <Chip icon='fa-location-dot' text={record.branch} />
                    <Chip icon='fa-map-pin' text={record.location} />
                    <Chip icon='fa-building' text={record.division} />
                    <Chip icon='fa-calendar-days' text={`Resigned: ${record.resignationDate}`} />
                    <Chip icon='fa-calendar-check' text={`Last Day: ${record.lastWorkingDate}`} />
                    <Chip icon='fa-clock' text={record.noticePeriod} />
                </div>

                {/* Horizontal stepper */}
                <div className='pt-4 border-t border-slate-100'>
                    <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide mb-3'>Workflow Progress</p>
                    <HorizontalStepper record={record} />
                </div>

            </Card>

            {/* ============================================================
                Content sections
                ============================================================ */}
            <div className='space-y-4'>

                {/* Employee Information */}
                <Card className='p-5 md:p-6'>
                    <SectionHeader title='Employee Information' icon='fa-user' />
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
                    <SectionHeader title='Reporting Structure' icon='fa-sitemap' />
                    <InfoGrid items={[
                        { label: 'Reporting Manager', value: record.reportingManager },
                        { label: 'RM Contact', value: record.reportingManagerContact, mono: true },
                        { label: 'Division Head', value: record.divisionHead },
                        { label: 'DH Contact', value: record.divisionHeadContact, mono: true },
                    ]} columns={2} />
                </Card>

                {/* Resignation Details */}
                <Card className='p-5 md:p-6'>
                    <SectionHeader title='Resignation Details' icon='fa-file-signature' />
                    <InfoGrid items={[
                        { label: 'Resignation Date', value: record.resignationDate },
                        { label: 'Expected Last Working Date', value: record.lastWorkingDate },
                        { label: 'Notice Period', value: record.noticePeriod },
                        { label: 'Removal Type', value: record.removalType },
                        { label: 'Reason for Resignation', value: record.reason, full: true },
                    ]} columns={3} />
                </Card>

                {/* Stage 1 */}
                {record.stage1 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 1 — Employee Acceptance of Withdrawal' icon='fa-check-circle'
                            badge={<span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'>Completed</span>} />
                        <InfoGrid items={[
                            { label: 'Accepted Withdrawal', value: record.stage1.employeeAcceptedWithdrawal },
                            { label: 'Submitted At', value: record.stage1.submittedAt },
                            ...(record.stage1.emailScreenshot ? [{ label: 'Email Screenshot', value: record.stage1.emailScreenshot.name }] : []),
                            { label: 'Remarks', value: record.stage1.remarks, full: true },
                        ]} columns={2} />
                    </Card>
                )}

                {/* Stage 2 */}
                {record.stage2 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 2 — Decision of Resignation' icon='fa-gavel'
                            badge={<span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'>Completed</span>} />
                        <InfoGrid items={[
                            { label: 'Send F&F', value: record.stage2.sendFNF },
                            { label: 'Last Working Date', value: record.stage2.lastWorkingDate },
                            { label: 'Date of F&F', value: record.stage2.dateOfFNF },
                            { label: 'Submitted At', value: record.stage2.submittedAt },
                            { label: 'Feedback About Employee', value: record.stage2.feedbackAboutEmployee, full: true },
                        ]} columns={3} />
                    </Card>
                )}

                {/* Stage 3 */}
                {record.stage3 && (
                    <>
                        <Card className='p-5 md:p-6'>
                            <SectionHeader title='Stage 3 — Exit Interview Feedback' icon='fa-comment-dots'
                                badge={<span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'>Completed</span>} />
                            <InfoGrid items={[
                                { label: 'Duties Met Expectations', value: record.stage3.dutiesMetExpectations },
                                { label: 'Removed from WhatsApp', value: record.stage3.removedFromWhatsappGroup },
                                { label: 'Submitted At', value: record.stage3.submittedAt },
                                { label: 'What prevented departure?', value: record.stage3.preventDepartureAnswer, full: true },
                                { label: 'Liked Most', value: record.stage3.likedMost, full: true },
                                { label: 'Liked Least', value: record.stage3.likedLeast, full: true },
                                { label: 'New Company Attraction', value: record.stage3.newCompanyAttraction, full: true },
                                { label: 'Suggestions', value: record.stage3.suggestions, full: true },
                                { label: 'Remarks', value: record.stage3.remarks, full: true },
                            ]} columns={3} />
                        </Card>

                        {record.stage3.reportingManagerRatings && (
                            <Card className='p-5 md:p-6'>
                                <SectionHeader title='Reporting Manager Ratings' icon='fa-user-tie' />
                                <div className='space-y-0'>
                                    <RatingRow label='Recognition in your job?' value={record.stage3.reportingManagerRatings.recognition} />
                                    <RatingRow label='Regular feedback on performance' value={record.stage3.reportingManagerRatings.regularFeedback} />
                                    <RatingRow label='Resolved complaints & concerns promptly' value={record.stage3.reportingManagerRatings.promptResolutions} />
                                    <RatingRow label='Equitable treatment (impartial)' value={record.stage3.reportingManagerRatings.equitableTreatment} />
                                    <RatingRow label='Upgraded knowledge & development interest' value={record.stage3.reportingManagerRatings.knowledgeUpgrade} />
                                    <RatingRow label='Encouraged feedback & suggestions' value={record.stage3.reportingManagerRatings.encouragedFeedback} />
                                    <RatingRow label='Provided leadership' value={record.stage3.reportingManagerRatings.providedLeadership} />
                                </div>
                            </Card>
                        )}

                        {record.stage3.companyRatings && (
                            <Card className='p-5 md:p-6'>
                                <SectionHeader title='Company Ratings' icon='fa-building' />
                                <div className='space-y-0'>
                                    <RatingRow label="Performance Review System" value={record.stage3.companyRatings.performanceReviewSystem} />
                                    <RatingRow label="Induction program" value={record.stage3.companyRatings.inductionProgram} />
                                    <RatingRow label='Rate of pay for your job role' value={record.stage3.companyRatings.payRate} />
                                    <RatingRow label='Career development opportunities' value={record.stage3.companyRatings.careerDevelopment} />
                                    <RatingRow label='Work environment and timing' value={record.stage3.companyRatings.workEnvironment} />
                                    <RatingRow label="Sensitive to employees' needs" value={record.stage3.companyRatings.sensitiveToNeeds} />
                                    <RatingRow label='Administration' value={record.stage3.companyRatings.administration} />
                                    <RatingRow label='Duties and responsibilities' value={record.stage3.companyRatings.duties} />
                                    <RatingRow label='Employee benefit facilities' value={record.stage3.companyRatings.benefits} />
                                    <RatingRow label='Keeping employee informed' value={record.stage3.companyRatings.employeeInforming} />
                                    <RatingRow label='Treating employee fairly' value={record.stage3.companyRatings.fairTreatment} />
                                    <RatingRow label='Cooperation within department' value={record.stage3.companyRatings.cooperation} />
                                    <RatingRow label='Recommend for job openings' value={record.stage3.companyRatings.recommendation} />
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* Stage 4 */}
                {record.stage4 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 4 — No Due Clearance' icon='fa-clipboard-check'
                            badge={<span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'>Completed</span>} />
                        <InfoGrid items={[
                            { label: 'Due Status', value: record.stage4.dueStatus },
                            { label: 'Submitted At', value: record.stage4.submittedAt },
                            ...(record.stage4.noDueFormAttachments?.length > 0 ? [{ label: 'Attachments', value: `${record.stage4.noDueFormAttachments.length} file(s) attached` }] : []),
                            { label: 'Remarks', value: record.stage4.noDueRemarks, full: true },
                        ]} columns={3} />
                    </Card>
                )}

                {/* Stage 5 */}
                {record.stage5 && (
                    <Card className='p-5 md:p-6'>
                        <SectionHeader title='Stage 5 — F&F Clearance' icon='fa-money-check-dollar'
                            badge={<span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'>Completed</span>} />
                        <InfoGrid items={[
                            { label: 'Generate F&F', value: record.stage5.generateFNF },
                            { label: 'Generate Letters', value: record.stage5.generateLetters },
                            { label: 'Submitted At', value: record.stage5.submittedAt },
                            { label: 'Remarks', value: record.stage5.remarks, full: true },
                        ]} columns={3} />
                    </Card>
                )}

            </div>

            {/* Mobile sticky action bar */}
            {nextAction && (
                <div className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-4 py-3'>
                    <button
                        onClick={() => navigate(`/exit-process/records/${record._id}/stage-${nextAction.stage}`)}
                        className='w-full flex items-center justify-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-5 py-3 rounded-lg text-sm font-semibold transition cursor-pointer'
                    >
                        <i className={`fa-solid ${nextAction.icon} text-xs`}></i>
                        {nextAction.label}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ExitDetailView