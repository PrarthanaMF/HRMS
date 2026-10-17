import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Icon from '../Components/Common/Icon'
import { ROLE_LABELS } from '../Utils/roles'
import { navFor } from '../Utils/nav'
import HomeStatis from '../Components/Pages/Home/HomeStatis'
import QuickAccess from '../Components/Pages/Home/QuickAccess'
import RecentActivity from '../Components/Pages/Home/RecentActivity'
import { dashboard } from '../api/dashboard'

const TIME_ZONE = 'Asia/Kolkata'
const greetingFor = (date) => {
    const hour = Number(date.toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: TIME_ZONE }))
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

// Shortcuts under the hero, in this order, if the signed-in role can open them. They are the
// attendance screens people open daily; the module cards below leave these out
const SHORTCUTS = ['My Requests', 'Attendance Report', 'Applications', 'Holidays', 'Upload Attendance']
const SHORTCUT_MODULES = ['Attendance']

// Live figures for the tiles and the chart; refreshed when the tab comes back into view
function useDashboard() {
    const user = useSelector((state) => state.auth.value)
    const viewerKey = user?._id ? JSON.stringify({ _id: user._id, role: user.role, employeeId: user.employeeId || null }) : ''
    const [state, setState] = useState({ data: null, loading: true })
    useEffect(() => {
        if (!viewerKey) return undefined
        let active = true
        const load = () => dashboard({ viewer: JSON.parse(viewerKey) }).then(
            (data) => { if (active) setState({ data, loading: false }) },
            () => { if (active) setState((previous) => ({ data: previous.data, loading: false })) },
        )
        load()
        const refresh = () => { if (document.visibilityState === 'visible') load() }
        document.addEventListener('visibilitychange', refresh)
        return () => { active = false; document.removeEventListener('visibilitychange', refresh) }
    }, [viewerKey])
    return state
}

function useNow(everyMs = 15000) {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), everyMs)
        return () => window.clearInterval(timer)
    }, [everyMs])
    return now
}

function Hero() {
    const user = useSelector((state) => state.auth.value)
    const now = useNow()
    const firstName = user?.name?.split(' ')[0] || 'there'
    const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE })
    // Parts, not string splitting: locales differ in where they put "pm"
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIME_ZONE }).formatToParts(now).map((part) => [part.type, part.value]))
    const hours = parts.hour
    const minutes = parts.minute
    const meridiem = (parts.dayPeriod || '').toUpperCase()

    return (
        <section aria-label='Welcome' className='smoke-dark rise rounded-[24px] px-6 pb-14 pt-7 shadow-[var(--shadow-pop)] sm:px-8'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                <div className='min-w-0'>
                    <p className='eyebrow'>{date}</p>
                    <h1 className='mt-3 text-[34px] leading-[1.05] text-white sm:text-[46px]'>
                        <span className='font-display'>{greetingFor(now)}, </span>
                        <span className='font-display gradient-text italic'>{firstName}.</span>
                    </h1>
                    <p className='mt-2 text-[14px] text-slate-300'>Here's your workspace for today.</p>
                    <div className='mt-4 flex flex-wrap gap-2'>
                        <span className='inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-semibold text-slate-100 backdrop-blur'>
                            <Icon className='fa-solid fa-user-shield text-[13px] text-[#9fb8c9]' />
                            {ROLE_LABELS[user?.role] || user?.role}
                        </span>
                        {user?.empId && (
                            <span className='inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 font-mono text-[12px] font-semibold text-slate-100 backdrop-blur'>
                                <Icon className='fa-solid fa-id-card text-[13px] text-[#9fb8c9]' />
                                {user.empId}
                            </span>
                        )}
                    </div>
                </div>

                {/* Live clock in a smoked-glass card */}
                <div role='timer' aria-label={`Time in India: ${hours}:${minutes} ${meridiem}`} className='w-full shrink-0 rounded-[18px] border border-white/12 bg-white/[0.06] p-5 text-right shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-md sm:w-auto sm:min-w-[240px]'>
                    <p className='flex items-center justify-end gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9fb8c9]'>
                        <Icon className='fa-regular fa-clock text-[13px]' />
                        Now in India
                    </p>
                    <p aria-hidden='true' className='mt-2 font-semibold tabular-nums leading-none text-white'>
                        <span className='text-[44px] tracking-tight'>{hours}<span className='[animation:clock-blink_1s_steps(2,start)_infinite]'>:</span>{minutes}</span>
                        <span className='ml-1.5 text-[15px] text-[#9fb8c9]'>{meridiem}</span>
                    </p>
                    <p className='mt-1.5 text-[12px] text-slate-300'>India Standard Time</p>
                </div>
            </div>
        </section>
    )
}

function Shortcuts() {
    const role = useSelector((state) => state.auth.value?.role)
    const items = navFor(role).flatMap((item) => item.children || [item])
    const shortcuts = SHORTCUTS.map((name) => items.find((item) => item.name === name)).filter(Boolean)
    return (
        <nav aria-label='Shortcuts' className='relative z-10 -mt-7 grid grid-cols-2 gap-2.5 px-3 sm:flex sm:flex-wrap sm:px-6'>
            {shortcuts.map((item, index) => (
                <Link
                    key={item.path}
                    to={item.path}
                    style={{ '--i': index + 1 }}
                    className='rise lift press group inline-flex min-h-12 items-center gap-2.5 rounded-2xl border border-white bg-white/90 py-1.5 pl-1.5 pr-3 text-[13px] font-semibold leading-tight text-[var(--ink)] shadow-[var(--shadow-lift)] backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] sm:pr-4'
                >
                    <span aria-hidden='true' className='flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-800)] text-[#9fb8c9] transition-colors group-hover:bg-[var(--brand-600)]'>
                        <Icon className={`${item.icon} text-[16px]`} />
                    </span>
                    {item.name}
                </Link>
            ))}
        </nav>
    )
}

const Home = () => {
    const { data, loading } = useDashboard()
    const requestsPath = data?.requests?.scope?.startsWith('Requests you') ? '/attendance/applications' : '/attendance/requests'
    return (
        <div className='pb-6'>
            <Hero />
            <Shortcuts />
            <div className='mt-7'>
                <HomeStatis stats={data?.stats} loading={loading} />
            </div>
            <div className='mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
                <QuickAccess exclude={SHORTCUT_MODULES} />
                <RecentActivity requests={data?.requests} loading={loading} to={requestsPath} />
            </div>
        </div>
    )
}

export default Home
