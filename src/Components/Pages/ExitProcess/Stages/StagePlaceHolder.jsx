import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Icon from '../../../Common/Icon'
const StagePlaceholder = ({ stage }) => {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div className='w-full max-w-3xl mx-auto'>
            <button
                type='button'
                onClick={() => navigate(`/exit-process/records/${id}`)}
                className='press -ml-3 mb-3 inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-[var(--ink)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'
            >
                <Icon className="fa-solid fa-arrow-left text-xs" />
                Back to details
            </button>

            <div className='rise glass-panel rounded-2xl px-6 py-10 sm:p-12 text-center'>
                <span aria-hidden='true' className='mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-[#E3EEF6] text-slate-500 ring-1 ring-inset ring-white'>
                    <Icon className="fa-solid fa-hourglass-half text-xl sm:text-2xl" />
                </span>
                <h3 className='text-[15px] font-semibold text-[var(--ink)] mb-1'>Stage {stage} is coming soon</h3>
                <p className='text-[13px] text-slate-500'>This stage form is being built. Go back to the record details to continue.</p>
            </div>
        </div>
    )
}

export default StagePlaceholder
