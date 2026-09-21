import React from 'react'

const ProgressStepper = ({ steps, activeStep, completedSteps, onStepClick }) => {
    return (
        <div className='bg-white rounded-t-xl border border-slate-100 border-b-0 px-4 md:px-6 py-4 overflow-x-auto'>

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
                                className={`flex items-center gap-2 md:gap-3 shrink-0 transition ${clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${isActive
                                        ? 'bg-[#062139] text-white shadow-md'
                                        : isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {isCompleted && !isActive ? (
                                        <i className="fa-solid fa-check text-xs"></i>
                                    ) : (
                                        idx + 1
                                    )}
                                </span>

                                <p className={`text-[11px] md:text-xs whitespace-nowrap ${isActive ? 'text-slate-800 font-semibold' : 'text-slate-500 font-medium'
                                    }`}>
                                    {step.label}
                                </p>
                            </button>

                            {idx < steps.length - 1 && (
                                <div className={`h-0.5 w-6 md:w-auto md:flex-1 md:mx-3 rounded transition ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
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