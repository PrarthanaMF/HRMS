import React from 'react'
import { getTimelineInfo } from '../../../Utils/formatDate'

import Icon from '../../Common/Icon'
import { badgeBase } from './ui'

const TONES = {
    ok: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    soon: 'bg-amber-50 text-amber-700 ring-amber-200',
    overdue: 'bg-red-50 text-red-700 ring-red-200',
}

// Live countdown to the vacancy's target date. Recalculated from today's date on
// every render, so the number goes down by itself each day. Nothing to count down
// once the hiring is closed, so it's hidden then.
const TimelineBadge = ({ targetDate, status }) => {
    if (status === 'Closed') return null
    const info = getTimelineInfo(targetDate)
    if (!info) return null

    return (
        <span title={`Target date ${targetDate}, counted from today`} className={`${badgeBase} mt-1 ${TONES[info.tone]}`}>
            <Icon className='fa-regular fa-clock text-[10px]' />
            {info.label}
        </span>
    )
}

export default TimelineBadge
