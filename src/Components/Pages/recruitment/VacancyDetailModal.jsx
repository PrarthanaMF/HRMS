import React from 'react'
import { createPortal } from 'react-dom'
import VacancyStatusBadge from './VacancyStatusBadge'
import { formatTimestamp } from '../../../Utils/formatDate'
import { primaryButton } from '../../Common/PageHeader'
import { modalPanel, modalHeader, modalTitle, modalClose, metaLabel } from './ui'

import Icon from '../../Common/Icon'
const InfoRow = ({ label, value }) => (
    <div className='flex flex-col gap-0.5 py-2.5 border-b border-slate-100 last:border-0'>
        <p className={metaLabel}>{label}</p>
        <p className='text-sm text-slate-700 break-words whitespace-pre-line'>{value || '—'}</p>
    </div>
)

const VacancyDetailModal = ({ vacancy, onClose, onUpdate }) => {
    if (!vacancy) return null

    return createPortal(
        <div className='fixed inset-0 bg-slate-950/40 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-4 [animation:ui-fade_160ms_ease-out_backwards]' onClick={onClose}>
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='vacancy-detail-title'
                className={`${modalPanel} max-w-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalHeader}>
                    <div className='min-w-0'>
                        <p className='text-xs font-medium text-slate-500 tabular-nums'>S.No {vacancy.jobId}</p>
                        <h2 id='vacancy-detail-title' className={`${modalTitle} mt-0.5 text-lg`}>{vacancy.designation}</h2>
                        <div className='mt-2'><VacancyStatusBadge status={vacancy.status} /></div>
                    </div>
                    <button onClick={onClose} className={modalClose} aria-label='Close'>
                        <Icon className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div className='px-5 pb-5 pt-3 overflow-y-auto'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
                        <InfoRow label='Requestor name' value={vacancy.requestorName} />
                        <InfoRow label='Branch' value={vacancy.branch} />
                        <InfoRow label='Designation' value={vacancy.designation} />
                        <InfoRow label='Salary range' value={vacancy.salaryRange} />
                        <InfoRow label='No. of vacancies' value={vacancy.openings} />
                        <InfoRow label='Experience required' value={vacancy.experienceRequired} />
                        <InfoRow label='Target date' value={vacancy.targetDate} />
                        <InfoRow label='Requested on' value={formatTimestamp(vacancy.requestedOn)} />
                    </div>

                    <div className='mt-3'>
                        <InfoRow label='Job description' value={vacancy.jobDescription} />
                    </div>

                    {/* Disabled (not hidden) once the hiring request is closed */}
                    <div className='flex justify-end mt-4'>
                        <button
                            onClick={() => onUpdate(vacancy)}
                            disabled={vacancy.status === 'Closed'}
                            title={vacancy.status === 'Closed' ? 'This hiring request is closed' : undefined}
                            className={primaryButton}
                        >
                            Update request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    , document.body)
}

export default VacancyDetailModal
