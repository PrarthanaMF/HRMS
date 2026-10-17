import React from 'react'

import Icon from '../../../Common/Icon'
const ProgressStepper = ({ steps, activeStep, completedSteps, onStepClick }) => {
    return (
        <div className='glass-panel hide-scrollbar overflow-x-auto rounded-2xl px-3 py-2.5 md:px-5'>

            <div className='flex items-center min-w-max md:min-w-0'>

                {steps.map((step, idx) => {
                    const isActive = idx === activeStep
                    const isCompleted = completedSteps.includes(idx)
                    const clickable = idx <= activeStep || isCompleted

                    return (
                        <React.Fragment key={step.key}>

                            <button
                                type='button'
                                disabled={!clickable}
                                onClick={() => clickable && onStepClick(idx)}
                                className={`press flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] md:gap-3 ${clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums transition-colors ${isActive
                                        ? 'gradient-brand text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)]'
                                        : isCompleted
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                                            : 'bg-white/80 text-slate-500 ring-1 ring-inset ring-slate-200/80'
                                    }`}>
                                    {isCompleted && !isActive ? (
                                        <Icon className="fa-solid fa-check text-xs" />
                                    ) : (
                                        idx + 1
                                    )}
                                </span>

                                <p className={`whitespace-nowrap text-xs md:text-[13px] ${isActive ? 'font-semibold text-[var(--ink)]' : 'text-slate-500 font-medium'
                                    }`}>
                                    {step.label}
                                </p>
                            </button>

                            {idx < steps.length - 1 && (
                                <div className={`mx-1 h-0.5 w-6 shrink-0 rounded-full transition-colors md:mx-3 md:w-auto md:flex-1 md:shrink ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                                    }`} />
                            )}

                        </React.Fragment>
                    )
                })}

            </div>
        </div>
    )
}

export default ProgressStepper