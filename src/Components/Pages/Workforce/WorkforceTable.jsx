import React from 'react'
import { useSelector } from 'react-redux'
import { selectFilteredEmployees } from '../../../Store/Redux/Workforce/EmployeeSlice'

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status === 'Active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
        {status}
    </span>
)

const Initials = ({ name, size = 'md' }) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const cls = size === 'sm'
        ? 'w-9 h-9 text-[10px]'
        : 'w-8 h-8 text-[10px]'
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-[#062139] to-[#0a3f6e] flex items-center justify-center font-bold text-white shrink-0`}>
            {initials}
        </div>
    )
}

const WorkforceTable = ({ onMoreInfo }) => {
    const employees = useSelector(selectFilteredEmployees)

    if (employees.length === 0) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className="fa-solid fa-users-slash text-4xl text-slate-300 mb-3"></i>
                <p className='text-slate-500 text-sm'>No employees match your filters</p>
            </div>
        )
    }

    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

            {/* ============ DESKTOP TABLE ============ */}
            <div className='hidden md:block overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead className='bg-[#062139] border-b border-[#0a2f52]'>
                        <tr className='text-left text-[11px] uppercase text-slate-200 font-semibold tracking-wide'>
                            <th className='px-4 py-3'>Emp ID</th>
                            <th className='px-4 py-3'>Employee Details</th>
                            <th className='px-4 py-3'>Department</th>
                            <th className='px-4 py-3'>Designation</th>
                            <th className='px-4 py-3'>Branch</th>
                            <th className='px-4 py-3'>Status</th>
                            <th className='px-4 py-3 text-center'>More Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp._id} className='border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition'>
                                <td className='px-4 py-3'>
                                    <span className='font-mono text-xs font-semibold text-slate-700'>{emp.empId}</span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2.5'>
                                        <Initials name={emp.name} size='sm' />
                                        <div className='min-w-0'>
                                            <p className='text-sm font-medium text-slate-800 truncate'>{emp.name}</p>
                                            <p className='text-[11px] text-slate-400 truncate'>{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-slate-600 text-[13px]'>{emp.department}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px]'>{emp.designation}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px]'>{emp.branch}</td>
                                <td className='px-4 py-3'><StatusBadge status={emp.status} /></td>
                                <td className='px-4 py-3 text-center'>
                                    <button
                                        onClick={() => onMoreInfo(emp)}
                                        className='w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center'
                                        title='View full details'
                                    >
                                        <i className="fa-solid fa-eye text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ============ MOBILE CARDS ============ */}
            <div className='md:hidden divide-y divide-slate-100'>
                {employees.map((emp) => (
                    <div key={emp._id} className='p-4 flex items-start gap-3'>

                        <Initials name={emp.name} size='sm' />

                        <div className='flex-1 min-w-0'>
                            {/* Name + Status */}
                            <div className='flex items-start justify-between gap-2 mb-1'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-slate-800 truncate'>{emp.name}</p>
                                    <p className='text-[11px] text-slate-400 truncate'>{emp.empId} · {emp.branch}</p>
                                </div>
                                <StatusBadge status={emp.status} />
                            </div>

                            {/* Department + Designation */}
                            <div className='grid grid-cols-2 gap-2 mt-2 text-[11px]'>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Department</p>
                                    <p className='text-slate-600 truncate'>{emp.department}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Designation</p>
                                    <p className='text-slate-600 truncate'>{emp.designation}</p>
                                </div>
                            </div>

                            {/* More Info button */}
                            <button
                                onClick={() => onMoreInfo(emp)}
                                className='mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#062139] hover:text-[#0a3f6e] transition'
                            >
                                <i className="fa-solid fa-eye text-[10px]"></i>
                                More Info
                                <i className="fa-solid fa-arrow-right text-[9px]"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className='flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50'>
                <p className='text-xs text-slate-500'>
                    Showing <span className='font-semibold text-slate-700'>{employees.length}</span> employees
                </p>
            </div>
        </div>
    )
}

export default WorkforceTable