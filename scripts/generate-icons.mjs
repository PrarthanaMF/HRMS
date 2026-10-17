/*
 * Builds src/Components/Common/icons.generated.js: the Phosphor icons this app uses, as SVG path data.
 *
 *   node scripts/generate-icons.mjs
 *
 * The app still names icons the Font Awesome way ("fa-solid fa-house", or "fa-house" in data);
 * <Icon> maps those names to Phosphor glyphs through MAP below. Only icons the code actually
 * uses are bundled, in one weight, so icons cost a few KB instead of a blocking icon-font script.
 *
 * Adding an icon: use any Font Awesome-style name in the code, add it to MAP (Phosphor names:
 * https://phosphoricons.com), and re-run. The script fails if the code uses a name MAP lacks.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ASSETS = path.join(ROOT, 'node_modules/@phosphor-icons/core/assets')
const OUT = path.join(ROOT, 'src/Components/Common/icons.generated.js')

// The one stroke weight used everywhere, and the glyphs that read better solid
const WEIGHT = 'bold'
const FILLED = new Set(['circle', 'star', 'circle-dot'])

// Font Awesome name -> Phosphor name
const MAP = {
    'arrow-down': 'arrow-down', 'arrow-left': 'arrow-left', 'arrow-right': 'arrow-right', 'arrow-up': 'arrow-up',
    'arrow-rotate-left': 'arrow-counter-clockwise', 'rotate-left': 'arrow-counter-clockwise', 'rotate-right': 'arrow-clockwise',
    'ban': 'prohibit', 'bars': 'list', 'bell': 'bell', 'bell-slash': 'bell-slash', 'bolt': 'lightning',
    'briefcase': 'briefcase', 'building': 'buildings', 'building-user': 'building-office',
    'calendar': 'calendar-blank', 'circle-user': 'user-circle', 'tag': 'tag', 'calendar-check': 'calendar-check', 'calendar-day': 'calendar-dot',
    'calendar-days': 'calendar-dots', 'calendar-plus': 'calendar-plus', 'calendar-week': 'calendar-dots', 'calendar-xmark': 'calendar-x',
    'chart-line': 'chart-line-up', 'chart-pie': 'chart-pie-slice',
    'check': 'check', 'check-circle': 'check-circle', 'circle-check': 'check-circle', 'check-double': 'checks',
    'chevron-down': 'caret-down', 'chevron-left': 'caret-left', 'chevron-right': 'caret-right', 'chevron-up': 'caret-up',
    'circle': 'circle', 'circle-dot': 'circle', 'circle-exclamation': 'warning-circle', 'circle-info': 'info', 'circle-xmark': 'x-circle',
    'clipboard-check': 'clipboard-text', 'clipboard-list': 'clipboard-text',
    'clock': 'clock', 'clock-rotate-left': 'clock-counter-clockwise', 'history': 'clock-counter-clockwise',
    'cloud-arrow-up': 'cloud-arrow-up', 'coins': 'coins',
    'comment': 'chat-circle', 'comment-dots': 'chat-dots', 'comments': 'chats',
    'database': 'database', 'desktop': 'desktop', 'diagram-project': 'tree-structure', 'sitemap': 'tree-structure',
    'download': 'download-simple', 'envelope': 'envelope-simple', 'eraser': 'eraser',
    'eye': 'eye', 'eye-slash': 'eye-slash',
    'file-alt': 'file-text', 'file-lines': 'file-text', 'file-arrow-up': 'file-arrow-up', 'file-import': 'file-arrow-up',
    'file-circle-check': 'seal-check', 'file-excel': 'file-xls', 'file-pdf': 'file-pdf', 'file-pen': 'note-pencil',
    'file-signature': 'signature', 'fingerprint': 'fingerprint', 'folder-open': 'folder-open', 'forward': 'fast-forward',
    'gavel': 'gavel', 'gear': 'gear-six', 'graduation-cap': 'graduation-cap', 'grip': 'dots-nine',
    'headset': 'headset', 'hourglass-half': 'hourglass-medium', 'house': 'house', 'house-laptop': 'house-line',
    'id-badge': 'identification-badge', 'id-card': 'identification-card', 'image': 'image',
    'indian-rupee-sign': 'currency-inr', 'key': 'key', 'laptop-medical': 'laptop', 'layer-group': 'stack',
    'link': 'link', 'link-slash': 'link-break',
    'list': 'list-bullets', 'list-check': 'list-checks', 'location-dot': 'map-pin', 'map-pin': 'map-pin',
    'lock': 'lock', 'lock-open': 'lock-open', 'magnifying-glass': 'magnifying-glass', 'minus': 'minus',
    'money-check-dollar': 'money', 'moon': 'moon', 'notes-medical': 'first-aid-kit', 'paper-plane': 'paper-plane-tilt',
    'paperclip': 'paperclip', 'pause': 'pause', 'pen': 'pencil-simple', 'pen-to-square': 'note-pencil',
    'people-pulling': 'binoculars', 'person-running': 'person-simple-run', 'phone': 'phone', 'plane': 'airplane-tilt',
    'plus': 'plus', 'receipt': 'receipt', 'right-from-bracket': 'sign-out', 'right-to-bracket': 'sign-in',
    'route': 'path', 'scale-balanced': 'scales', 'screwdriver-wrench': 'wrench', 'shield-halved': 'shield-check',
    'sliders': 'sliders-horizontal', 'spinner': 'circle-notch', 'star': 'star', 'sun': 'sun', 'trash-can': 'trash',
    'triangle-exclamation': 'warning', 'umbrella-beach': 'umbrella-simple',
    'user': 'user', 'user-check': 'user-check', 'user-group': 'users-three', 'user-lock': 'lock-key',
    'user-plus': 'user-plus', 'user-shield': 'user-gear', 'user-slash': 'user-minus', 'user-tie': 'user-square',
    'user-xmark': 'user-minus', 'users': 'users', 'users-slash': 'user-minus', 'xmark': 'x',
}

// Font Awesome tokens that are styles or modifiers, not icon names
const NOT_NAMES = new Set(['solid', 'regular', 'brands', 'light', 'thin', 'duotone', 'fw', 'spin', 'pulse', 'lg', 'xs', 'sm', 'xl', '2x', '3x', '4x', '5x'])

// Which names the code uses: inline classes and names stored in data
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : []
})
const used = new Set()
for (const file of walk(path.join(ROOT, 'src'))) {
    if (file === OUT) continue
    for (const [, name] of fs.readFileSync(file, 'utf8').matchAll(/\bfa-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) {
        if (!NOT_NAMES.has(name)) used.add(name)
    }
}

const unmapped = [...used].filter((name) => !MAP[name]).sort()
if (unmapped.length) {
    console.error(`No Phosphor mapping for: ${unmapped.join(', ')}\nAdd them to MAP in scripts/generate-icons.mjs.`)
    process.exit(1)
}

const read = (weight, name) => {
    const file = path.join(ASSETS, weight, `${name}${weight === 'regular' ? '' : `-${weight}`}.svg`)
    if (!fs.existsSync(file)) throw new Error(`Phosphor has no ${weight} "${name}" (${file})`)
    const svg = fs.readFileSync(file, 'utf8')
    const paths = [...svg.matchAll(/<path d="([^"]+)"\s*\/>/g)].map((match) => match[1])
    const other = svg.replace(/<\/?svg[^>]*>/g, '').replace(/<path d="[^"]+"\s*\/>/g, '').trim()
    if (!paths.length || other) throw new Error(`Unexpected SVG content in ${file}: ${other.slice(0, 80)}`)
    return paths
}

const glyphs = {}
for (const fa of [...used].sort()) {
    const phosphor = MAP[fa]
    glyphs[fa] = read(FILLED.has(fa) ? 'fill' : WEIGHT, phosphor)
}

const body = Object.entries(glyphs)
    .map(([name, paths]) => `  ${JSON.stringify(name)}: ${JSON.stringify(paths)},`)
    .join('\n')
fs.writeFileSync(OUT, `// Generated by scripts/generate-icons.mjs — do not edit. Phosphor Icons (MIT), ${WEIGHT} weight.
// Font Awesome-style name -> SVG path data on a 256x256 grid.
export const GLYPHS = {
${body}
}
`)
console.log(`Wrote ${Object.keys(glyphs).length} icons to ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`)
