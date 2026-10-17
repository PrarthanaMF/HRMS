import { expect, test } from '@playwright/test'

/*
 * Every screen at phone, tablet and desktop widths: no sideways page scroll, no list that scrolls
 * sideways (tables fit their box, or become cards below md), no console errors.
 * Runs once (desktop project) and sets the viewport itself. SHOTS_DIR saves a screenshot of each.
 */
const ID = process.env.HRMS_TEST_ID
const PASSWORD = process.env.HRMS_TEST_PASSWORD
const SHOTS = process.env.SHOTS_DIR

const WIDTHS = [390, 768, 1440]
const PAGES = [
    ['dashboard', '/'],
    ['attendance', '/attendance'],
    ['requests', '/attendance/requests'],
    ['applications', '/attendance/applications'],
    ['holidays', '/attendance/holidays'],
    ['upload', '/attendance/upload'],
    ['salary', '/attendance/salary'],
    ['employees', '/workforce'],
    ['employee-new', '/workforce/add'],
    ['recruitment', '/recruitment/vacancy'],
    ['tracker', '/recruitment/tracker'],
    ['recruitment-mis', '/recruitment/mis'],
    ['exit', '/exit-process'],
    ['exit-attrition', '/exit-process/attrition'],
    ['master', '/master/users'],
    ['master-balances', '/master/leave-balances'],
]

test.skip(!ID || !PASSWORD, 'Set HRMS_TEST_ID and HRMS_TEST_PASSWORD')

test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'sets its own viewports')
    await page.goto('/login')
    const status = await page.evaluate(([employeeId, password]) => fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ employeeId, password }),
    }).then((response) => response.status), [ID, PASSWORD])
    expect(status).toBe(200)
})

for (const [name, path] of PAGES) {
    test(`${name} fits every width`, async ({ page }) => {
        const errors = []
        page.on('pageerror', (error) => errors.push(error.message))
        page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

        for (const width of WIDTHS) {
            await page.setViewportSize({ width, height: 900 })
            await page.goto(path)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(400) // let entrance animations settle

            const overflow = await page.evaluate(() => {
                const extra = document.documentElement.scrollWidth - window.innerWidth
                if (extra <= 1) return null
                // Name the widest offenders to make a failure actionable
                const wide = [...document.querySelectorAll('body *')]
                    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
                    .filter((el) => !el.closest('[class*="overflow-x-auto"], [class*="overflow-auto"], [class*="overflow-hidden"]'))
                    .slice(0, 3)
                    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 4).join('.')}`)
                return { extra, wide }
            })
            expect(overflow, `${name} at ${width}px scrolls sideways by ${overflow?.extra}px: ${overflow?.wide?.join(', ')}`).toBeNull()

            // Lists never scroll sideways: a visible table must fit its own box, and nothing above it
            // may overflow horizontally either (below md a table should be a card list instead).
            const wideTables = await page.evaluate(() => [...document.querySelectorAll('table')]
                .filter((table) => table.getClientRects().length && table.offsetParent !== null)
                .map((table) => {
                    const header = [...table.querySelectorAll('th')].map((th) => th.textContent.trim()).filter(Boolean).slice(0, 3).join('/') || 'table'
                    if (table.scrollWidth > table.clientWidth + 1) return `${header}: table ${table.scrollWidth}px in ${table.clientWidth}px`
                    for (let box = table.parentElement; box && box !== document.documentElement; box = box.parentElement) {
                        if (box.scrollWidth > box.clientWidth + 1) {
                            const label = `${box.tagName.toLowerCase()}.${String(box.className).split(' ').slice(0, 3).join('.')}`
                            return `${header}: ${label} overflows ${box.scrollWidth}px in ${box.clientWidth}px`
                        }
                    }
                    return null
                })
                .filter(Boolean))
            expect(wideTables, `${name} at ${width}px has a list that scrolls sideways: ${wideTables.join('; ')}`).toEqual([])

            if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}-${width}.png`, fullPage: true })
        }
        expect(errors, errors.join('\n')).toEqual([])
    })
}
