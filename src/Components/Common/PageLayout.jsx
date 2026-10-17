import React, { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopNav from './TopNav'
import PageSkeleton from './PageSkeleton'

// Screens remount per top-level section, so each one rises in; moving between a section's own
// tabs (e.g. /master/users -> /master/branches) keeps the screen and its state
const sectionKey = (pathname) => pathname.split('/').slice(0, 2).join('/')

const PageLayout = () => {
    const { pathname } = useLocation()
    return (
        <div className='flex min-h-dvh w-full flex-col'>
            <a href='#main' className='skip-link'>Skip to content</a>
            <TopNav />
            {/* One container for every screen (same width and gutters); screens load on demand and
                the top bar stays put while one does */}
            <main id='main' tabIndex={-1} className='mx-auto w-full min-w-0 max-w-[1400px] flex-1 px-4 py-6 outline-none md:px-6'>
                <Suspense fallback={<PageSkeleton />}>
                    <div key={sectionKey(pathname)} className='page-enter'>
                        <Outlet />
                    </div>
                </Suspense>
            </main>
        </div>
    )
}

export default PageLayout
