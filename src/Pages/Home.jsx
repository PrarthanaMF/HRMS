import React, { useState } from 'react'
import Header from '../Components/Common/Header'
import HomeHeader from '../Components/Pages/Home/HomeHeader'
import HomeStatis from '../Components/Pages/Home/HomeStatis'
import QuickAccess from '../Components/Pages/Home/QuickAccess'
import RecentActivity from '../Components/Pages/Home/RecentActivity'

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <main className='flex w-full min-h-screen bg-gray-50'>
            <Header
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <section className='bg-gray-100/40 flex-1 min-w-0 flex flex-col relative'>
                <div className='sticky top-0 z-50 w-full'>
                    <HomeHeader onMenuClick={() => setSidebarOpen(true)} />
                </div>
                <div className='w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-10 relative z-0'>
                    <HomeStatis />
                    <QuickAccess />
                    <RecentActivity />
                </div>
            </section>
        </main>
    )
}

export default Home