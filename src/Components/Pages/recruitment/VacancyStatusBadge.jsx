import React from 'react'

const STYLES = {
    'Open': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'On Hold': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    'Closed': { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
}

const VacancyStatusBadge = ({ status }) => {
    const s = STYLES[status] || STYLES['Closed']
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {status}
        </span>
    )
}

export default VacancyStatusBadge