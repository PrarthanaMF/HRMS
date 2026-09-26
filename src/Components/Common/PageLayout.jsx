import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import HomeHeader from '../Pages/Home/HomeHeader'

const PageLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className='flex w-full min-h-screen bg-gray-50'>
            <Header
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <section className='bg-slate-100/40 flex-1 min-w-0 flex flex-col relative'>
                <div className='sticky top-0 z-50 w-full'>
                    <HomeHeader onMenuClick={() => setSidebarOpen(true)} />
                </div>

                <div className='flex-1'>
                    <Outlet />
                </div>
            </section>
        </main>
    )
}

export default PageLayout