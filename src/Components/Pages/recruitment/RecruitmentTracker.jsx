import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { selectAllCandidates } from '../../../Store/Redux/Recruitment/VacancySlice'
import CandidateViewModal from './CandidateViewModal'
import CandidateUpdateModal from './CandidateUpdateModal'
import { formatTimestamp } from '../../../Utils/formatDate'
import { RECRUITMENT_STAGES, NEXT_DATE_STAGES } from '../../../Utils/mockRecruitment'
import SearchableSelect from '../../Common/SearchableSelect'
import { Pagination, usePagination } from '../../Common/Pagination'
import { stageBadgeClass, inputClass, theadClass, thClass, rowClass, rowPrimary, rowIcon, touchIcon, metaLabel, fromLg, fromXl } from './ui'

import Icon from '../../Common/Icon'

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
    <span className={stageBadgeClass(stage)}>
        {stage || '—'}
    </span>
)

const EmptyState = ({ icon, title, hint }) => (
    <div className='glass-panel rounded-2xl px-6 py-12 text-center'>
        <span aria-hidden='true' className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
            <Icon className={`fa-solid ${icon} text-xl`} />
        </span>
        <p className='text-sm font-medium text-[var(--ink)]'>{title}</p>
        <p className='mx-auto mt-1 max-w-md text-[13px] text-slate-500'>{hint}</p>
    </div>
)

