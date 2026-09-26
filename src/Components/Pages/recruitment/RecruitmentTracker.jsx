import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { selectAllCandidates } from '../../../Store/Redux/Recruitment/VacancySlice'
import CandidateViewModal from './CandidateViewModal'
import CandidateUpdateModal from './CandidateUpdateModal'
import { formatTimestamp } from '../../../Utils/formatDate'
import { RECRUITMENT_STAGES, STAGE_STYLES, NEXT_DATE_STAGES } from '../../../Utils/mockRecruitment'
import SearchableSelect from '../../Common/SearchableSelect'

const EMPTY_STAGE_STYLE = 'bg-slate-50 text-slate-500 border-slate-200'

// Once a candidate reaches one of these stages they move out of "Active" and into
// "History" (set by the Active / History toggle in the page header) — everything
// still moving through the pipeline (Shortlist, Interview, Final Round, Offer, On
// Hold) stays in Active.
const HISTORY_STAGES = ['Join', 'Reject']

// Blank (not even a dash) when the candidate's current stage — Join, Reject — has no
// next schedule date at all; a dash only when the stage expects one but none is set yet.
const nextScheduleCell = (c) => {
    if (!NEXT_DATE_STAGES.includes(c.stage)) return ''
    return c.nextScheduleDate ? formatTimestamp(c.nextScheduleDate) : '—'
}

const StageBadge = ({ stage }) => (
    <span className={`inline-block whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STAGE_STYLES[stage] || EMPTY_STAGE_STYLE}`}>
        {stage || '—'}
    </span>
)

