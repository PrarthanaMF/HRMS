import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const StagePlaceholder = ({ stage }) => {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div className='w-full max-w-3xl mx-auto'>
            <button
                onClick={() => navigate(`/exit-process/records/${id}`)}
                className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-4 transition cursor-pointer'
            >
                <i className="fa-solid fa-arrow-left text-xs"></i>
                Back to Details
            </button>

            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <div className='w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4'>
                    <i className="fa-solid fa-hourglass-half text-2xl"></i>
                </div>
                <h3 className='text-base font-bold text-slate-700 mb-1'>Stage {stage} — Coming Soon</h3>
                <p className='text-sm text-slate-500'>This stage form is being built.</p>
            </div>
        </div>
    )
}

export default StagePlaceholder