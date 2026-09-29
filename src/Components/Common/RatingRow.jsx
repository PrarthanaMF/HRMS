import React, { useState } from 'react'

const LABELS = {
    1: { text: 'Very Poor', color: 'text-red-600' },
    2: { text: 'Poor',      color: 'text-orange-600' },
    3: { text: 'Average',   color: 'text-amber-600' },
    4: { text: 'Good',      color: 'text-lime-600' },
    5: { text: 'Excellent', color: 'text-emerald-600' },
}

const colorFor = (n) => {
    switch (n) {
        case 1: return 'bg-red-500 border-red-500 text-white'
        case 2: return 'bg-orange-500 border-orange-500 text-white'
        case 3: return 'bg-amber-400 border-amber-400 text-white'
        case 4: return 'bg-lime-500 border-lime-500 text-white'
        case 5: return 'bg-emerald-500 border-emerald-500 text-white'
        default: return ''
    }
}

const RatingRow = ({ label, value, onChange, error, readOnly = false }) => {
    const [hover, setHover] = useState(0)

    return (
        <div className='py-3 border-b border-slate-100 last:border-0'>
            {/* Stack vertically on mobile, side-by-side on larger screens */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>

                {/* Label */}
                <p className='text-xs text-slate-700 sm:flex-1 sm:pr-4'>{label}</p>

                {/* Chips + rating label */}
                <div className='flex items-center gap-2 sm:gap-3 shrink-0'>

                    {/* Chips — smaller on mobile */}
                    <div className='flex items-center gap-1 sm:gap-1.5'>
                        {[1, 2, 3, 4, 5].map((n) => {
                            const active = value === n

                            // ---- Read-only ----
                            if (readOnly) {
                                return (
                                    <span
                                        key={n}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center justify-center ${
                                            active ? colorFor(n) : 'bg-slate-50 border-slate-200 text-slate-300'
                                        }`}
                                    >
                                        {n}
                                    </span>
                                )
                            }

                            // ---- Interactive ----
                            const preview = !active && hover > 0 && n <= hover
                            return (
                                <button
                                    key={n}
                                    type='button'
                                    onClick={() => onChange(n)}
                                    onMouseEnter={() => setHover(n)}
                                    onMouseLeave={() => setHover(0)}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
                                        active
                                            ? colorFor(n)
                                            : preview
                                                ? 'bg-slate-100 border-slate-200 text-slate-600'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {n}
                                </button>
                            )
                        })}
                    </div>

                    {/* Rating label — smaller text on mobile */}
                    <span className={`text-[10px] sm:text-[11px] font-semibold min-w-[60px] sm:min-w-[72px] text-right transition ${
                        value > 0 ? LABELS[value].color : 'text-slate-300'
                    }`}>
                        {value > 0 ? LABELS[value].text : '—'}
                    </span>
                </div>
            </div>

            {error && !readOnly && (
                <p className='text-[11px] text-red-600 flex items-center gap-1 mt-1'>
                    <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                    {error}
                </p>
            )}
        </div>
    )
}

export default RatingRow