/*
 * Class names shared by the recruitment screens, so badges, fields, row buttons and modals look
 * the same everywhere (see DESIGN.md). Full class strings are spelled out so Tailwind sees them.
 */

// Status / stage badges: small rounded rectangles with an inset ring, never pills
export const badgeBase = 'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset'

// Same colour meaning as STAGE_STYLES in Utils/mockRecruitment, as ring colours
export const STAGE_BADGE = {
    Shortlist: 'bg-sky-50 text-sky-700 ring-sky-200',
    Interview: 'bg-amber-50 text-amber-700 ring-amber-200',
    'Final Round': 'bg-orange-50 text-orange-700 ring-orange-200',
    Reject: 'bg-red-50 text-red-700 ring-red-200',
    Offer: 'bg-violet-50 text-violet-700 ring-violet-200',
    Join: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'On Hold': 'bg-slate-100 text-slate-600 ring-slate-200',
}
export const stageBadgeClass = (stage) => `${badgeBase} ${STAGE_BADGE[stage] || 'bg-slate-50 text-slate-500 ring-slate-200'}`

// Form fields
export const inputClass = 'h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6485]'
export const textareaClass = 'w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b6485]'
export const labelClass = 'text-[13px] font-medium text-slate-700'
export const errorRing = 'border-red-300 ring-1 ring-inset ring-red-200'

// Small row buttons: the primary / secondary look at 32px
const rowBase = 'press inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
export const rowPrimary = `${rowBase} gradient-brand text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)] hover:brightness-110`
export const rowSecondary = `${rowBase} border border-slate-200/80 bg-white/80 text-[var(--brand-600)] hover:border-[#cfdce5] hover:bg-white`
export const rowIcon = 'press inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white hover:text-[var(--brand-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2'
// Touch-size icon button for mobile cards
export const touchIcon = 'press inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white hover:text-[var(--brand-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-2'

// Tables
export const theadClass = 'bg-[#edf1f4] border-b border-[var(--line)]'
// Headers may wrap on tablets so the table always fits its box; from lg they stay on one line
export const thClass = 'px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 lg:whitespace-nowrap'
// Columns that only earn their space on wider screens (the phone cards show every field)
export const fromLg = 'hidden lg:table-cell'
export const fromXl = 'hidden xl:table-cell'
export const rowClass = 'border-b border-slate-100 last:border-0 hover:bg-[#f2f5f7]/60 transition-colors'

// Modals
export const modalPanel = 'glass-strong rounded-2xl shadow-[var(--shadow-pop)] [animation:ui-pop_220ms_var(--ease-out)_backwards] w-full max-h-[90vh] flex flex-col'
export const modalHeader = 'flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 shrink-0'
export const modalTitle = 'text-base font-semibold leading-snug text-[var(--ink)]'
export const modalClose = 'press -mr-1.5 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'

// Small field caption in detail grids and mobile cards
export const metaLabel = 'text-xs text-slate-500'
