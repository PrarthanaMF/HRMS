import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../Common/Icon'

// Each tile's tint (static class names so Tailwind sees them)
const TONES = {
    sky: { tile: 'bg-[#e6eef3] text-[#1f4e6b] ring-[#cfdce5]', glow: 'bg-[#4a8cb0]/45', edge: 'border-[#cfdce5]' },
    navy: { tile: 'bg-[#dce6ed] text-[#1f4e6b] ring-[#9fb8c9]', glow: 'bg-[#6f9bb4]/35', edge: 'border-white' },
    sage: { tile: 'bg-[#e7f4ed] text-[#1d7f56] ring-[#bfe3cf]', glow: 'bg-[#7fd1a8]/35', edge: 'border-white' },
    rose: { tile: 'bg-[#fbecea] text-[#b4372b] ring-[#f3c9c3]', glow: 'bg-[#f4aaa0]/40', edge: 'border-white' },
}

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Counts from 0 to the figure the first time it arrives (ease-out, ~700ms); still under reduced motion
function useCountUp(target) {
    const [value, setValue] = useState(REDUCED ? target : 0)
    useEffect(() => {
        if (target == null) return undefined
        if (REDUCED) { setValue(target); return undefined }
        const start = performance.now()
        let frame = 0
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / 700)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(target * eased)
            if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target])
    return value
}

function Figure({ value, format }) {
    const shown = useCountUp(value)
    if (value == null) return <span className='text-slate-400'>—</span>
    return format ? format(shown) : Math.round(shown).toLocaleString('en-IN')
}

function StatTile({ stat, index }) {
    const tone = TONES[stat.tone]
    return (
        <Link
            to={stat.to || '/'}
            style={{ '--i': index + 2 }}
            className={`glass-panel rise lift press relative isolate block min-w-0 overflow-hidden rounded-[20px] border p-4 sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] ${tone.edge}`}
        >
            {/* Soft light in the far corner, in the tile's tint */}
            <span aria-hidden='true' className={`pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full blur-2xl ${tone.glow}`} />
            <div className='flex items-start gap-3'>
                <span aria-hidden='true' className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${tone.tile}`}>
                    <Icon className={`${stat.icon} text-[19px]`} />
                </span>
                <p className='pt-1 text-[13px] font-medium text-slate-500'>{stat.name}</p>
            </div>
            <p className='mt-4 text-[28px] font-bold leading-none tracking-tight text-[var(--ink)] tabular-nums sm:text-[30px]'>
                <Figure value={stat.value} format={stat.format} />
            </p>
            <p className='mt-2 min-h-4 text-[12px] text-slate-500'>{stat.value == null ? 'Not available right now' : stat.note}</p>
        </Link>
    )
}

const Placeholder = ({ index }) => (
    <div style={{ '--i': index + 2 }} className='glass-panel rise rounded-[20px] border border-white p-4 sm:p-5' aria-hidden='true'>
        <div className='flex items-center gap-3'>
            <div className='skeleton h-11 w-11 rounded-2xl' />
            <div className='skeleton h-3 w-24' />
        </div>
        <div className='skeleton mt-5 h-7 w-20' />
        <div className='skeleton mt-3 h-2.5 w-28' />
    </div>
)

const HomeStatis = ({ stats, loading }) => (
    <section aria-label='Key figures' aria-busy={loading} className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {loading && !stats
            ? [0, 1, 2, 3].map((index) => <Placeholder key={index} index={index} />)
            : (stats || []).map((stat, index) => <StatTile key={stat.key} stat={stat} index={index} />)}
    </section>
)

export default HomeStatis
