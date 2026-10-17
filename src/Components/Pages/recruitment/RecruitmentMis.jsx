import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { selectAllVacancies } from '../../../Store/Redux/Recruitment/VacancySlice'
import { EXPERIENCE_LEVELS } from '../../../Utils/mockRecruitment'
import VacancyStatusBadge from './VacancyStatusBadge'
import { theadClass, thClass, rowClass, metaLabel } from './ui'

import Icon from '../../Common/Icon'
const STATUS_COLORS = { 'Open': '#10b981', 'On Hold': '#f59e0b', 'Closed': '#8fa3b3' }
// Navy palette for series that aren't a status
const NAVY = { deep: '#1f4e6b', mid: '#2b6485', light: '#9fb8c9', soft: '#cfdce5' }
const AXIS_TICK = { fontSize: 11, fill: '#64788a' }
const GRID_STROKE = '#e2e8f0'
const TOOLTIP_PROPS = {
    cursor: { fill: 'rgb(164 200 225 / 0.18)' },
    contentStyle: { borderRadius: 12, border: '1px solid rgb(226 232 240)', boxShadow: '0 12px 28px -8px rgb(8 31 52 / 0.28)', fontSize: 12 },
}

// Count how many requests fall in each value of `key`  ->  [{ name, value }]
const countBy = (list, key) => {
    const map = {}
    list.forEach((v) => { map[v[key]] = (map[v[key]] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
}

// Add up the number of vacancies for each value of `key`
const sumOpeningsBy = (list, key) => {
    const map = {}
    list.forEach((v) => { map[v[key]] = (map[v[key]] || 0) + Number(v.openings || 0) })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
}

const daysLeft = (dateStr) => {
    const today = new Date(new Date().toISOString().slice(0, 10))
    return Math.round((new Date(dateStr) - today) / 86400000)
}

const StatCard = ({ icon, label, value, tone }) => (
    <div className='glass-panel rounded-2xl p-4 flex items-center gap-3'>
        <div aria-hidden='true' className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset ${tone}`}>
            <Icon className={`fa-solid ${icon}`} />
        </div>
        <div className='min-w-0'>
            <p className='text-[13px] text-slate-500 truncate'>{label}</p>
            <p className='text-2xl font-semibold text-[var(--ink)] leading-tight tabular-nums'>{value}</p>
        </div>
    </div>
)

const ChartCard = ({ title, icon, children, empty }) => (
    <div className='glass-panel rounded-2xl p-4'>
        <h3 className='text-[15px] font-semibold text-[var(--ink)] mb-3'>{title}</h3>
        {empty
            ? (
                <div className='h-64 flex flex-col items-center justify-center text-center px-4'>
                    <span aria-hidden='true' className='mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
                        <Icon className={`fa-solid ${icon} text-lg`} />
                    </span>
                    <p className='text-sm font-medium text-[var(--ink)]'>No data yet.</p>
                    <p className='mt-1 text-[13px] text-slate-500'>This chart fills in as hiring requests are raised.</p>
                </div>
            )
            : <div className='h-64'>{children}</div>}
    </div>
)

const thMis = thClass.replace('px-3', 'px-4')

const timeLeftText = (d) => (d < 0 ? `Overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}` : d === 0 ? 'Due today' : `${d} day${d === 1 ? '' : 's'}`)

// TEMP: MIS Reports isn't ready to show real data yet — flip this to true
// once it should start reflecting actual hiring requests.
const SHOW_MIS_DATA = false

const RecruitmentMis = () => {
    const allVacancies = useSelector(selectAllVacancies)
    const list = SHOW_MIS_DATA ? allVacancies : []

    const stats = useMemo(() => {
        const open = list.filter((v) => v.status === 'Open')
        return {
            total: list.length,
            openPositions: open.reduce((sum, v) => sum + Number(v.openings || 0), 0),
            onHold: list.filter((v) => v.status === 'On Hold').length,
            closed: list.filter((v) => v.status === 'Closed').length,
            byBranch: countBy(list, 'branch').sort((a, b) => b.value - a.value),
            byStatus: countBy(list, 'status'),
            byDesignation: sumOpeningsBy(list, 'designation').sort((a, b) => b.value - a.value).slice(0, 8),
            byExperience: EXPERIENCE_LEVELS
                .map((name) => ({ name, value: list.filter((v) => v.experienceRequired === name).length }))
                .filter((d) => d.value > 0),
            upcoming: [...open].sort((a, b) => a.targetDate.localeCompare(b.targetDate)).slice(0, 5),
        }
    }, [list])

    return (
        <div className='space-y-4'>

            {/* Summary cards */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                <StatCard icon='fa-file-lines' label='Total requests' value={stats.total} tone='bg-[#f2f5f7] text-[var(--brand-600)] ring-[#cfdce5]/60' />
                <StatCard icon='fa-users' label='Open positions' value={stats.openPositions} tone='bg-emerald-50 text-emerald-700 ring-emerald-200' />
                <StatCard icon='fa-pause' label='On hold' value={stats.onHold} tone='bg-amber-50 text-amber-700 ring-amber-200' />
                <StatCard icon='fa-lock' label='Closed' value={stats.closed} tone='bg-slate-100 text-slate-600 ring-slate-200' />
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

                <ChartCard title='Hiring requests by branch' icon='fa-chart-line' empty={stats.byBranch.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byBranch} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={GRID_STROKE} />
                            <XAxis dataKey='name' tick={AXIS_TICK} interval={0} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <Tooltip {...TOOLTIP_PROPS} />
                            <Bar dataKey='value' name='Requests' fill={NAVY.deep} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Requests by status' icon='fa-chart-pie' empty={stats.byStatus.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie data={stats.byStatus} dataKey='value' nameKey='name' innerRadius={55} outerRadius={85} paddingAngle={2} stroke='#fff'>
                                {stats.byStatus.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#8fa3b3'} />)}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_PROPS.contentStyle} />
                            <Legend iconType='square' wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Vacancies by designation (top 8)' icon='fa-chart-line' empty={stats.byDesignation.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byDesignation} layout='vertical' margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke={GRID_STROKE} />
                            <XAxis type='number' allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <YAxis type='category' dataKey='name' width={130} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <Tooltip {...TOOLTIP_PROPS} />
                            <Bar dataKey='value' name='Vacancies' fill={NAVY.mid} radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Requests by experience required' icon='fa-chart-line' empty={stats.byExperience.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byExperience} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={GRID_STROKE} />
                            <XAxis dataKey='name' tick={AXIS_TICK} interval={0} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                            <Tooltip {...TOOLTIP_PROPS} />
                            <Bar dataKey='value' name='Requests' fill={NAVY.light} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Nearest target dates */}
            <div className='glass-strong rounded-2xl overflow-hidden'>
                <h3 className='text-[15px] font-semibold text-[var(--ink)] px-4 py-3 border-b border-slate-100'>
                    Nearest target dates (open requests)
                </h3>
                {stats.upcoming.length === 0 ? (
                    <div className='px-6 py-10 text-center'>
                        <span aria-hidden='true' className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f5f7] text-[var(--brand-600)] ring-1 ring-inset ring-[#cfdce5]/60'>
                            <Icon className='fa-solid fa-calendar-check text-lg' />
                        </span>
                        <p className='text-sm font-medium text-[var(--ink)]'>No open requests.</p>
                        <p className='mt-1 text-[13px] text-slate-500'>Raise a hiring request to start tracking its target date here.</p>
                    </div>
                ) : (
                    <>
                        {/* ============ DESKTOP TABLE ============ */}
                        <div className='hidden md:block'>
                            <table className='w-full text-sm [overflow-wrap:anywhere]'>
                                <thead className={theadClass}>
                                    <tr>
                                        <th className={thMis}>S.No</th>
                                        <th className={thMis}>Designation</th>
                                        <th className={thMis}>Branch</th>
                                        <th className={thMis}>Vacancies</th>
                                        <th className={thMis}>Target date</th>
                                        <th className={thMis}>Time left</th>
                                        <th className={thMis}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.upcoming.map((v) => {
                                        const d = daysLeft(v.targetDate)
                                        return (
                                            <tr key={v._id} className={rowClass}>
                                                <td className='px-4 py-2.5 text-xs font-semibold text-slate-700 tabular-nums'>{v.jobId}</td>
                                                <td className='px-4 py-2.5 text-slate-700'>{v.designation}</td>
                                                <td className='px-4 py-2.5 text-slate-600'>{v.branch}</td>
                                                <td className='px-4 py-2.5 text-slate-600 tabular-nums'>{v.openings}</td>
                                                <td className='px-4 py-2.5 text-slate-600 tabular-nums'>{v.targetDate}</td>
                                                <td className={`px-4 py-2.5 text-xs font-semibold tabular-nums ${d < 0 ? 'text-red-600' : d <= 7 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                    {timeLeftText(d)}
                                                </td>
                                                <td className='px-4 py-2.5'><VacancyStatusBadge status={v.status} /></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ============ MOBILE CARDS ============ */}
                        <div className='md:hidden divide-y divide-slate-100'>
                            {stats.upcoming.map((v) => {
                                const d = daysLeft(v.targetDate)
                                return (
                                    <div key={v._id} className='p-3.5'>
                                        <div className='flex items-start gap-2.5'>
                                            <div className='w-9 h-9 shrink-0 rounded-xl bg-slate-100 ring-1 ring-inset ring-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-600 tabular-nums'>
                                                {v.jobId}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h4 className='text-sm font-semibold text-[var(--ink)] leading-snug truncate'>{v.designation}</h4>
                                                <p className='text-xs text-slate-500 truncate mt-0.5'>
                                                    <Icon className="fa-solid fa-location-dot mr-1 text-[10px] text-slate-400" />{v.branch}
                                                </p>
                                            </div>
                                            <div className='shrink-0 pt-0.5'>
                                                <VacancyStatusBadge status={v.status} />
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-x-3 gap-y-2.5 mt-3 pt-3 border-t border-slate-100'>
                                            <div className='min-w-0'>
                                                <p className={metaLabel}>Vacancies</p>
                                                <p className='text-[13px] text-slate-700 font-semibold mt-0.5 tabular-nums'>{v.openings}</p>
                                            </div>
                                            <div className='min-w-0'>
                                                <p className={metaLabel}>Target date</p>
                                                <p className='text-[13px] text-slate-700 font-semibold mt-0.5 tabular-nums'>{v.targetDate}</p>
                                            </div>
                                            <div className='min-w-0 col-span-2'>
                                                <p className={metaLabel}>Time left</p>
                                                <p className={`text-[13px] font-semibold mt-0.5 ${d < 0 ? 'text-red-600' : d <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {timeLeftText(d)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default RecruitmentMis
