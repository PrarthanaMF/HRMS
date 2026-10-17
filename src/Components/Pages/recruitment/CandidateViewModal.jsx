import React from 'react'
import { createPortal } from 'react-dom'
import { CandidateCard } from './CandidateDetailsModal'
import { modalPanel, modalHeader, modalTitle, modalClose } from './ui'

import Icon from '../../Common/Icon'
// Pop-up with one candidate's complete details in card form (opened by the eye icon
// in the Recruitment Tracker table).
const CandidateViewModal = ({ candidate, onClose }) => {
    if (!candidate) return null

    return createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={onClose}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='candidate-view-title'
                className={`${modalPanel} max-w-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalHeader}>
                    <h2 id='candidate-view-title' className={`${modalTitle} pt-1.5`}>Candidate details</h2>
                    <button onClick={onClose} className={modalClose} aria-label='Close'>
                        <Icon className='fa-solid fa-xmark' />
                    </button>
                </div>
                <div className='p-4 sm:p-5 overflow-y-auto'>
                    <CandidateCard
                        c={candidate}
                        position={candidate.vacancyDesignation}
                        location={candidate.vacancyBranch}
                    />
                </div>
            </div>
        </div>
    , document.body)
}

export default CandidateViewModal
