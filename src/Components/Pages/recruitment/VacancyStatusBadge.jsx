import React from 'react'
import { badgeBase } from './ui'

const STYLES = {
    'Open': { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    'On Hold': { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
    'Closed': { badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
}

const VacancyStatusBadge = ({ status }) => {
    const s = STYLES[status] || STYLES['Closed']
    return (
        <span className={`${badgeBase} gap-1.5 ${s.badge}`}>
            <span aria-hidden='true' className={`h-1.5 w-1.5 rounded-full ${s.dot}`}></span>
            {status}
        </span>
    )
}

export default VacancyStatusBadge
