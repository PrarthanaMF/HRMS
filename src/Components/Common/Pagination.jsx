import React, { useMemo, useState } from 'react'

import Icon from './Icon'
const cn = (...values) => values.filter(Boolean).join(' ')

export const PAGE_SIZES = [10, 20, 50]

/*
 * Client-side paging for lists that are already loaded in full.
 * Resets to page 1 whenever `resetKey` changes (e.g. a filter or search), and pulls the page
 * back into range when the list shrinks (e.g. after approving the last row on a page).
 */
export function usePagination(items, { pageSize: initialSize = 20, resetKey = '' } = {}) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialSize)
    const total = items.length
    const pages = Math.max(1, Math.ceil(total / pageSize))

    // Back to page 1 when the filters or page size change (adjusted during render, not in an effect)
    const key = `${resetKey}|${pageSize}`
    const [lastKey, setLastKey] = useState(key)
    if (key !== lastKey) {
        setLastKey(key)
        setPage(1)
    }
    const current = Math.min(page, pages)

    const pageItems = useMemo(
        () => items.slice((current - 1) * pageSize, current * pageSize),
        [items, current, pageSize],
    )

    return { page: current, pages, pageSize, total, pageItems, setPage, setPageSize }
}

// Numbered pages around the current one, with ellipses: 1 … 4 5 [6] 7 8 … 20
const pageWindow = (page, pages) => {
    const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
    const sorted = [...wanted].sort((a, b) => a - b)
    const out = []
    sorted.forEach((n, index) => {
        if (index && n - sorted[index - 1] > 1) out.push(`gap-${n}`)
        out.push(n)
    })
    return out
}

// 32px with a mouse, 40px on touch screens
const pagerButton = 'inline-flex h-8 min-w-8 items-center pointer-coarse:h-10 pointer-coarse:min-w-10 justify-center rounded-lg border px-2 text-xs font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] disabled:cursor-not-allowed disabled:opacity-40'

export function Pagination({ page, pages, pageSize, total, onPage, onPageSize, label = 'items', className }) {
    if (!total) return null
    const from = (page - 1) * pageSize + 1
    const to = Math.min(total, page * pageSize)

    return (
        <nav aria-label='Pagination' className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
            <p className='text-xs text-slate-500' aria-live='polite'>
                Showing <span className='font-semibold tabular-nums text-slate-700'>{from}–{to}</span> of{' '}
                <span className='font-semibold tabular-nums text-slate-700'>{total}</span> {label}
            </p>

            <div className='flex flex-wrap items-center gap-2'>
                {onPageSize && (
                    <label className='flex items-center gap-1.5 text-xs text-slate-500'>
                        Rows
                        <select
                            value={pageSize}
                            onChange={(event) => onPageSize(Number(event.target.value))}
                            className='h-8 rounded-lg border pointer-coarse:h-10 border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2b6485]'
                        >
                            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </label>
                )}

                {pages > 1 && (
                    <div className='flex items-center gap-1'>
                        <button type='button' disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label='Previous page' className={cn(pagerButton, 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white')}>
                            <Icon aria-hidden='true' className='fa-solid fa-chevron-left text-[10px]' />
                        </button>
                        {pageWindow(page, pages).map((entry) => (typeof entry === 'string'
                            ? <span key={entry} aria-hidden='true' className='px-1 text-xs text-slate-400'>…</span>
                            : (
                                <button
                                    key={entry}
                                    type='button'
                                    onClick={() => onPage(entry)}
                                    aria-current={entry === page ? 'page' : undefined}
                                    aria-label={`Page ${entry}`}
                                    className={cn(pagerButton, entry === page ? 'border-[#163a58] gradient-brand text-white shadow-[0_6px_14px_-8px_rgb(8_26_46/0.9)]' : 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white')}
                                >
                                    {entry}
                                </button>
                            )
                        ))}
                        <button type='button' disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label='Next page' className={cn(pagerButton, 'border-slate-200/80 bg-white/80 text-slate-600 hover:border-[#cfdce5] hover:bg-white')}>
                            <Icon aria-hidden='true' className='fa-solid fa-chevron-right text-[10px]' />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}
