import { expect, test } from '@playwright/test'

const ID = process.env.HRMS_TEST_ID
const PASSWORD = process.env.HRMS_TEST_PASSWORD
const SHOTS = process.env.SHOTS_DIR // optional: save full-page screenshots for review

test.skip(!ID || !PASSWORD, 'Set HRMS_TEST_ID and HRMS_TEST_PASSWORD to run the smoke tests')

// Sign in through the real endpoint once per test, so the session cookie lands in this browser
test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    const status = await page.evaluate(async ([employeeId, password]) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employeeId, password }),
        })
        return response.status
    }, [ID, PASSWORD])
    expect(status, 'login should succeed').toBe(200)
})

// Fail the test on any uncaught error or console.error while it runs
const watchErrors = (page) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    return errors
}

const shoot = async (page, name, testInfo) => {
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${testInfo.project.name}-${name}.png`, fullPage: true })
}

const PAGES = [
    ['dashboard', '/'],
    ['attendance', '/attendance'],
    ['requests', '/attendance/requests'],
    ['applications', '/attendance/applications'],
    ['holidays', '/attendance/holidays'],
    ['upload', '/attendance/upload'],
    ['employees', '/workforce'],
    ['recruitment', '/recruitment/vacancy'],
    ['exit', '/exit-process'],
    ['master', '/master'],
]

for (const [name, path] of PAGES) {
    test(`${name} renders without errors`, async ({ page }, testInfo) => {
        const errors = watchErrors(page)
        await page.goto(path)
        await expect(page.locator('header').first()).toBeVisible()
        await page.waitForLoadState('networkidle')
        await shoot(page, name, testInfo)
        expect(errors, errors.join('\n')).toEqual([])
    })
}

test('dashboard no longer shows "Today Assigned"', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Today Assigned')).toHaveCount(0)
})

test('master has no Imports tab; employees page has Import Employees', async ({ page }) => {
    await page.goto('/master')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('tab', { name: /imports/i })).toHaveCount(0)
    await page.goto('/workforce')
    await expect(page.getByRole('button', { name: 'Import Employees' })).toBeVisible()
})

test('an employee row opens the employee page', async ({ page }, testInfo) => {
    await page.goto('/workforce')
    await page.waitForLoadState('networkidle')
    const open = page.getByRole('link', { name: /^Open / }).first()
    test.skip(!(await open.count()), 'no employees listed for this login')
    await open.click()
    await expect(page).toHaveURL(/\/workforce\/[0-9a-f]{24}$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const access = page.getByRole('button', { name: 'Login & access' })
    await expect(access).toBeVisible()
    await access.click()
    await expect(page).toHaveURL(/section=access/)
    await expect(page.getByRole('heading', { name: 'Login & access' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    await shoot(page, 'employee-access', testInfo)
    await page.getByRole('link', { name: 'Back to employees' }).click()
    await expect(page).toHaveURL(/\/workforce$/)
})

test('applications default to the content table with Level 1 and Level 2 columns', async ({ page }, testInfo) => {
    await page.goto('/attendance/applications')
    await page.waitForLoadState('networkidle')
    const view = page.getByRole('group', { name: 'Application view' })
    if (await view.count()) {
        await expect(view.getByRole('button', { name: 'Content' })).toHaveAttribute('aria-pressed', 'true')
    }
    // Phones show each row as labelled fields instead of a wide table
    if (testInfo.project.name === 'mobile') {
        if (await page.locator('article dl').count()) {
            await expect(page.locator('article dt', { hasText: 'Level 1' }).first()).toBeVisible()
            await expect(page.locator('article dt', { hasText: 'Level 2' }).first()).toBeVisible()
        }
        return
    }
    const table = page.locator('table').first()
    if (await table.count()) {
        for (const column of ['Application', 'Employee', 'Level 1', 'Level 2', 'Status', 'Actions']) {
            await expect(table.getByRole('columnheader', { name: column, exact: true })).toBeVisible()
        }
    }
})

test('phone menu is a proper modal: grouped, focus moves in and back, Escape closes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'the menu button only shows on narrow screens')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await menuButton.click()
    const drawer = page.getByRole('dialog', { name: 'Main menu' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('button', { name: 'Close menu' })).toBeFocused()
    for (const section of ['People', 'Attendance', 'Administration']) {
        await expect(drawer.getByRole('heading', { name: section })).toBeVisible()
    }
    await expect(drawer.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('aria-current', 'page')
    await page.waitForTimeout(400)
    await shoot(page, 'drawer', testInfo)
    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
    await expect(menuButton).toBeFocused()
})

test('top bar menus open', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'checked once at desktop size')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Account menu/ }).click()
    await expect(page.getByText('Sign out of all devices')).toBeVisible()
    await page.waitForTimeout(250)
    await shoot(page, 'profile-menu', testInfo)
    await page.keyboard.press('Escape')
    await page.mouse.click(5, 300)
    await page.getByRole('button', { name: /^Notifications/ }).click()
    await page.waitForTimeout(300)
    await shoot(page, 'notifications', testInfo)
})

// Opens the form and works the controls; never submits, so no leave request is created
test('apply leave: sessions map to half days, ranges stay full days, breakdown lists each date', async ({ page }, testInfo) => {
    await page.goto('/attendance/requests')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Apply Leave' }).click()
    const dialog = page.getByRole('dialog', { name: 'Apply Leave' })
    await expect(dialog).toBeVisible()

    const from = dialog.getByLabel('From date')
    const to = dialog.getByLabel('To date')
    const fromSessions = dialog.getByRole('group', { name: 'From session' })
    const toSessions = dialog.getByRole('group', { name: 'To session' })
    const breakdown = dialog.getByRole('region', { name: 'Leave breakdown' })

    // Pick the first leave type that allows half days (Session 2 on From is enabled)
    const types = dialog.getByRole('radio')
    const count = await types.count()
    let halfDayType = false
    for (let i = 0; i < count; i++) {
        if (await types.nth(i).isDisabled()) continue
        await types.nth(i).click()
        if (await fromSessions.getByRole('button', { name: 'Session 2' }).isEnabled()) { halfDayType = true; break }
    }

    // Dates are chosen in the app's own picker: open it from its field, move to the right month,
    // click the day (each cell is labelled with its full date, e.g. "23 Oct 2026")
    const pickDate = async (field, iso) => {
        const target = new Date(`${iso}T00:00:00`)
        const month = target.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        const day = new RegExp(`^${target.getDate()} ${month.slice(0, 3)}\\w* ${target.getFullYear()}$`)
        await field.click()
        const popup = page.locator('div.fixed', { hasText: 'Choose a date' }).last()
        await expect(popup).toBeVisible()
        for (let hops = 0; hops < 3 && !(await popup.getByText(month, { exact: true }).count()); hops++) {
            await popup.getByRole('button', { name: 'Next month' }).click()
        }
        await popup.getByRole('button', { name: day }).click()
        await expect(popup).toHaveCount(0)
    }

    // A weekday a week ahead, single day
    const day = await page.evaluate(() => {
        const d = new Date(); d.setDate(d.getDate() + 7)
        while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1)
        return d.toISOString().slice(0, 10)
    })
    await pickDate(from, day)
    await pickDate(to, day)
    await expect(breakdown.getByRole('listitem')).toHaveCount(1)

    if (halfDayType) {
        await fromSessions.getByRole('button', { name: 'Session 2' }).click()
        await expect(dialog.getByText('Half Day (Second Half)')).toBeVisible()
        await expect(breakdown.getByText('Half day – Second half')).toBeVisible()
        // The leave can't end before it starts
        await expect(toSessions.getByRole('button', { name: 'Session 1' })).toBeDisabled()
    }
    await page.waitForTimeout(300)
    await shoot(page, 'apply-leave-half-day', testInfo)

    // A three-day range: each date is listed, and with a half-day type the first day can start
    // at Session 2 and the last end at Session 1
    const later = await page.evaluate((start) => {
        const d = new Date(`${start}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 2); return d.toISOString().slice(0, 10)
    }, day)
    await pickDate(to, later)
    await expect(breakdown.getByRole('listitem')).toHaveCount(3)
    if (halfDayType) {
        await fromSessions.getByRole('button', { name: 'Session 2' }).click()
        await toSessions.getByRole('button', { name: 'Session 1' }).click()
        await expect(fromSessions.getByRole('button', { name: 'Session 2' })).toHaveAttribute('aria-pressed', 'true')
        await expect(toSessions.getByRole('button', { name: 'Session 1' })).toHaveAttribute('aria-pressed', 'true')
        await page.waitForTimeout(800) // holidays / week offs load
        const items = breakdown.getByRole('listitem')
        const first = await items.first().textContent()
        const last = await items.last().textContent()
        // Unless the day is a holiday / week off, the ends are halves
        if (!/not counted/.test(first)) expect(first).toContain('Half day – Second half')
        if (!/not counted/.test(last)) expect(last).toContain('Half day – First half')
        // The server can't store half ends on a range yet, so the form says so up front
        await expect(dialog.getByRole('note')).toContainText("can't be saved yet")
    }
    await shoot(page, 'apply-leave-range', testInfo)

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toHaveCount(0)
})

