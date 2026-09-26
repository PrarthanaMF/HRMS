// Formats a stored date value for display.
// Accepts either a date-only string ('2026-08-01') or a full ISO timestamp
// ('2026-08-01T10:30:00.000Z') and shows the time part only when present —
// so old date-only records still render fine, and new timestamped records
// show the full "date, time" the way a Google Form response would.
export const formatTimestamp = (value) => {
    if (!value) return '—'

    const hasTime = value.includes('T')
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value

    const datePart = d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    })

    if (!hasTime) return datePart

    const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    })

    return `${datePart}, ${timePart}`
}


// Today's date as yyyy-mm-dd in the user's own timezone (toISOString() would give the UTC date,
// which can be a day behind late in the evening / early morning in India).
export const todayISO = () => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}