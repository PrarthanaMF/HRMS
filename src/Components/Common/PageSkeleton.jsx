import React from 'react'

/*
 * Shown while a screen's code loads. Shaped like a typical page (title, toolbar, a table) so the
 * layout doesn't jump when the real content arrives. `bare` = no top bar around it (login, public
 * pages); inside the app the top bar is already on screen.
 */
export default function PageSkeleton({ bare = false }) {
    return (
        <div role='status' aria-label='Loading' className={bare ? 'mx-auto min-h-dvh w-full max-w-[1400px] px-4 py-6 md:px-6' : 'w-full'}>
            <div className='skeleton h-7 w-48' />
            <div className='skeleton mt-2 h-3.5 w-80 max-w-full' />
            <div className='mt-6 flex flex-wrap gap-2'>
                <div className='skeleton h-9 w-28' />
                <div className='skeleton h-9 w-28' />
                <div className='skeleton ml-auto h-9 w-36' />
            </div>
            <div className='glass-panel mt-4 space-y-3 rounded-2xl p-4'>
                {[0, 1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className='flex items-center gap-3'>
                        <div className='skeleton h-9 w-9 shrink-0 rounded-xl' />
                        <div className='skeleton h-3.5 flex-1' />
                        <div className='skeleton hidden h-3.5 w-28 sm:block' />
                        <div className='skeleton h-6 w-16' />
                    </div>
                ))}
            </div>
            <span className='sr-only'>Loading…</span>
        </div>
    )
}