test('a pending / approved icon on the calendar opens that application', async ({ page }) => {
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')
    // Look back a few months for a day with an application on it
    let link = page.getByRole('link', { name: /Open the (pending|approved) application for/ }).first()
    for (let back = 0; back < 3 && !(await link.count()); back++) {
        await page.getByRole('button', { name: 'Previous period' }).click()
        await page.waitForLoadState('networkidle')
        link = page.getByRole('link', { name: /Open the (pending|approved) application for/ }).first()
    }
    test.skip(!(await link.count()), 'no applications on the calendar for this login')
    await link.click()
    await expect(page).toHaveURL(/\/attendance\/(requests|applications)\?(request|date)=/)
    // The application's details open by themselves
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
    await expect(page).not.toHaveURL(/request=|date=/)
})

test('a summary row filters the attendance calendar', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'summary panel is collapsed on phones')
    await page.goto('/attendance')
    await page.waitForLoadState('networkidle')
    // The row's accessible name is its text ("Unapproved Leave 0 0"); its title is only a hint
    const row = page.locator('button.att-summary-row', { hasText: 'Unapproved Leave' })
    await row.click()
    await expect(row).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText(/Showing only/)).toBeVisible()
    // Picking a summary row clears the selected day
    await expect(page.locator('.att-calendar-cell[aria-pressed="true"]')).toHaveCount(0)
    await shoot(page, 'attendance-filtered', testInfo)
    await page.getByRole('button', { name: 'Show all' }).click()
    await expect(page.getByText(/Showing only/)).toHaveCount(0)
})
