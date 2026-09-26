import React from 'react'
import HomeStatis from '../Components/Pages/Home/HomeStatis'
import QuickAccess from '../Components/Pages/Home/QuickAccess'
import RecentActivity from '../Components/Pages/Home/RecentActivity'

const Home = () => {
    return (
        <div className='w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-10 relative z-0'>
            <HomeStatis />
            <QuickAccess />
            <RecentActivity />
        </div>
    )
}

export default Home