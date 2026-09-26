import React from 'react'
import { getTimelineInfo } from '../../../Utils/formatDate'

const TONES = {
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    soon: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-red-50 text-red-600 border-red-200',
}

// Live countdown to the vacancy's target date. Recalculated from today's date on
// every render, so the number goes down by itself each day. Nothing to count down
// once the hiring is closed, so it's hidden then.
const TimelineBadge = ({ targetDate, status }) => {
    if (status === 'Closed') return null
    const info = getTimelineInfo(targetDate)
    if (!info) return null

    return (
        <span title={`Target date ${targetDate}, counted from today`} className={`inline-flex items-center gap-1 mt-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${TONES[info.tone]}`}>
            <i className='fa-regular fa-clock text-[9px]'></i>
            {info.label}
        </span>
    )
}

export default TimelineBadge