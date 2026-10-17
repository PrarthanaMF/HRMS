import React, { memo } from 'react'
import { GLYPHS } from './icons.generated'

/*
 * Inline SVG icons (Phosphor, one stroke weight) that accept Font Awesome-style class strings,
 * so existing markup and data keep working:
 *
 *   <Icon className="fa-solid fa-house text-xs text-slate-500" />
 *   <Icon className={`${item.icon} mr-2`} />        // item.icon = 'fa-solid fa-house' or 'fa-house'
 *
 * The fa-* tokens pick the glyph; every other class goes on the <svg>. The icon is 1em square and
 * uses currentColor, so text-size and text-colour classes size and colour it. `fa-spin` (or
 * Tailwind's animate-spin) spins it. Icons are decorative unless given an aria-label or title.
 * New icon? See scripts/generate-icons.mjs.
 */
const MODIFIERS = new Set(['fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-fw', 'fa-lg', 'fa-xs', 'fa-sm', 'fa-xl'])

const parse = (className = '') => {
    let name = ''
    let spin = false
    const rest = []
    for (const token of String(className).split(/\s+/)) {
        if (!token) continue
        if (token === 'fa-spin' || token === 'fa-pulse') spin = true
        else if (token.startsWith('fa-') && !MODIFIERS.has(token)) name = token.slice(3)
        else if (!MODIFIERS.has(token)) rest.push(token)
    }
    return { name, spin, rest: rest.join(' ') }
}

function IconBase({ className, title, ...props }) {
    const { name, spin, rest } = parse(className)
    const paths = GLYPHS[name]
    if (!paths) {
        if (import.meta.env.DEV && name) console.warn(`<Icon>: no glyph for "fa-${name}". Add it to scripts/generate-icons.mjs.`)
        return null
    }
    const labelled = Boolean(props['aria-label'] || title)
    return (
        <svg
            viewBox='0 0 256 256'
            width='1em'
            height='1em'
            fill='currentColor'
            focusable='false'
            aria-hidden={labelled ? undefined : 'true'}
            role={labelled ? 'img' : undefined}
            className={`inline-block shrink-0 align-[-0.125em] ${spin ? 'animate-spin ' : ''}${rest}`}
            {...props}
        >
            {title && <title>{title}</title>}
            {paths.map((d) => <path key={d} d={d} />)}
        </svg>
    )
}

const Icon = memo(IconBase)
export default Icon
