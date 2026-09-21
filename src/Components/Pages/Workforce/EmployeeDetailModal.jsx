import React from 'react'

const InfoRow = ({ label, value }) => (
    <div className='flex flex-col py-2.5 border-b border-slate-100 last:border-0'>
        <p className='text-[10px] uppercase text-slate-400 font-semibold tracking-wide'>{label}</p>
        <p className='text-sm text-slate-700 break-words'>{value || '—'}</p>
    </div>
)

const EmployeeDetailModal = ({ employee, onClose, onEdit }) => {
    if (!employee) return null

    const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div className='fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4' onClick={onClose}>
            <div
                className='bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='relative'>
                    <div className='h-24 bg-gradient-to-r from-[#062139] to-[#0a3f6e] rounded-t-2xl'></div>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-white/70 hover:text-white w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition'
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className='px-6 pb-6'>
                    <div className='flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5'>
                        <div className='w-24 h-24 rounded-2xl bg-white p-1 shadow-md shrink-0'>
                            <div className='w-full h-full rounded-xl bg-gradient-to-br from-[#062139] to-[#0a3f6e] flex items-center justify-center text-2xl font-bold text-white'>
                                {initials}
                            </div>
                        </div>
                        <div className='flex-1 sm:mb-2'>
                            <h2 className='text-xl font-bold text-slate-800'>{employee.name}</h2>
                            <p className='text-sm text-slate-500'>{employee.designation}</p>
                        </div>
                        <button
                            onClick={() => onEdit(employee)}
                            className='flex items-center gap-2 bg-[#062139] hover:bg-[#0a2f52] text-white px-4 py-2 rounded-lg text-sm font-medium transition'
                        >
                            <i className="fa-solid fa-pen text-xs"></i>
                            Edit
                        </button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6'>
                        <InfoRow label='Employee ID' value={employee.empId} />
                        <InfoRow label='Status' value={employee.status} />
                        <InfoRow label='Email' value={employee.email} />
                        <InfoRow label='Phone' value={employee.phone} />
                        <InfoRow label='Department' value={employee.department} />
                        <InfoRow label='Designation' value={employee.designation} />
                        <InfoRow label='Branch' value={employee.branch} />
                        <InfoRow label='Company' value={employee.company} />
                        <InfoRow label='Reporting Manager' value={employee.reportingManager} />
                        <InfoRow label='Joining Date' value={employee.joiningDate} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeDetailModal