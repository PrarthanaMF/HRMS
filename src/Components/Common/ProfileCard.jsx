import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeAuth } from '../../Store/Redux/Login/AuthSlice'
import { logout, logoutAllDevices } from '../../api/auth'
import { ROLE_LABELS } from '../../Utils/roles'

import Icon from './Icon'
const ROLE_STYLES = {
    'SUPER_ADMIN': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'ADMIN': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'MANAGEMENT': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    'HR_MANAGER': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'HR_EXECUTIVE': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    'EMPLOYEE': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
}

const ProfileCard = ({ onDark = false }) => {
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

    const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES['EMPLOYEE']
    const displayRole = ROLE_LABELS[user.role] || user.role

    const handleMyProfile = () => {
        setIsOpen(false)
        navigate('/profile')
    }

    const handleLogout = async () => {
        setIsOpen(false)
        await logout()
        dispatch(removeAuth())
        navigate('/login')
    }

    // Signs this login out on every phone and computer, including this one
    const handleLogoutAllDevices = async () => {
        if (!window.confirm('Sign out of all devices? You will need to sign in again everywhere, including here.')) return
        setIsOpen(false)
        try {
            await logoutAllDevices()
        } catch {
            // The session may already have ended; signing out here still applies
        }
        dispatch(removeAuth())
        navigate('/login')
    }

    return (
        <div className='relative' ref={dropdownRef}>

            {/* ============ TRIGGER ============ */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup='true'
                aria-expanded={isOpen}
                aria-label={`Account menu for ${user.name}`}
                className={`press flex items-center gap-2 border rounded-xl cursor-pointer select-none px-1.5 sm:px-2 h-10 max-w-[220px] md:max-w-none ${onDark ? 'border-white/15 hover:bg-[#163a58]' : 'border-gray-400/20 hover:bg-gray-100'}`}
            >
                {/* Avatar */}
                <span aria-hidden='true' className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${onDark ? 'gradient-accent rounded-full' : 'bg-slate-200 text-slate-700'}`}>
                    {initials}
                </span>

                {/* Name + Role — visible on all screens */}
                <div className='hidden min-w-0 flex-col text-left sm:flex'>
                    <span className={`text-[11px] md:text-[12px] font-medium leading-tight truncate ${onDark ? 'text-slate-100' : 'text-gray-700'}`}>
                        {user.name}
                    </span>
                    <span className={`text-[9px] md:text-[10px] leading-tight truncate ${onDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {displayRole}
                    </span>
                </div>

                {/* Arrow */}
                <Icon className={`fa-solid fa-chevron-down text-[10px] ml-0.5 shrink-0 transition-transform duration-200 ${onDark ? 'text-slate-400' : 'text-gray-500'} ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* ============ DROPDOWN ============ */}
            {isOpen && (
                <div className='popover absolute right-0 top-full z-[999] mt-2 w-80 max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl shadow-[var(--shadow-pop)] [animation:ui-pop_180ms_var(--ease-out)_backwards]'>

                    <div className='p-4'>

                        {/* Avatar + Name row */}
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='gradient-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-[0_8px_18px_-10px_rgb(8_26_46/0.9)]'>
                                {initials}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <h3 className='truncate text-[15px] font-semibold text-[var(--ink)]'>{user.name}</h3>
                                <p className='truncate text-[12px] text-slate-500'>{user.designation}</p>
                            </div>
                        </div>

                        {/* Role badge */}
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border} mb-4`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`}></span>
                            {displayRole}
                        </span>

                        {/* Info rows */}
                        <div className='space-y-2.5 mb-4'>
                            <div className='flex items-center gap-2'>
                                <Icon className="fa-solid fa-id-badge text-slate-400 text-[14px] w-4" />
                                <p className='truncate text-[12px] text-slate-600'>{user.empId || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Icon className="fa-solid fa-phone text-slate-400 text-[14px] w-4" />
                                <p className='truncate text-[12px] text-slate-600'>{user.phone || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Icon className="fa-regular fa-envelope text-slate-400 text-[14px] w-4" />
                                <p className='truncate text-[12px] text-slate-600'>{user.email || '—'}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Icon className="fa-solid fa-user-shield text-slate-400 text-[14px] w-4" />
                                <p className='truncate text-[12px] text-slate-600'>{displayRole}</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Icon className="fa-solid fa-building text-slate-400 text-[14px] w-4" />
                                <p className='truncate text-[12px] text-slate-600'>{user.department || '—'}</p>
                            </div>
                        </div>

                        {/* LIGHT GRAY SEPARATOR */}
                        <div className='my-3 border-t border-slate-200/70'></div>

                        {/* Action rows */}
                        <div className='flex flex-col'>

                            {/* My Profile */}
                            <button
                                onClick={handleMyProfile}
                                className='press flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-[#f2f5f7]'
                            >
                                <div className='flex items-center gap-2.5'>
                                    <Icon className="fa-solid fa-user text-slate-500 text-[15px] w-4" />
                                    <span className='text-[13px] font-medium text-slate-700'>My Profile</span>
                                </div>
                                                            </button>

                            {/* Change Password */}
                            <button className='press flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-[#f2f5f7]'>
                                <div className='flex items-center gap-2.5'>
                                    <Icon className="fa-solid fa-key text-slate-500 text-[15px] w-4" />
                                    <span className='text-[13px] font-medium text-slate-700'>Change Password</span>
                                </div>
                                                            </button>

                        </div>

                        {/* LIGHT GRAY SEPARATOR */}
                        <div className='my-2 border-t border-slate-200/70'></div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className='press flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left hover:bg-red-50'
                        >
                            <Icon className="fa-solid fa-right-from-bracket text-red-500 text-[15px] w-4" />
                            <span className='text-[13px] font-medium text-red-600'>Logout</span>
                        </button>

                        {/* Sign out everywhere */}
                        <button
                            onClick={handleLogoutAllDevices}
                            className='press flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left hover:bg-red-50'
                        >
                            <Icon className="fa-solid fa-laptop-medical text-red-500 text-[15px] w-4" />
                            <span className='text-[13px] font-medium text-red-600'>Sign out of all devices</span>
                        </button>

                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileCard