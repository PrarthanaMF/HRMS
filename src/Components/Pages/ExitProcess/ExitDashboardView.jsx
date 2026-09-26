import React from 'react'

const ExitDashboardView = () => {
    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4'>
                <i className="fa-solid fa-chart-line text-2xl"></i>
            </div>
            <h3 className='text-base font-bold text-slate-700 mb-1'>Exit Dashboard</h3>
            <p className='text-sm text-slate-500'>Employee exit list and summary will appear here.</p>
        </div>
    )
}

export default ExitDashboardView