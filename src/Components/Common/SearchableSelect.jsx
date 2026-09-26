import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

// A dropdown with a search box — drop-in replacement for FormField's <select>.
// Calls onChange with a { target: { name, value } } object, so it works with the
// same handleChange used for the regular FormField inputs.
const SearchableSelect = ({
    label, name, value, onChange, options = [],
    placeholder = 'Select...', searchPlaceholder = 'Search...',
    required = false, error = '',
    // `bare`: skip rendering our own label/error — used when a parent
    // (e.g. FormField) already renders them and just wants the control.
    // `compact`: smaller filter-bar sizing (uppercase mini label, tighter padding).
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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return q ? options.filter((o) => o.toLowerCase().includes(q)) : options
    }, [options, query])

    const openList = () => {
        // Open upwards when there isn't room below (e.g. field near the bottom of the popup)
        const rect = rootRef.current?.getBoundingClientRect()
        if (rect) {
            const below = window.innerHeight - rect.bottom
            setDropUp(below < 280 && rect.top > below)
        }
        setActive(Math.max(0, options.indexOf(value)))
        setOpen(true)
    }

    const closeList = () => {
        setOpen(false)
        setQuery('')
    }

    const choose = (opt) => {
        onChange({ target: { name, value: opt } })
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

    const triggerClass = `w-full flex items-center justify-between gap-2 text-left border rounded-lg outline-none transition bg-white cursor-pointer ${compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2 text-sm'
        } ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-[#062139] focus:ring-2 focus:ring-slate-100'
        }`

    return (
        <div className='flex flex-col gap-1.5' ref={rootRef}>
            {!bare && label && (
                <label id={labelId} className={compact ? 'text-[10px] font-semibold uppercase text-slate-400 tracking-wide' : 'text-xs font-medium text-slate-700'}>
                    {label} {required && <span className='text-red-500'>*</span>}
                </label>
            )}

            <div className='relative'>
                <button
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
                    <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>{value || placeholder}</span>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}></i>
                </button>

                {open && (
                    <div className={`absolute z-30 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        <div className='relative p-2 border-b border-slate-100'>
                            <i className='fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400'></i>
                            <input
                                ref={searchRef}
                                type='text'
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                                onKeyDown={handleSearchKey}
                                placeholder={searchPlaceholder}
                                className='w-full pl-8 pr-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-[#062139]'
                            />
                        </div>

                        <ul ref={listRef} role='listbox' aria-labelledby={labelId} className='max-h-52 overflow-y-auto py-1'>
                            {filtered.length === 0 ? (
                                <li className='px-3 py-3 text-xs text-slate-400 text-center'>No matches found</li>
                            ) : (
                                filtered.map((opt, i) => (
                                    <li
                                        key={opt}
                                        role='option'
                                        aria-selected={opt === value}
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => choose(opt)}
                                        className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 ${i === active ? 'bg-slate-100' : ''} ${opt === value ? 'font-semibold text-[#062139]' : 'text-slate-700'}`}
                                    >
                                        <span className='truncate'>{opt}</span>
                                        {opt === value && <i className='fa-solid fa-check text-[10px] text-[#062139]'></i>}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {!bare && error && (
                <p className='text-[11px] text-red-600 flex items-center gap-1'>
                    <i className='fa-solid fa-circle-exclamation text-[10px]'></i>
                    {error}
                </p>
            )}
        </div>
    )
}

export default SearchableSelect