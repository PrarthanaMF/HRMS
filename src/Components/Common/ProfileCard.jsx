import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeAuth } from '../../Store/Redux/Login/AuthSlice'

const ROLE_STYLES = {
    'Super_admin': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'Admin': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Management': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    'HR_manager': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'HR_executive': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    'Manager': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    'Team_leader': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Employee': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
}

const ProfileCard = () => {
    const user = useSelector(state => state.auth.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!user || !user._id) return null

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES['Employee']
    const displayRole = user.role.replace(/_/g, ' ')

    const handleMyProfile = () => {
        setIsOpen(false)
        navigate('/profile')
    }

    const handleLogout = () => {
        setIsOpen(false)
        dispatch(removeAuth())
        navigate('/login')
    }

    return (
        <div className='relative' ref={dropdownRef}>

            {/* ============ TRIGGER ============ */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 border border-gray-400/20 rounded-xl cursor-pointer duration-200 select-none px-2 md:px-2.5 h-10 hover:bg-gray-100 transition-colors max-w-[200px] md:max-w-none'
            >
                {/* Avatar */}
                <span className='w-6 h-6 leading-6 block rounded-[50%] text-slate-700 bg-slate-200 text-center text-[10px] font-bold shrink-0'>
                    {initials}
                </span>

                {/* Name + Role — visible on all screens */}
                <div className='flex flex-col text-left min-w-0'>
                    <span className='text-[11px] md:text-[12px] font-medium text-gray-700 leading-tight truncate'>
                        {user.name}
                    </span>
                    <span className='text-[9px] md:text-[10px] text-gray-500 leading-tight truncate'>
                        {user.role}
                    </span>
                </div>

                {/* Arrow */}
                <i className={`fa-solid fa-chevron-down text-[10px] text-gray-500 ml-0.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* ============ DROPDOWN ============ */}
            {isOpen && (
                <div className='absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-[999] overflow-hidden'>

                    <div className='p-4'>

                        {/* Avatar + Name row */}
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#062139] to-[#0a3f6e] flex items-center justify-center text-sm font-bold text-white shrink-0'>
                                {initials}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <h3 className='text-sm font-bold text-slate-800 truncate'>{user.name}</h3>
                                <p className='text-[11px] text-slate-500 truncate'>{user.designation}</p>
                            </div>
                        </div>

                        {/* Role badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border} mb-4`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`}></span>
                            {displayRole}
                        </span>

                        {/* Info rows */}
                        <div className='space-y-2.5 mb-4'>
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-id-badge text-slate-400 text-xs w-4"></i>
                                <p className='text-[11px] text-slate-600 truncate'>{user.empId || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-phone text-slate-400 text-xs w-4"></i>
                                <p className='text-[11px] text-slate-600 truncate'>{user.phone || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <i className="fa-regular fa-envelope text-slate-400 text-xs w-4"></i>
                                <p className='text-[11px] text-slate-600 truncate'>{user.email || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-user-shield text-slate-400 text-xs w-4"></i>
                                <p className='text-[11px] text-slate-600 truncate'>{displayRole}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <i className="fa-solid fa-building text-slate-400 text-xs w-4"></i>
                                <p className='text-[11px] text-slate-600 truncate'>{user.department || '—'}</p>
                            </div>
                        </div>

                        {/* LIGHT GRAY SEPARATOR */}
                        <div className='border-t border-gray-200 my-3'></div>

                        {/* Action rows */}
                        <div className='flex flex-col'>

                            {/* My Profile */}
                            <button
                                onClick={handleMyProfile}
                                className='w-full flex items-center justify-between gap-2 px-2 py-2.5 rounded-lg hover:bg-slate-50 transition text-left group'
                            >
                                <div className='flex items-center gap-2.5'>
                                    <i className="fa-solid fa-user text-slate-500 text-xs w-4"></i>
                                    <span className='text-[12px] font-medium text-slate-700'>My Profile</span>
                                </div>
                                <i className="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                            </button>

                            {/* Change Password */}
                            <button className='w-full flex items-center justify-between gap-2 px-2 py-2.5 rounded-lg hover:bg-slate-50 transition text-left group'>
                                <div className='flex items-center gap-2.5'>
                                    <i className="fa-solid fa-key text-slate-500 text-xs w-4"></i>
                                    <span className='text-[12px] font-medium text-slate-700'>Change Password</span>
                                </div>
                                <i className="fa-solid fa-chevron-right text-slate-400 text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                            </button>

                        </div>

                        {/* LIGHT GRAY SEPARATOR */}
                        <div className='border-t border-gray-200 my-2'></div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className='w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg hover:bg-red-50 transition text-left group'
                        >
                            <i className="fa-solid fa-right-from-bracket text-red-500 text-xs w-4"></i>
                            <span className='text-[12px] font-medium text-red-600'>Logout</span>
                        </button>

                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileCard