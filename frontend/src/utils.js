// Small helper functions used on several pages

// Today's date as "YYYY-MM-DD" (the format used by <input type="date">)
export function today() {
  return toInputDate(new Date())
}

// Tomorrow's date as "YYYY-MM-DD"
export function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toInputDate(d)
}

// The day after a given "YYYY-MM-DD" date
export function nextDay(dateString) {
  const d = new Date(dateString + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return toInputDate(d)
}

function toInputDate(d) {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// Number of nights between two "YYYY-MM-DD" dates
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const ms = new Date(checkOut) - new Date(checkIn)
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

// 120 -> "$120"
export function formatPrice(amount) {
  return '$' + Number(amount).toLocaleString()
}

// "2026-11-01T00:00:00.000Z" -> "1 Nov 2026"
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC', // dates are saved as midnight UTC, so show them in UTC to avoid being off by one day
  })
}

// Bootstrap colour for each booking status
export const statusColors = {
  confirmed: 'primary',
  checked_in: 'success',
  checked_out: 'secondary',
  cancelled: 'danger',
}

// "checked_in" -> "Checked in"
export function statusLabel(status) {
  const text = status.replace('_', ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}
