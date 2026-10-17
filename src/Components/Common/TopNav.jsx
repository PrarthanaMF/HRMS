import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import logo from '../../assets/logo.png'
import { NAV_GROUPS, navFor } from '../../Utils/nav'
import { ROLE_LABELS } from '../../Utils/roles'
import { logout } from '../../api/auth'
import { removeAuth } from '../../Store/Redux/Login/AuthSlice'
import NotificationBell from './NotificationBell'
import ProfileCard from './ProfileCard'
import Icon from './Icon'

const cn = (...values) => values.filter(Boolean).join(' ')

/*
 * The bar shows the full row from lg up. Between lg and xl there is not enough width for
 * nine labels, so the labels are dropped and the icons carry the meaning (each keeps its
 * accessible name). Below lg everything moves into the drawer behind the hamburger.
 */
const itemBase = 'inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0e2a47]'
const itemIdle = 'text-slate-200/90 hover:bg-white/10 hover:text-white'
const itemActive = 'relative bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] after:pointer-events-none after:absolute after:bottom-0.5 after:left-1/2 after:h-[3px] after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-[#9fb8c9] after:shadow-[0_0_12px_rgb(159_184_201/0.85)]'

const barLinkClass = ({ isActive }) => cn(itemBase, isActive ? itemActive : itemIdle)

const drawerLinkClass = ({ isActive }) => cn(
    'rise press group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fb8c9]',
    isActive ? 'bg-white/[0.12] text-white' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
)

// True when the dropdown holds the page being viewed, so the parent stays highlighted
const holdsCurrentPage = (item, pathname) => item.children.some((child) => (
    child.end ? pathname === child.path : pathname === child.path || pathname.startsWith(`${child.path}/`)
))

