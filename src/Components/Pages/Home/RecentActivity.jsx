import React from 'react'
import { Link } from 'react-router-dom'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Status colours keep their meaning (see DESIGN.md); the chart shows the total in its centre
const ANIMATE = typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
const EMPTY_SLICE = [{ name: 'None yet', value: 1, color: '#dce4ea' }]

const RecentActivity = ({ requests, loading, to = '/attendance/requests' }) => {
    const items = requests?.items || []
    const total = items.reduce((sum, item) => sum + item.value, 0)
    const data = total ? items : EMPTY_SLICE
    return (
        <section aria-labelledby='requests-chart-title' aria-busy={loading} className='glass-panel rise flex flex-col rounded-2xl p-5' style={{ '--i': 5 }}>
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <h2 id='requests-chart-title' className='text-[16px] font-semibold text-[var(--ink)]'>Requests by status</h2>
                    <p className='mt-0.5 text-[12px] text-slate-500'>{requests?.scope || 'Leave, work from home and corrections'}</p>
                </div>
                <Link to={to} className='press inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-[12px] font-semibold text-[var(--accent)] hover:bg-[#e6eef3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>Open</Link>
            </div>

            <div className='relative mx-auto mt-2 h-52 w-full max-w-[240px]'>
                {loading && !requests ? (
                    <div aria-hidden='true' className='absolute inset-4 rounded-full border-[26px] border-[#e6ecf1] [animation:ui-fade_600ms_ease-in-out_infinite_alternate]' />
                ) : (
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie data={data} dataKey='value' nameKey='name' innerRadius='68%' outerRadius='96%' paddingAngle={total ? 2 : 0} cornerRadius={6} stroke='none' startAngle={90} endAngle={-270} isAnimationActive={ANIMATE} animationDuration={700} animationEasing='ease-out'>
                                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                            {total > 0 && <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dce4ea', boxShadow: 'var(--shadow-card)', fontSize: 12 }} />}
                        </PieChart>
                    </ResponsiveContainer>
                )}
                <div aria-hidden='true' className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                    <span className='text-[26px] font-semibold leading-none tracking-tight text-[var(--ink)] tabular-nums'>{requests ? total : '—'}</span>
                    <span className='mt-1 text-[12px] text-slate-500'>requests</span>
                </div>
            </div>

            <ul className='mt-4 space-y-2'>
                {items.map((item) => (
                    <li key={item.name} className='flex items-center gap-2.5 text-[13px]'>
                        <span aria-hidden='true' className='h-2.5 w-2.5 shrink-0 rounded-[3px]' style={{ backgroundColor: item.color }} />
                        <span className='flex-1 text-slate-600'>{item.name}</span>
                        <span className='font-semibold text-[var(--ink)] tabular-nums'>{item.value}</span>
                        <span className='w-10 text-right text-slate-400 tabular-nums'>{total ? Math.round((item.value / total) * 100) : 0}%</span>
                    </li>
                ))}
                {!loading && requests && !total && <li className='text-[13px] text-slate-500'>No requests yet.</li>}
                {!loading && !requests && <li className='text-[13px] text-slate-500'>Request figures are not available right now.</li>}
            </ul>
        </section>
    )
}

export default RecentActivity
