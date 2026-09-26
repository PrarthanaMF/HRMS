import React from 'react'

const ExitFeedbackView = () => {
    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4'>
                <i className="fa-solid fa-comment-dots text-2xl"></i>
            </div>
            <h3 className='text-base font-bold text-slate-700 mb-1'>Employee Feedback</h3>
            <p className='text-sm text-slate-500'>Exit interview feedback records will appear here.</p>
        </div>
    )
}

export default ExitFeedbackView