const td = 'px-3 py-3 text-[13px] text-slate-600'

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

    const paging = usePagination(rows, { resetKey: `${view}|${search}|${stageFilter}` })
    const offset = (paging.page - 1) * paging.pageSize

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
            <EmptyState
                icon='fa-users'
                title='No candidates yet.'
                hint='Candidates appear here after you submit the New recruitment form from Current vacancy, then Update.'
            />
        )
    }

    if (viewCandidates.length === 0) {
        return (
            <EmptyState
                icon={view === 'history' ? 'fa-clock-rotate-left' : 'fa-list-check'}
                title={view === 'history' ? 'No history yet.' : 'No active candidates.'}
                hint={view === 'history'
                    ? 'Candidates move here automatically once they are marked Join or Reject.'
                    : 'Every candidate is currently in History (Join / Reject).'}
            />
        )
    }

    // History is a closed record (Join / Reject) — only View makes sense there,
    // so Update only ever shows in the Active view.
    const actionButtons = (c, align = 'end') => (
        <div className={`flex flex-wrap items-center gap-2 ${align === 'center' ? 'justify-center' : 'justify-end'}`}>
            <button
                onClick={() => setViewKey(c.id)}
                title='View full details'
                aria-label='View full details'
                className={rowIcon}
            >
                <Icon className="fa-solid fa-eye text-[12px]" />
            </button>
            {view === 'active' && (
                <button
                    onClick={() => setUpdateKey(c.id)}
                    className={rowPrimary}
                >
                    Update
                </button>
            )}
        </div>
    )

    return (
        <div className='space-y-4'>
            {/* Search + stage filter */}
            <div className='glass-panel rounded-2xl p-3.5 md:p-4 flex flex-col sm:flex-row gap-3'>
                <div className='relative flex-1'>
                    <Icon className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                    <input
                        type='text'
                        aria-label='Search candidates'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search by name, contact, position or location'
                        className={`${inputClass} pl-9`}
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

            <div className='glass-strong rounded-2xl overflow-hidden'>
                {/* ============ DESKTOP TABLE ============ */}
                {/* The table fits its box at every width: tablets show the essentials, location, salary,
                    remarks and the next date join from lg / xl (the phone cards show every field) */}
                <div className='hidden md:block'>
                    <table className='w-full text-sm [overflow-wrap:anywhere]'>
                        <thead className={theadClass}>
                            <tr>
                                <th className={thClass}>S.No</th>
                                <th className={`${thClass} ${fromLg}`}>Location</th>
                                <th className={thClass}>Candidate name</th>
                                <th className={thClass}>Contact no</th>
                                <th className={`${thClass} ${fromXl}`}>Salary</th>
                                <th className={thClass}>Position</th>
                                <th className={thClass}>Current stage</th>
                                <th className={`${thClass} ${fromXl}`}>Remarks</th>
                                {showNextDateCol && <th className={`${thClass} ${fromLg}`}>Next schedule date</th>}
                                <th className={`${thClass} text-center`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={desktopColCount} className='px-4 py-10 text-center text-sm text-slate-500'>No candidates match your search. Try another name or stage.</td></tr>
                            ) : paging.pageItems.map((c, i) => (
                                <tr key={c.id} className={rowClass}>
                                    <td className='px-3 py-3 text-xs text-slate-500 tabular-nums'>{offset + i + 1}</td>
                                    <td className={`${td} ${fromLg}`}>{c.location || c.vacancyBranch || '—'}</td>
                                    <td className='px-3 py-3 text-sm font-medium text-[var(--ink)]'>{c.name}</td>
                                    <td className={`${td} tabular-nums`}>{c.contact || '—'}</td>
                                    <td className={`${td} ${fromXl} tabular-nums`}>{c.salaryExpectation || '—'}</td>
                                    <td className='px-3 py-3 text-[13px] text-slate-700'>{c.position || c.vacancyDesignation}</td>
                                    <td className='px-3 py-3'><StageBadge stage={c.stage} /></td>
                                    <td className={`${td} ${fromXl} max-w-[220px]`}>
                                        <p className='line-clamp-2' title={c.remarks}>{c.remarks || '—'}</p>
                                    </td>
                                    {showNextDateCol && <td className={`${td} ${fromLg} tabular-nums`}>{nextScheduleCell(c)}</td>}
                                    <td className='px-3 py-3'>{actionButtons(c, 'center')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ============ MOBILE CARDS ============ */}
                <div className='md:hidden divide-y divide-slate-100'>
                    {rows.length === 0 && <p className='p-8 text-center text-sm text-slate-500'>No candidates match your search. Try another name or stage.</p>}
                    {paging.pageItems.map((c, i) => (
                        <div key={c.id} className='p-4'>
                            {/* Top row: S.No chip + View / Update actions, same as the Vacancy card */}
                            <div className='flex items-center justify-between gap-2'>
                                <span className='inline-flex items-center h-7 px-2 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 tabular-nums'>
                                    {offset + i + 1}
                                </span>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => setViewKey(c.id)}
                                        title='View full details'
                                        aria-label='View full details'
                                        className={touchIcon}
                                    >
                                        <Icon className="fa-solid fa-eye text-[13px]" />
                                    </button>
                                    {view === 'active' && (
                                        <button
                                            onClick={() => setUpdateKey(c.id)}
                                            className='press gradient-brand inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2'
                                        >
                                            <Icon className="fa-solid fa-pen-to-square text-[12px]" />
                                            Update
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name / position: headline, tap to view */}
                            <button onClick={() => setViewKey(c.id)} className='text-left block w-full mt-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                                <p className={metaLabel}>Candidate name</p>
                                <h3 className='text-[15px] font-semibold text-[var(--ink)] leading-snug mt-0.5'>{c.name}</h3>
                                <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500'>
                                    <span className='inline-flex items-center gap-1'>
                                        <Icon className='fa-solid fa-briefcase text-[10px] text-slate-400' />{c.position || c.vacancyDesignation}
                                    </span>
                                    <span className='inline-flex items-center gap-1'>
                                        <Icon className='fa-solid fa-location-dot text-[10px] text-slate-400' />{c.location || c.vacancyBranch}
                                    </span>
                                </p>
                            </button>

                            <div className='grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100'>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Stage</p>
                                    <div className='mt-0.5'><StageBadge stage={c.stage} /></div>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Contact no</p>
                                    <p className='text-[13px] text-slate-700 tabular-nums'>{c.contact || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Salary</p>
                                    <p className='text-[13px] text-slate-700 tabular-nums'>{c.salaryExpectation || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Email</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.email || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Source</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.recruitmentSource || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Division</p>
                                    <p className='text-[13px] text-slate-700'>{c.division || '—'}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className={metaLabel}>HR name</p>
                                    <p className='text-[13px] text-slate-700 truncate'>{c.hrName || '—'}</p>
                                </div>
                                {NEXT_DATE_STAGES.includes(c.stage) && (
                                    <div className='min-w-0'>
                                        <p className={metaLabel}>Next schedule date</p>
                                        <p className='text-[13px] text-slate-700 tabular-nums'>{c.nextScheduleDate ? formatTimestamp(c.nextScheduleDate) : '—'}</p>
                                    </div>
                                )}
                                <div className='min-w-0'>
                                    <p className={metaLabel}>Logged on</p>
                                    <p className='text-[13px] text-slate-700 tabular-nums'>{c.loggedOn ? formatTimestamp(c.loggedOn) : '—'}</p>
                                </div>
                                <div className='min-w-0 col-span-2'>
                                    <p className={metaLabel}>Remarks</p>
                                    <p className='text-[13px] text-slate-700 line-clamp-2'>{c.remarks || '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='px-4 py-3 border-t border-slate-100 bg-white/50'>
                    <Pagination
                        page={paging.page}
                        pages={paging.pages}
                        pageSize={paging.pageSize}
                        total={paging.total}
                        onPage={paging.setPage}
                        onPageSize={paging.setPageSize}
                        label={view === 'history' ? 'history candidates' : 'active candidates'}
                    />
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
