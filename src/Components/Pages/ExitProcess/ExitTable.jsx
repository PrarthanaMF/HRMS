import React from 'react'
import { useSelector } from 'react-redux'
import { selectFilteredExits } from '../../../Store/Redux/ExitProcess/ExitSlice'

const StatusBadge = ({ status }) => {
    const styles = {
        'Pending HR':      'bg-amber-50 text-amber-700 border-amber-200',
        'HR Reviewing':    'bg-blue-50 text-blue-700 border-blue-200',
        'F&F Initiated':   'bg-indigo-50 text-indigo-700 border-indigo-200',
        'F&F Pending':     'bg-purple-50 text-purple-700 border-purple-200',
        'No Due Cleared':  'bg-teal-50 text-teal-700 border-teal-200',
        'Withdrawn':       'bg-slate-100 text-slate-600 border-slate-200',
        'Exited':          'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
    const dots = {
        'Pending HR':      'bg-amber-500',
        'HR Reviewing':    'bg-blue-500',
        'F&F Initiated':   'bg-indigo-500',
        'F&F Pending':     'bg-purple-500',
        'No Due Cleared':  'bg-teal-500',
        'Withdrawn':       'bg-slate-400',
        'Exited':          'bg-emerald-500',
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-slate-400'}`}></span>
            {status}
        </span>
    )
}

const Initials = ({ name }) => {
    const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return (
        <div className='w-9 h-9 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0'>
            {initials}
        </div>
    )
}

const ExitTable = ({ onMoreInfo }) => {
    const exits = useSelector(selectFilteredExits)

    if (exits.length === 0) {
        return (
            <div className='bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center'>
                <i className="fa-solid fa-person-running text-4xl text-slate-300 mb-3"></i>
                <p className='text-slate-500 text-sm'>No exit records match your filters</p>
            </div>
        )
    }

    return (
        <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>

            {/* Desktop table */}
            <div className='hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto hide-scrollbar'>
                <table className='w-full text-sm'>
                    <thead className='bg-[#062139] border-b border-[#0a2f52] sticky top-0 z-10'>
                        <tr className='text-left text-[11px] uppercase text-slate-200 font-semibold tracking-wide'>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Emp ID</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Employee</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Department</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Designation</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Branch</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Resignation Date</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Last Working Date</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10'>Status</th>
                            <th className='px-4 py-3 sticky top-0 bg-[#062139] z-10 text-center'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exits.map((e) => (
                            <tr key={e._id} className='border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition'>
                                <td className='px-4 py-3 whitespace-nowrap'>
                                    <span className='font-mono text-xs font-semibold text-slate-700'>{e.empId}</span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2.5'>
                                        <Initials name={e.name} />
                                        <div className='min-w-0'>
                                            <p className='text-sm font-medium text-slate-800 truncate'>{e.name}</p>
                                            <p className='text-[11px] text-slate-400 truncate'>{e.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap'>{e.department}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap'>{e.designation}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap'>{e.branch}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap'>{e.resignationDate}</td>
                                <td className='px-4 py-3 text-slate-600 text-[13px] whitespace-nowrap'>{e.lastWorkingDate}</td>
                                <td className='px-4 py-3'>
                                    <StatusBadge status={e.status} />
                                </td>
                                <td className='px-4 py-3 text-center'>
                                    <button
                                        onClick={() => onMoreInfo(e)}
                                        className='w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#062139] hover:text-white text-slate-600 transition inline-flex items-center justify-center cursor-pointer'
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

            {/* Mobile cards */}
            <div className='md:hidden divide-y divide-slate-100'>
                {exits.map((e) => (
                    <div key={e._id} className='p-4 flex items-start gap-3'>
                        <Initials name={e.name} />
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2 mb-1'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-slate-800 truncate'>{e.name}</p>
                                    <p className='text-[11px] text-slate-400 truncate'>{e.empId} · {e.branch}</p>
                                </div>
                                <StatusBadge status={e.status} />
                            </div>
                            <div className='grid grid-cols-2 gap-2 mt-2 text-[11px]'>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Department</p>
                                    <p className='text-slate-600 truncate'>{e.department}</p>
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[9px] uppercase text-slate-400 font-semibold tracking-wide'>Last Working</p>
                                    <p className='text-slate-600 truncate'>{e.lastWorkingDate}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onMoreInfo(e)}
                                className='mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#062139] hover:text-[#0a3f6e] transition cursor-pointer'
                            >
                                <i className="fa-solid fa-eye text-[10px]"></i>
                                View Full Details
                                <i className="fa-solid fa-arrow-right text-[9px]"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50'>
                <p className='text-xs text-slate-500'>
                    Showing <span className='font-semibold text-slate-700'>{exits.length}</span> exit records
                </p>
            </div>
        </div>
    )
}

export default ExitTable