function NavDropdown({ item }) {
    const { pathname } = useLocation()
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState(null)
    const trigger = useRef(null)
    const panel = useRef(null)
    const menuId = useId()
    const active = holdsCurrentPage(item, pathname)

    // The panel is rendered in a portal, so no scrolling or clipping ancestor can hide it.
    // That means its position has to be measured from the trigger each time it opens.
    useLayoutEffect(() => {
        if (!open) return undefined
        const place = () => {
            const rect = trigger.current?.getBoundingClientRect()
            if (!rect) return
            const width = 288
            const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
            setPosition({ top: rect.bottom + 6, left })
        }
        place()
        window.addEventListener('resize', place)
        window.addEventListener('scroll', place, true)
        return () => {
            window.removeEventListener('resize', place)
            window.removeEventListener('scroll', place, true)
        }
    }, [open])

    useEffect(() => {
        if (!open) return undefined
        const onPointerDown = (event) => {
            if (trigger.current?.contains(event.target) || panel.current?.contains(event.target)) return
            setOpen(false)
        }
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return
            setOpen(false)
            trigger.current?.focus()
        }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    return (
        <>
            <button
                ref={trigger}
                type='button'
                aria-expanded={open}
                aria-haspopup='true'
                aria-controls={menuId}
                title={item.name}
                onClick={() => setOpen((value) => !value)}
                className={cn(itemBase, active || open ? itemActive : itemIdle)}
            >
                <Icon aria-hidden='true' className={`${item.icon} text-[13px]`} />
                <span className='hidden min-[1400px]:inline'>{item.name}</span>
                <span className='sr-only min-[1400px]:hidden'>{item.name}</span>
                <Icon aria-hidden='true' className={cn('fa-solid fa-chevron-down text-[9px] transition-transform', open && 'rotate-180')} />
            </button>

            {open && position && createPortal(
                <div
                    ref={panel}
                    id={menuId}
                    style={{ top: position.top, left: position.left, width: 288 }}
                    className='popover fixed z-[80] overflow-hidden rounded-2xl p-1.5 shadow-[var(--shadow-pop)] [animation:ui-pop_180ms_var(--ease-out)_backwards]'
                >
                    {item.children.map((child) => (
                        <NavLink
                            key={child.path}
                            to={child.path}
                            end={child.end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) => cn(
                                'flex items-start gap-3 rounded-lg px-2.5 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]',
                                isActive ? 'bg-[#f2f5f7]' : 'hover:bg-slate-50',
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <span aria-hidden='true' className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px]', isActive ? 'bg-[#1f4e6b] text-white' : 'bg-slate-100 text-[#1f4e6b]')}>
                                        <Icon className={child.icon} />
                                    </span>
                                    <span className='min-w-0'>
                                        <span className={cn('block text-[13px] font-semibold', isActive ? 'text-[#1f4e6b]' : 'text-slate-800')}>{child.name}</span>
                                        <span className='mt-0.5 block text-[11px] leading-4 text-slate-500'>{child.description}</span>
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>,
                document.body,
            )}
        </>
    )
}

// The same items stacked for narrow screens, opened from the hamburger
// One row in the phone menu: icon tile, label, and a bar marking the current page
function DrawerLink({ to, end, icon, label, onNavigate, index }) {
    return (
        <NavLink to={to} end={end} onClick={onNavigate} style={{ '--i': index }} className={drawerLinkClass}>
            {({ isActive }) => (
                <>
                    <span aria-hidden='true' className={cn('absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#9fb8c9] transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
                    <span aria-hidden='true' className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-slate-300 group-hover:text-white')}>
                        <Icon className={`${icon} text-[15px]`} />
                    </span>
                    <span className='min-w-0 flex-1 truncate'>{label}</span>
                    {isActive && <span className='sr-only'>(current page)</span>}
                </>
            )}
        </NavLink>
    )
}

/*
 * Phone and tablet menu: a modal drawer. Focus moves into it and back to the menu button,
 * Escape closes it, and the page behind doesn't scroll while it's open.
 */
function MobileNav({ items, open, onClose, returnFocus }) {
    const user = useSelector((state) => state.auth.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const closeButton = useRef(null)
    const panel = useRef(null)

    useEffect(() => {
        if (!open) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeButton.current?.focus()
        const onKeyDown = (event) => {
            if (event.key === 'Escape') { onClose(); return }
            if (event.key !== 'Tab' || !panel.current) return
            // Keep Tab inside the drawer
            const focusable = [...panel.current.querySelectorAll('a[href], button:not([disabled])')]
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
        }
        document.addEventListener('keydown', onKeyDown)
        const button = returnFocus.current
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = previousOverflow
            button?.focus()
        }
    }, [open, onClose, returnFocus])

    if (!open) return null

    const byName = new Map(items.map((item) => [item.name, item]))
    const sections = NAV_GROUPS
        .map((group) => ({ ...group, items: group.names.map((name) => byName.get(name)).filter(Boolean) }))
        .filter((group) => group.items.length)
    const initials = (user?.name || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

    const signOut = async () => {
        onClose()
        await logout()
        dispatch(removeAuth())
        navigate('/login')
    }

    let index = 0
    return createPortal(
        <>
            <div className='fixed inset-0 z-[var(--z-drawer)] bg-slate-950/45 backdrop-blur-[3px] lg:hidden [animation:ui-fade_180ms_ease-out_backwards]' onClick={onClose} />
            <div
                ref={panel}
                role='dialog'
                aria-modal='true'
                aria-label='Main menu'
                className='glass-dark fixed inset-y-0 left-0 z-[var(--z-drawer)] flex w-[min(20rem,88vw)] flex-col shadow-[var(--shadow-pop)] lg:hidden [animation:ui-slide_260ms_var(--ease-out)_backwards]'
            >
                <div className='flex shrink-0 items-center justify-between px-4 pb-2 pt-4'>
                    <span className='flex items-center gap-2.5'>
                        <img src={logo} className='h-7 w-7 rounded-md bg-white p-0.5' alt='' />
                        <span className='text-[15px] font-semibold tracking-tight text-white'>Marutiflex</span>
                    </span>
                    <button ref={closeButton} type='button' onClick={onClose} aria-label='Close menu' className='press flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white'>
                        <Icon className='fa-solid fa-xmark text-lg' />
                    </button>
                </div>

                {/* Who is signed in */}
                <div className='mx-3 mt-1 flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.03] p-3'>
                    <span aria-hidden='true' className='gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ring-1 ring-white/20'>{initials}</span>
                    <span className='min-w-0'>
                        <span className='block truncate text-sm font-semibold text-white'>{user?.name || 'Signed in'}</span>
                        <span className='block truncate text-xs text-slate-300'>{ROLE_LABELS[user?.role] || user?.role}</span>
                    </span>
                </div>

                <nav aria-label='Main' className='hide-scrollbar mt-3 flex-1 overflow-y-auto px-3 pb-3'>
                    {sections.map((section) => (
                        <section key={section.title} aria-labelledby={`drawer-${section.title}`} className='mb-3'>
                            <h2 id={`drawer-${section.title}`} className='px-2 pb-1.5 text-xs font-medium text-slate-400'>{section.title}</h2>
                            <div className='space-y-0.5'>
                                {section.items.flatMap((item) => (item.children
                                    ? item.children.map((child) => <DrawerLink key={child.path} to={child.path} end={child.end} icon={child.icon} label={child.name} onNavigate={onClose} index={index++} />)
                                    : [<DrawerLink key={item.path} to={item.path} end={item.end} icon={item.icon} label={item.name} onNavigate={onClose} index={index++} />]
                                ))}
                            </div>
                        </section>
                    ))}
                </nav>

                <div className='shrink-0 border-t border-white/10 p-3'>
                    <button type='button' onClick={signOut} className='press group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-medium text-slate-300 hover:bg-white/10 hover:text-white'>
                        <span aria-hidden='true' className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]'>
                            <Icon className='fa-solid fa-right-from-bracket text-[15px]' />
                        </span>
                        Sign out
                    </button>
                </div>
            </div>
        </>,
        document.body,
    )
}

const TopNav = () => {
    const role = useSelector((state) => state.auth.value?.role)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuButton = useRef(null)
    const closeMenu = useCallback(() => setMenuOpen(false), [])
    const items = navFor(role)

    return (
        <header className='glass-dark sticky top-0 z-50 w-full'>
            <div className='flex h-14 items-center gap-2 px-3 sm:px-4'>
                {/* LEFT */}
                <div className='flex shrink-0 items-center gap-1'>
                    <button
                        ref={menuButton}
                        type='button'
                        onClick={() => setMenuOpen(true)}
                        aria-label='Open menu'
                        aria-expanded={menuOpen}
                        className='press flex h-10 w-10 items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white lg:hidden'
                    >
                        <Icon className='fa-solid fa-bars text-[15px]' />
                    </button>

                    <NavLink to='/' end className='flex items-center gap-2 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b6485]'>
                        <img src={logo} className='h-6 w-6 shrink-0' alt='' />
                        <span className='hidden text-[15px] text-slate-100 sm:inline lg:hidden min-[1400px]:inline'>Marutiflex</span>
                    </NavLink>
                </div>

                {/* CENTRE — the links, centred in the space between the logo and the actions */}
                <nav aria-label='Main' className='hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto hide-scrollbar lg:flex'>
                    {items.map((item) => (item.children
                        ? <NavDropdown key={item.name} item={item} />
                        : (
                            <NavLink key={item.path} to={item.path} end={item.end} title={item.name} className={barLinkClass}>
                                <Icon aria-hidden='true' className={`${item.icon} text-[13px]`} />
                                <span className='hidden min-[1400px]:inline'>{item.name}</span>
                                <span className='sr-only min-[1400px]:hidden'>{item.name}</span>
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* RIGHT */}
                <div className='ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0'>
                    <NotificationBell onDark />
                    <ProfileCard onDark />
                </div>
            </div>

            <MobileNav items={items} open={menuOpen} onClose={closeMenu} returnFocus={menuButton} />
        </header>
    )
}

export default TopNav
