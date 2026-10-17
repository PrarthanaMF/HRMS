import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import Icon from './Icon'

// A dropdown with a search box — drop-in replacement for FormField's <select>.
// Calls onChange with a { target: { name, value } } object, so it works with the
// same handleChange used for the regular FormField inputs.
// Options are plain strings, or { value, label } when the stored value (e.g. an id) differs
// from what is shown.
const SearchableSelect = ({
    // `id` lets a parent's <label htmlFor> point at the trigger button
    id, label, name, value, onChange, options = [],
    placeholder = 'Select...', searchPlaceholder = 'Search...',
    required = false, error = '',
    // `bare`: skip rendering our own label/error — used when a parent
    // (e.g. FormField) already renders them and just wants the control.
    // `compact`: filter-bar sizing (smaller label, 36px trigger).
    bare = false, compact = false,
}) => {
    const labelId = useId()
    const rootRef = useRef(null)
    const searchRef = useRef(null)
    const listRef = useRef(null)

    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const [dropUp, setDropUp] = useState(false)

    const items = useMemo(
        () => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? String(o.value) })),
        [options]
    )
    const selectedLabel = items.find((o) => o.value === value)?.label ?? value

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return q ? items.filter((o) => o.label.toLowerCase().includes(q)) : items
    }, [items, query])

    const openList = () => {
        // Open upwards when there isn't room below (e.g. field near the bottom of the popup)
        const rect = rootRef.current?.getBoundingClientRect()
        if (rect) {
            const below = window.innerHeight - rect.bottom
            setDropUp(below < 280 && rect.top > below)
        }
        setActive(Math.max(0, items.findIndex((o) => o.value === value)))
        setOpen(true)
    }

    const closeList = () => {
        setOpen(false)
        setQuery('')
    }

    const choose = (opt) => {
        onChange({ target: { name, value: opt.value } })
        closeList()
    }

    // Close when clicking anywhere outside; focus the search box on open
    useEffect(() => {
        if (!open) return
        searchRef.current?.focus()
        const onDown = (e) => {
            if (!rootRef.current?.contains(e.target)) {
                setOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    // Keep the highlighted option visible while arrowing through a long list
    useEffect(() => {
        if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
    }, [active, open])

    const handleSearchKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((i) => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered[active]) choose(filtered[active])
        } else if (e.key === 'Escape') {
            e.stopPropagation()
            closeList()
        } else if (e.key === 'Tab') {
            closeList()
        }
    }

    const triggerClass = `press flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white/80 text-left outline-none focus:bg-white focus:ring-2 ${compact ? 'h-9 px-3 text-[13px]' : 'h-10 px-3 text-sm'
        } ${open ? 'border-[#2b6485] ring-2 ring-[#2b6485]/25 bg-white' : ''} ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
            : 'border-slate-200/80 hover:border-slate-300 focus:border-[#2b6485] focus:ring-[#2b6485]/25'
        }`

    return (
        <div className='flex flex-col gap-1.5' ref={rootRef}>
            {!bare && label && (
                <label id={labelId} className={compact ? 'text-[12px] font-medium text-slate-500' : 'text-[13px] font-medium text-slate-700'}>
                    {label} {required && <span className='text-red-500'>*</span>}
                </label>
            )}

            <div className='relative'>
                <button
                    id={id}
                    type='button'
                    aria-haspopup='listbox'
                    aria-expanded={open}
                    aria-labelledby={!bare && label ? labelId : undefined}
                    aria-label={bare || !label ? label : undefined}
                    onClick={() => (open ? closeList() : openList())}
                    onKeyDown={(e) => {
                        if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                            e.preventDefault()
                            openList()
                        }
                    }}
                    className={triggerClass}
                >
                    <span className={`min-w-0 truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>{(value && selectedLabel) || placeholder}</span>
                    <Icon className={`fa-solid fa-chevron-down shrink-0 text-[11px] text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#2b6485]' : ''}`} />
                </button>

                {open && (
                    <div className={`popover absolute left-0 right-0 z-30 overflow-hidden rounded-xl shadow-[var(--shadow-pop)] [animation:ui-pop_160ms_var(--ease-out)_backwards] ${dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}>
                        <div className='relative p-2 border-b border-slate-100'>
                            <Icon className='fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400' />
                            <input
                                ref={searchRef}
                                type='text'
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                                onKeyDown={handleSearchKey}
                                placeholder={searchPlaceholder}
                                className='h-9 w-full rounded-lg border border-slate-200/80 bg-white pl-8 pr-2 text-sm outline-none focus:border-[#2b6485] focus:ring-2 focus:ring-[#2b6485]/20'
                            />
                        </div>

                        <ul ref={listRef} role='listbox' aria-labelledby={labelId} className='max-h-52 overflow-y-auto py-1'>
                            {filtered.length === 0 ? (
                                <li className='px-3 py-3 text-xs text-slate-400 text-center'>No matches found</li>
                            ) : (
                                filtered.map((opt, i) => (
                                    <li
                                        key={opt.value}
                                        role='option'
                                        aria-selected={opt.value === value}
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => choose(opt)}
                                        className={`mx-1 flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm ${i === active ? 'bg-[#f2f5f7]' : ''} ${opt.value === value ? 'font-semibold text-[#1f4e6b]' : 'text-slate-700'}`}
                                    >
                                        <span className='truncate'>{opt.label}</span>
                                        {opt.value === value && <Icon className='fa-solid fa-check text-[12px] text-[#1f4e6b]' />}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {!bare && error && (
                <p className='flex items-center gap-1 text-[12px] text-red-600'>
                    <Icon className='fa-solid fa-circle-exclamation text-[11px]' />
                    {error}
                </p>
            )}
        </div>
    )
}

export default SearchableSelect