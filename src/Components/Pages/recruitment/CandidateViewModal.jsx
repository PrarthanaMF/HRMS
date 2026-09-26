import React from 'react'
import { CandidateCard } from './CandidateDetailsModal'

// Pop-up with one candidate's complete details in card form (opened by the eye icon
// in the Recruitment Tracker table).
const CandidateViewModal = ({ candidate, onClose }) => {
    if (!candidate) return null

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='relative bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl px-6 py-4 shrink-0'>
                    <button
                        onClick={onClose}
                        className='absolute top-3 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                        aria-label='Close'
                    >
                        <i className='fa-solid fa-xmark'></i>
                    </button>
                    <h2 className='text-base font-bold text-white pr-10'>Candidate Details</h2>
                </div>
                <div className='p-5 overflow-y-auto'>
                    <CandidateCard
                        c={candidate}
                        position={candidate.vacancyDesignation}
                        location={candidate.vacancyBranch}
                    />
                </div>
            </div>
        </div>
    )
}

export default CandidateViewModal