// Recruitment Tracker — one row per candidate submitted through "New Recruitment".
// View opens the full candidate card; Update opens the stage / remarks / schedule update pop-up.
const RecruitmentTracker = () => {
    const candidates = useSelector(selectAllCandidates)
    const [searchParams] = useSearchParams()
    // Set by the Active / History buttons next to "Hiring Request" in the page header
    const view = searchParams.get('view') === 'history' ? 'history' : 'active'
    const [search, setSearch] = useState('')
    const [stageFilter, setStageFilter] = useState('All')
    // Only ids are kept here, so the pop-ups always show the latest saved data
    const [viewKey, setViewKey] = useState(null)
    const [updateKey, setUpdateKey] = useState(null)

    // Stage filter options narrow to whichever stages actually belong to the current view
    const stageOptions = view === 'history'
        ? HISTORY_STAGES
        : RECRUITMENT_STAGES.filter((s) => !HISTORY_STAGES.includes(s))

    const viewCandidates = useMemo(
        () => candidates.filter((c) => HISTORY_STAGES.includes(c.stage) === (view === 'history')),
        [candidates, view]
    )

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase()
        return viewCandidates.filter((c) => {
            if (stageFilter !== 'All' && c.stage !== stageFilter) return false
            if (!q) return true
            return [c.name, c.contact, c.email, c.position || c.vacancyDesignation, c.location || c.vacancyBranch]
                .some((f) => (f || '').toLowerCase().includes(q))
        })
    }, [viewCandidates, search, stageFilter])

    // Reset the stage filter whenever Active / History is switched, since a stage from
    // one view (e.g. "Interview") isn't a valid option in the other ("Join" / "Reject")
    const [lastView, setLastView] = useState(view)
    if (view !== lastView) {
        setLastView(view)
        if (stageFilter !== 'All') setStageFilter('All')
    }

    const find = (key) => key && candidates.find((c) => c.id === key)
    const viewCandidate = find(viewKey)
    const updateCandidateRow = find(updateKey)

    // "Next Schedule Date" only means something for stages that actually have one (Shortlist,
    // Interview, Final Round, Offer, On Hold). If every row currently on screen is Join / Reject —
    // where there's nothing to show — drop the column (header included) instead of leaving it empty.
    const showNextDateCol = rows.some((c) => NEXT_DATE_STAGES.includes(c.stage))
    const desktopColCount = showNextDateCol ? 10 : 9

    if (candidates.length === 0) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className="fa-solid fa-users text-4xl text-slate-300 mb-3"></i>
                <p className='text-slate-500 text-sm'>No candidates yet</p>
                <p className='text-xs text-slate-400 mt-1'>Candidates appear here after you submit the New Recruitment form (Current Vacancy → Update → New Recruitment).</p>
            </div>
        )
    }

    if (viewCandidates.length === 0) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className={`fa-solid ${view === 'history' ? 'fa-clock-rotate-left' : 'fa-list-check'} text-4xl text-slate-300 mb-3`}></i>
                <p className='text-slate-500 text-sm'>{view === 'history' ? 'No history yet' : 'No active candidates'}</p>
                <p className='text-xs text-slate-400 mt-1'>
                    {view === 'history'
                        ? 'Candidates move here automatically once they are marked Join or Reject.'
                        : 'Every candidate is currently in History (Join / Reject).'}
                </p>
            </div>
        )
    }

    // History is a closed record (Join / Reject) — only View makes sense there,
    // so Update only ever shows in the Active view.
    const actionButtons = (c, align = 'end') => (
        <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : 'justify-end'}`}>
            <button
                onClick={() => setViewKey(c.id)}
                title='View full details'
                aria-label='View full details'
                className='w-8 h-7 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center'
            >
                <i className="fa-solid fa-eye text-[12px]"></i>
            </button>
            {view === 'active' && (
                <button
                    onClick={() => setUpdateKey(c.id)}
                    className='h-7 px-2.5 rounded-lg bg-[#062139] hover:bg-[#0a2f52] text-white text-[11px] font-medium transition whitespace-nowrap'
                >
                    Update
                </button>
            )}
        </div>
    )

    return (
        <div className='space-y-4'>
            {/* Search + stage filter */}
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3'>
                <div className='relative flex-1'>
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search by name, contact, position or location...'
                        className='w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
                    />
                </div>
                <div className='sm:w-48'>
                    <SearchableSelect
                        label='Stage'
                        name='stageFilter'
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        options={['All', ...stageOptions]}
                        bare
                    />
                </div>
            </div>

            <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
                {/* ============ DESKTOP TABLE ============ */}
                <div className='hidden md:block overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead className='bg-[#062139] border-b border-[#0a2f52]'>
                            <tr className='text-left text-[11px] uppercase text-slate-200 font-semibold tracking-wide'>
                                <th className='px-3 py-3'>S.No</th>
                                <th className='px-3 py-3'>Location</th>
                                <th className='px-3 py-3'>Candidate Name</th>
                                <th className='px-3 py-3'>Contact No</th>
                                <th className='px-3 py-3'>Salary</th>
                                <th className='px-3 py-3'>Position</th>
                                <th className='px-3 py-3'>Current Stage</th>
                                <th className='px-3 py-3'>Remarks</th>
                                {showNextDateCol && <th className='px-3 py-3'>Next Schedule Date</th>}
                                <th className='px-3 py-3 text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={desktopColCount} className='px-4 py-10 text-center text-sm text-slate-400'>No candidates match your search.</td></tr>
                            ) : rows.map((c, i) => (
                                <tr key={c.id} className='border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition'>
                                    <td className='px-3 py-3 text-xs text-slate-500'>{i + 1}</td>
                                    <td className='px-3 py-3 text-[13px] text-slate-600 whitespace-nowrap'>{c.location || c.vacancyBranch || '—'}</td>
                                    <td className='px-3 py-3 text-sm font-medium text-slate-800'>{c.name}</td>
                                    <td className='px-3 py-3 text-[13px] text-slate-600 whitespace-nowrap'>{c.contact || '—'}</td>
                                    <td className='px-3 py-3 text-[13px] text-slate-600 whitespace-nowrap'>{c.salaryExpectation || '—'}</td>
                                    <td className='px-3 py-3 text-[13px] text-slate-700'>{c.position || c.vacancyDesignation}</td>
                                    <td className='px-3 py-3'><StageBadge stage={c.stage} /></td>
                                    <td className='px-3 py-3 text-[13px] text-slate-600 max-w-[220px]'>
                                        <p className='line-clamp-2' title={c.remarks}>{c.remarks || '—'}</p>
                                    </td>
                                    {showNextDateCol && <td className='px-3 py-3 text-[13px] text-slate-600 whitespace-nowrap'>{nextScheduleCell(c)}</td>}
                                    <td className='px-3 py-3'>{actionButtons(c, 'center')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ============ MOBILE CARDS ============ */}
                <div className='md:hidden divide-y divide-slate-100'>
                    {rows.length === 0 && <p className='p-8 text-center text-sm text-slate-400'>No candidates match your search.</p>}
                    {rows.map((c, i) => (
                        <div key={c.id} className='p-4'>
                            {/* Top row: S.No chip + View / Update actions, same as the Vacancy card */}
                            <div className='flex items-center justify-between gap-2'>
                                <span className='inline-flex items-center h-7 px-3 rounded-full border border-slate-200 bg-slate-100 text-[12px] font-bold text-slate-600'>
                                    {i + 1}
                                </span>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => setViewKey(c.id)}
                                        title='View full details'
                                        aria-label='View full details'
                                        className='w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center'
                                    >
                                        <i className="fa-solid fa-eye text-[12px]"></i>
                                    </button>
                                    {view === 'active' && (
                                        <button
                                            onClick={() => setUpdateKey(c.id)}
                                            className='inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#062139] hover:bg-[#0a2f52] text-white text-[12px] font-semibold transition'
                                        >
                                            <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                            Update
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name / position: headline, tap to view */}
                            <button onClick={() => setViewKey(c.id)} className='text-left block w-full mt-3'>
                                <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wide'>Candidate Name</p>
                                <h3 className='text-[15px] font-bold text-slate-800 leading-snug mt-0.5'>{c.name}</h3>
                                <p className='text-xs text-slate-500 mt-0.5'>{c.position || c.vacancyDesignation} · {c.location || c.vacancyBranch}</p>
                            </button>

                            <div className='grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100'>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Stage</p>
                                    <div className='mt-0.5'><StageBadge stage={c.stage} /></div>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Contact No</p>
                                    <p className='text-[13px] text-slate-700'>{c.contact || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Salary</p>
                                    <p className='text-[13px] text-slate-700'>{c.salaryExpectation || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Email</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.email || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Source</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.recruitmentSource || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Division</p>
                                    <p className='text-[13px] text-slate-700'>{c.division || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>HR Name</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.hrName || '—'}</p>
                                </div>
                                {NEXT_DATE_STAGES.includes(c.stage) && (
                                    <div className='min-w-0'>
                                        <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Next Schedule Date</p>
                                        <p className='text-[13px] text-slate-700'>{c.nextScheduleDate ? formatTimestamp(c.nextScheduleDate) : '—'}</p>
                                    </div>
                                )}
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Logged On</p>
                                    <p className='text-[13px] text-slate-700'>{c.loggedOn ? formatTimestamp(c.loggedOn) : '—'}</p>
                                </div>
                                <div className='min-w-0 col-span-2'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Remarks</p>
                                    <p className='text-[13px] text-slate-700 line-clamp-2'>{c.remarks || '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50'>
                    <p className='text-xs text-slate-500'>
                        Showing <span className='font-semibold text-slate-700'>{rows.length}</span> of {viewCandidates.length} {view === 'history' ? 'history' : 'active'} candidates
                    </p>
                </div>
            </div>

            <CandidateViewModal candidate={viewCandidate} onClose={() => setViewKey(null)} />
            {updateCandidateRow && (
                <CandidateUpdateModal key={updateCandidateRow.id} candidate={updateCandidateRow} onClose={() => setUpdateKey(null)} />
            )}
        </div>
    )
}

export default RecruitmentTracker