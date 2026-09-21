import React from 'react'
import { useSelector } from 'react-redux'
import ProfileCard from '../../Common/ProfileCard'

const HomeHeader = ({ onMenuClick }) => {
    const user = useSelector(state => state.auth.value)
    const firstName = user?.name ? user.name.split(' ')[0] : 'User'

    return (
        <div className='bg-white h-16 flex items-center justify-between sticky top-0 shadow z-50 px-4 md:px-5 overflow-visible gap-3'>

            {/* ================= DESKTOP LAYOUT (3-column grid) ================= */}
            <div className='hidden md:grid md:grid-cols-3 items-center w-full gap-4'>

                {/* LEFT: Greeting */}
                <div className='min-w-0'>
                    <h3 className='font-bold text-[14px] whitespace-nowrap truncate'>
                        Welcome back, {firstName} 👏
                    </h3>
                    <p className='text-gray-400 text-[10px] truncate'>
                        Here is what's happening in your organization today.
                    </p>
                </div>

                {/* MIDDLE: Search bar (centered) */}
                <div className='flex justify-center'>
                    <div className='flex border border-gray-300 px-2 rounded py-1 items-center w-full max-w-md'>
                        <label htmlFor="search" className='cursor-pointer'>
                            <i className="fa-solid fa-magnifying-glass text-slate-700/90 mr-2.5 font-normal text-[14px]"></i>
                        </label>
                        <input
                            type="text"
                            className='h-full w-full text-[12px] border-0 outline-0 bg-transparent'
                            placeholder='Search employees, modules, documents'
                            id='search'
                        />
                        <span className='text-gray-600 text-[12px] border border-gray-200 px-1.5 rounded ml-2 whitespace-nowrap'>
                            Ctrl+/
                        </span>
                    </div>
                </div>

                {/* RIGHT: Actions + Profile */}
                <div className='flex items-center justify-end gap-5'>
                    {/* Notification Bell */}
                    <button className='relative cursor-pointer'>
                        <i className="fa-regular fa-bell text-gray-600 text-[16px]"></i>
                        <span className='bg-red-500 text-slate-50 w-4 h-4 leading-4 block text-center text-[8px] rounded-[50%] absolute -top-1.5 -right-2'>
                            17
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button className='cursor-pointer'>
                        <i className="fa-regular fa-moon text-gray-600 text-[16px]"></i>
                    </button>

                    {/* USER MENU */}
                    <ProfileCard />
                </div>
            </div>

            {/* ================= MOBILE LAYOUT ================= */}
            <div className='flex md:hidden items-center justify-between w-full gap-3'>

                {/* LEFT: Hamburger */}
                <button
                    onClick={onMenuClick}
                    className='w-10 h-8 flex items-center justify-center rounded-lg bg-[#062139] text-white hover:bg-[#0a2f52] transition shadow-sm shrink-0'
                    aria-label='Open menu'
                >
                    <i className="fa-solid fa-bars text-[15px]"></i>
                </button>

                {/* RIGHT: Actions + Profile */}
                <div className='flex items-center gap-3'>
                    {/* Mobile Search icon */}
                    <button className='cursor-pointer'>
                        <i className="fa-solid fa-magnifying-glass text-gray-600 text-[16px]"></i>
                    </button>

                    {/* Notification Bell */}
                    <button className='relative cursor-pointer'>
                        <i className="fa-regular fa-bell text-gray-600 text-[16px]"></i>
                        <span className='bg-red-500 text-slate-50 w-4 h-4 leading-4 block text-center text-[8px] rounded-[50%] absolute -top-1.5 -right-2'>
                            17
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button className='cursor-pointer'>
                        <i className="fa-regular fa-moon text-gray-600 text-[16px]"></i>
                    </button>

                    {/* USER MENU */}
                    <ProfileCard />
                </div>
            </div>

        </div>
    )
}

export default HomeHeader