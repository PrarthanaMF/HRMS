import React from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon'

// The section each screen belongs to, shown as the banner's gold label and in the breadcrumb
const SECTIONS = [
    ['/workforce', 'Workforce'],
    ['/recruitment', 'Hiring'],
    ['/attendance/applications', 'Approvals'],
    ['/attendance', 'Attendance'],
    ['/exit-process', 'Separations'],
    ['/master', 'Administration'],
    ['/onboarding', 'People'],
    ['/mis-reports', 'Insights'],
]
const sectionFor = (pathname) => SECTIONS.find(([prefix]) => pathname.startsWith(prefix))?.[1] || 'Workspace'
const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/*
 * Every screen opens with a midnight banner: a gold section label, the title, one line saying
 * what the page is for, and the page's actions on the right (they drop below on phones).
 * Above it, a breadcrumb and today's date. Buttons inside the banner switch to dark glass
 * (see .page-banner rules in index.css).
 */
export default function PageHeader({ icon, title, description, actions, eyebrow, children, className = '' }) {
    const { pathname } = useLocation()
    const section = eyebrow || sectionFor(pathname)

    return (
        <div className={`rise mb-5 ${className}`}>
            <div className='mb-3 flex items-center justify-between gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400'>
                <span className='min-w-0 truncate'>Workspace <span aria-hidden='true' className='mx-1.5 text-slate-300'>/</span><span className='text-slate-600'>{title}</span></span>
                <span className='hidden shrink-0 text-[12px] font-medium normal-case tracking-normal text-slate-500 sm:inline'>{today()}</span>
            </div>

            <header className='page-banner smoke-dark flex flex-col gap-4 rounded-[20px] px-5 py-5 shadow-[var(--shadow-pop)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6'>
                <div className='flex min-w-0 items-center gap-4'>
                    {icon && (
                        <span aria-hidden='true' className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] text-[#9fb8c9] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur'>
                            <Icon className={`${icon} text-[22px]`} />
                        </span>
                    )}
                    <div className='min-w-0'>
                        <p className='eyebrow'>{section}</p>
                        <h1 className='mt-1 text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[26px]'>{title}</h1>
                        {description && <p className='mt-1 max-w-[62ch] text-[13px] leading-5 text-slate-300'>{description}</p>}
                    </div>
                </div>
                {/* Actions sit on the right, including on phones where the banner stacks */}
                {actions && <div className='flex flex-wrap items-center justify-end gap-2'>{actions}</div>}
                {children}
            </header>
        </div>
    )
}

// Segmented control shared by every page's tab row (as the reference's Branch / Department toggle)
export const segClass = 'inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--canvas-2)]/80 p-1 backdrop-blur hide-scrollbar'
export const segItemClass = (active) => `press inline-flex h-9 shrink-0 items-center pointer-coarse:h-10 gap-2 whitespace-nowrap rounded-xl px-3.5 text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] ${active
    ? 'bg-white text-[var(--ink)] shadow-[0_1px_2px_rgb(8_26_46/0.08),0_6px_14px_-8px_rgb(8_26_46/0.25)]'
    : 'text-slate-500 hover:bg-white/60 hover:text-[var(--ink)]'}`

// Buttons. In a banner, .btn-secondary turns to dark glass (index.css).
export const primaryButton = 'press gradient-accent inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-semibold hover:brightness-105 hover:shadow-[0_16px_30px_-14px_rgb(43_100_133/0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryButton = 'btn-secondary press inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white/80 px-4 text-[13px] font-semibold text-[var(--ink)] shadow-[var(--shadow-card)] backdrop-blur hover:border-[var(--accent-line)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
export const darkButton = 'press inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--brand-800)] px-4 text-[13px] font-semibold text-white shadow-[0_10px_22px_-12px_rgb(8_26_46/0.9)] hover:bg-[var(--brand-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
