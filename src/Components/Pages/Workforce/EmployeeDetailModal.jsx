import React, { useEffect, useState } from 'react'
import { listDocuments, documentUrl, photoUrl } from '../../../api/employees'

const Section = ({ title, icon, children }) => (
    <div className='mb-5 last:mb-0'>
        <div className='flex items-center gap-2 mb-3 pb-2 border-b border-slate-100'>
            <div className='w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center'>
                <i className={`fa-solid ${icon} text-slate-500 text-xs`}></i>
            </div>
            <h4 className='text-xs font-bold text-slate-800 uppercase tracking-wide'>{title}</h4>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3'>
            {children}
        </div>
    </div>
)

const InfoRow = ({ label, value, mono = false, full = false }) => (
    <div className={full ? 'sm:col-span-2' : ''}>
        <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide mb-0.5'>{label}</p>
        <p className={`text-sm text-slate-700 break-words ${mono ? 'font-mono text-xs' : ''}`}>
            {value || '—'}
        </p>
    </div>
)

const time12 = (hhmm) => {
    if (!hhmm) return ''
    const [h, m] = hhmm.split(':').map(Number)
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// Photo from the backend, or initials when there is none
const Avatar = ({ employee, initials }) => {
    const [failed, setFailed] = useState(false)
    if (!failed) {
        return <img src={photoUrl(employee._id)} alt='' onError={() => setFailed(true)} className='w-20 h-20 rounded-2xl object-cover shrink-0' />
    }
    return (
        <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-[#062139] to-[#0a3f6e] flex items-center justify-center text-xl font-bold text-white shrink-0'>
            {initials}
        </div>
    )
}

// The documents this user may see, each a download link
const Documents = ({ employeeId }) => {
    const [state, setState] = useState({ documents: null, error: '' })

    useEffect(() => {
        let active = true
        listDocuments(employeeId).then(
            (documents) => { if (active) setState({ documents, error: '' }) },
            (error) => { if (active) setState({ documents: [], error: error.message }) },
        )
        return () => { active = false }
    }, [employeeId])

    if (state.error) return <p className='sm:col-span-2 text-xs text-red-700'>{state.error}</p>
    if (!state.documents) return <p className='sm:col-span-2 text-xs text-slate-400'>Loading documents…</p>
    if (!state.documents.length) return <p className='sm:col-span-2 text-xs text-slate-400'>No documents uploaded yet.</p>

    return state.documents.map((doc) => (
        <div key={doc._id}>
            <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide mb-0.5'>
                {doc.label}{doc.restricted && <i className='fa-solid fa-lock ml-1 text-[9px]' title='Salary roles only'></i>}
            </p>
            <a href={documentUrl(employeeId, doc._id)} className='text-sm text-[#1B4A7B] underline break-all'>
                {doc.originalName}
            </a>
        </div>
    ))
}

const EmployeeDetailModal = ({ employee, onClose, onEdit }) => {
    if (!employee) return null

    const initials = employee.name
        ? employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    const isActive = employee.status === 'Active'

    return (
        <div className='fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden'
                onClick={(e) => e.stopPropagation()}
            >

                {/* Compact gradient banner */}
                <div className='relative shrink-0'>
                    <div className='h-16 bg-gradient-to-r from-[#062139] to-[#0a3f6e]'></div>

                    {/* Single close button — top right */}
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition cursor-pointer'
                        aria-label='Close'
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Profile header */}
                <div className='px-6 pt-5 pb-5 border-b border-slate-100 bg-white'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-4'>

                        <Avatar key={employee._id} employee={employee} initials={initials} />

                        {/* Name + designation + status badge */}
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 flex-wrap'>
                                <h2 className='text-lg font-bold text-slate-800 truncate'>{employee.name}</h2>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    {employee.status}
                                </span>
                            </div>
                            <p className='text-sm text-slate-500 truncate'>
                                {employee.designation} · {employee.department}
                            </p>
                        </div>

                        {/* Edit button — HR only, and not for inactive employees */}
                        {onEdit && (isActive ? (
                            <button
                                onClick={() => onEdit(employee)}
                                className='flex items-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 cursor-pointer'
                            >
                                <i className="fa-solid fa-pen text-xs"></i>
                                Edit
                            </button>
                        ) : (
                            <button
                                disabled
                                title='Inactive employees cannot be edited'
                                className='flex items-center gap-2 bg-slate-200 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed shrink-0'
                            >
                                <i className="fa-solid fa-lock text-xs"></i>
                                Edit Disabled
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable body — all sections */}
                <div className='p-6 overflow-y-auto hide-scrollbar'>

                    <Section title='Personal Information' icon='fa-user'>
                        <InfoRow label='Employee Name' value={employee.name} />
                        <InfoRow label='Gender' value={employee.gender} />
                        <InfoRow label='Personal Number' value={employee.personalNumber} />
                        <InfoRow label='Personal Email' value={employee.personalEmail} />
                        <InfoRow label='Date of Birth' value={employee.dateOfBirth} />
                        <InfoRow label='Date of Anniversary' value={employee.dateOfAnniversary} />
                        <InfoRow label='Blood Group' value={employee.bloodGroup} />
                        <InfoRow label='Present Address' value={employee.presentAddress} full />
                        <InfoRow label='Permanent Address' value={employee.permanentAddress} full />
                    </Section>

                    <Section title='Employment Information' icon='fa-briefcase'>
                        <InfoRow label='Employee ID' value={employee.empId} mono />
                        <InfoRow label='Company' value={employee.company} />
                        <InfoRow label='Branch' value={employee.branch} />
                        <InfoRow label='Location' value={employee.location} />
                        <InfoRow label='Department' value={employee.department} />
                        <InfoRow label='Division' value={employee.division} />
                        <InfoRow label='Designation' value={employee.designation} />
                        <InfoRow label='Reporting Manager' value={employee.reportingManager} />
                        <InfoRow label='Date of Joining' value={employee.dateOfJoining} />
                        <InfoRow label='Employee Type' value={employee.employeeType} />
                        <InfoRow label='Status' value={employee.status} />
                    </Section>

                    <Section title='Attendance Set-up' icon='fa-fingerprint'>
                        <InfoRow label='Biometric Code' value={employee.biometricCode} mono />
                        <InfoRow label='Shift' value={`${time12(employee.shiftStart)} – ${time12(employee.shiftEnd)}`} />
                        <InfoRow label='Category' value={employee.category} />
                    </Section>

                    <Section title='Emergency Contact' icon='fa-phone'>
                        <InfoRow label='Contact Name' value={employee.emergencyContactName} />
                        <InfoRow label='Relation' value={employee.emergencyContactRelation} />
                        <InfoRow label='Contact Number' value={employee.emergencyContactNumber} />
                    </Section>

                    {employee.hasSalaryAccess ? (
                        <>
                            <Section title='Salary & Bank Details' icon='fa-indian-rupee-sign'>
                                <InfoRow label='Monthly Salary (gross)' value={employee.monthlySalary} />
                                <InfoRow label='Bank Name' value={employee.bankName} />
                                <InfoRow label='Account Number' value={employee.accountNumber} mono />
                                <InfoRow label='IFSC Code' value={employee.ifscCode} mono />
                            </Section>
                            <Section title='Identity' icon='fa-id-card'>
                                <InfoRow label='PAN Number' value={employee.panNumber} mono />
                                <InfoRow label='Aadhaar Number' value={employee.aadhaarNumber} mono />
                            </Section>
                        </>
                    ) : (
                        <Section title='Identity' icon='fa-id-card'>
                            <InfoRow label='Aadhaar Number' value={employee.aadhaarMasked} mono />
                        </Section>
                    )}

                    <Section title='Previous Employment' icon='fa-history'>
                        <InfoRow label='Previous Company' value={employee.previousCompanyName} />
                        <InfoRow label='Previous Manager' value={employee.previousCompanyManager} />
                        <InfoRow label='Contact' value={employee.previousCompanyContact} />
                    </Section>

                    <Section title='Company Contact' icon='fa-building'>
                        <InfoRow label='Official Email' value={employee.officialEmail} />
                        <InfoRow label='Company Contact Number' value={employee.companyNumber} />
                    </Section>

                    <Section title='Documents' icon='fa-file-alt'>
                        <Documents employeeId={employee._id} />
                    </Section>

                </div>

                {/* Footer with single Close button */}
                <div className='flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0'>
                    <button
                        onClick={onClose}
                        className='px-5 py-2.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer'
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EmployeeDetailModal
