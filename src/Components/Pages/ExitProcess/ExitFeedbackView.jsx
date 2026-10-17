import React from 'react'

import Icon from '../../Common/Icon'
const ExitFeedbackView = () => {
    return (
        <div className='rise glass-panel rounded-2xl px-6 py-10 sm:p-12 text-center' style={{ '--i': 1 }}>
            <span aria-hidden='true' className='mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E3EEF6] to-[#CFE2F0] text-[var(--brand-600)] ring-1 ring-inset ring-white'>
                <Icon className="fa-solid fa-comment-dots text-xl sm:text-2xl" />
            </span>
            <h3 className='text-[15px] font-semibold text-[var(--ink)] mb-1'>Employee feedback</h3>
            <p className='mx-auto max-w-[46ch] text-[13px] text-slate-500'>Exit interview feedback records will appear here. Feedback is collected in stage 3 of each exit record.</p>
        </div>
    )
}

export default ExitFeedbackView
