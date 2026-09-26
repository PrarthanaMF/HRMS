import React from 'react'

const AttritionView = () => {
    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4'>
                <i className="fa-solid fa-chart-pie text-2xl"></i>
            </div>
            <h3 className='text-base font-bold text-slate-700 mb-1'>Attrition Report</h3>
            <p className='text-sm text-slate-500'>Attrition analytics and trends will appear here.</p>
        </div>
    )
}

export default AttritionView