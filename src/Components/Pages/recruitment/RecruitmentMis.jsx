import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { selectAllVacancies } from '../../../Store/Redux/Recruitment/VacancySlice'
import { EXPERIENCE_LEVELS } from '../../../Utils/mockRecruitment'
import VacancyStatusBadge from './VacancyStatusBadge'

const STATUS_COLORS = { 'Open': '#10b981', 'On Hold': '#f59e0b', 'Closed': '#94a3b8' }
const BAR_COLOR = '#0a3f6e'

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
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3'>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className='min-w-0'>
            <p className='text-[11px] uppercase font-semibold text-slate-400 tracking-wide'>{label}</p>
            <p className='text-2xl font-bold text-slate-800 leading-tight'>{value}</p>
        </div>
    </div>
)

const ChartCard = ({ title, children, empty }) => (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-4'>
        <h3 className='text-sm font-bold text-slate-700 mb-3'>{title}</h3>
        {empty
            ? <div className='h-64 flex items-center justify-center text-sm text-slate-400'>No data yet</div>
            : <div className='h-64'>{children}</div>}
    </div>
)

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
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard icon='fa-file-lines' label='Total Requests' value={stats.total} tone='bg-blue-100 text-blue-800' />
                <StatCard icon='fa-users' label='Open Positions' value={stats.openPositions} tone='bg-emerald-100 text-emerald-700' />
                <StatCard icon='fa-pause' label='On Hold' value={stats.onHold} tone='bg-amber-100 text-amber-700' />
                <StatCard icon='fa-lock' label='Closed' value={stats.closed} tone='bg-slate-100 text-slate-600' />
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

                <ChartCard title='Hiring Requests by Branch' empty={stats.byBranch.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byBranch} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='name' tick={{ fontSize: 11 }} interval={0} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey='value' name='Requests' fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Requests by Status' empty={stats.byStatus.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie data={stats.byStatus} dataKey='value' nameKey='name' innerRadius={55} outerRadius={85} paddingAngle={2}>
                                {stats.byStatus.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#94a3b8'} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Vacancies by Designation (Top 8)' empty={stats.byDesignation.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byDesignation} layout='vertical' margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                            <XAxis type='number' allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type='category' dataKey='name' width={130} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey='value' name='Vacancies' fill='#21537e' radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title='Requests by Experience Required' empty={stats.byExperience.length === 0}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={stats.byExperience} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='name' tick={{ fontSize: 11 }} interval={0} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey='value' name='Requests' fill='#062139' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Nearest target dates */}
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
                <h3 className='text-sm font-bold text-slate-700 px-4 py-3 border-b border-slate-100'>
                    Nearest Target Dates (Open requests)
                </h3>
                {stats.upcoming.length === 0 ? (
                    <p className='p-6 text-sm text-slate-400 text-center'>No open requests</p>
                ) : (
                    <>
                        {/* ============ DESKTOP TABLE ============ */}
                        <div className='hidden md:block overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-slate-50 text-left text-[11px] uppercase text-slate-400 font-semibold tracking-wide'>
                                    <tr>
                                        <th className='px-4 py-2'>S.No</th>
                                        <th className='px-4 py-2'>Designation</th>
                                        <th className='px-4 py-2'>Branch</th>
                                        <th className='px-4 py-2'>Vacancies</th>
                                        <th className='px-4 py-2'>Target Date</th>
                                        <th className='px-4 py-2'>Time Left</th>
                                        <th className='px-4 py-2'>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.upcoming.map((v) => {
                                        const d = daysLeft(v.targetDate)
                                        return (
                                            <tr key={v._id} className='border-t border-slate-100'>
                                                <td className='px-4 py-2.5 font-mono text-xs font-semibold text-slate-700'>{v.jobId}</td>
                                                <td className='px-4 py-2.5 text-slate-700'>{v.designation}</td>
                                                <td className='px-4 py-2.5 text-slate-600'>{v.branch}</td>
                                                <td className='px-4 py-2.5 text-slate-600'>{v.openings}</td>
                                                <td className='px-4 py-2.5 text-slate-600'>{v.targetDate}</td>
                                                <td className={`px-4 py-2.5 text-xs font-semibold ${d < 0 ? 'text-red-600' : d <= 7 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                    {d < 0 ? `Overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}` : d === 0 ? 'Due today' : `${d} day${d === 1 ? '' : 's'}`}
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
                                            <div className='w-8 h-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500'>
                                                {v.jobId}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h4 className='text-[13.5px] font-bold text-slate-800 leading-snug truncate'>{v.designation}</h4>
                                                <p className='text-[11px] text-slate-400 truncate mt-0.5'>
                                                    <i className="fa-solid fa-location-dot mr-1 text-[9px]"></i>{v.branch}
                                                </p>
                                            </div>
                                            <div className='shrink-0 pt-0.5'>
                                                <VacancyStatusBadge status={v.status} />
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-x-3 gap-y-2.5 mt-3 pt-3 border-t border-slate-100'>
                                            <div className='min-w-0'>
                                                <p className='text-[8.5px] uppercase text-slate-400 font-semibold tracking-wide truncate'>Vacancies</p>
                                                <p className='text-[12px] text-slate-700 font-semibold mt-0.5'>{v.openings}</p>
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-[8.5px] uppercase text-slate-400 font-semibold tracking-wide truncate'>Target Date</p>
                                                <p className='text-[12px] text-slate-700 font-semibold mt-0.5'>{v.targetDate}</p>
                                            </div>
                                            <div className='min-w-0 col-span-2'>
                                                <p className='text-[8.5px] uppercase text-slate-400 font-semibold tracking-wide truncate'>Time Left</p>
                                                <p className={`text-[12px] font-semibold mt-0.5 ${d < 0 ? 'text-red-600' : d <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {d < 0 ? `Overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}` : d === 0 ? 'Due today' : `${d} day${d === 1 ? '' : 's'}`}
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