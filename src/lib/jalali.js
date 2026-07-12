// Jalali (Shamsi) date utilities
// CRITICAL: All dates are stored as canonical Jalali strings "YYYY/MM/DD"
// (e.g. "1405/04/15"). We NEVER use new Date("1405-04-15") which JS
// interprets as Gregorian and causes wrong month/year/timezone bugs.
// All parsing, sorting, filtering, and display reads the Jalali string directly.

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d])
}

export function toEnglishDigits(s) {
  return String(s).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
}

const J_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// Days in each Jalali month (month 12 has 29, or 30 in leap years)
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

// --- Jalali leap year check (33-year cycle algorithm) ---
export function isLeapJalali(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2261, 2324, 2394, 2456, 3178]
  let jp = breaks[0], jump = 0, n = 0, leap = 0
  for (let i = 1; i <= breaks.length; i++) {
    if (jy < breaks[i]) { jp = breaks[i - 1]; jump = breaks[i] - jp; break }
    if (i === breaks.length) { jp = breaks[breaks.length - 1]; jump = 0 }
  }
  n = jy - jp
  if (n < jump) {
    if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 4) - Math.floor((jump + 3) / 4)
    leap = (n % 4 === 0) ? 1 : 0
  } else {
    leap = (n < jump + 4) ? 0 : ((n % 4 === 0 && n % 100 !== 0) ? 1 : 0)
  }
  return leap === 1
}

export function getDaysInJalaliMonth(jy, jm) {
  if (jm === 12 && isLeapJalali(jy)) return 30
  return J_DAYS_IN_MONTH[jm - 1]
}

// =====================================================
// CRITICAL: Parse Jalali date string "YYYY/MM/DD" directly
// NEVER use new Date() on a Jalali string.
// =====================================================

// Parse "1405/04/15" or "1405-04-15" → [1405, 4, 15]
export function parseJalaliString(str) {
  if (!str) return [0, 0, 0]
  const parts = str.split(/[/-]/).map(Number)
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

// Build canonical Jalali string "YYYY/MM/DD"
export function makeJalaliString(jy, jm, jd) {
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

// Today's Jalali date as [jy, jm, jd]
export function todayJalali() {
  const now = new Date()
  const gy = now.getFullYear()
  const gm = now.getMonth() + 1
  const gd = now.getDate()
  return gregorianToJalali(gy, gm, gd)
}

// Today's Jalali date as "YYYY/MM/DD" string
export function todayJalaliString() {
  const [jy, jm, jd] = todayJalali()
  return makeJalaliString(jy, jm, jd)
}

// --- Gregorian to Jalali conversion (for computing today's date only) ---
export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = (gy <= 1600) ? 0 : 979
  gy -= (gy <= 1600) ? 621 : 1600
  const gy2 = (gm > 2) ? (gy + 1) : gy
  let days = 365 * gy
    + Math.floor((gy2 + 3) / 4)
    - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400)
    - 80
    + gd
    + g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let jm = 0
  for (let i = 0; i < 11 && days >= J_DAYS_IN_MONTH[i]; i++) {
    days -= J_DAYS_IN_MONTH[i]
    jm++
  }
  jm++
  const jd = days + 1
  return [jy, jm, jd]
}

// --- Jalali to Gregorian (only for day-of-week calculation) ---
export function jalaliToGregorian(jy, jm, jd) {
  let gy = (jy <= 979) ? 621 : 1600
  let days = 365 * (jy - (jy <= 979 ? 0 : 979))
    + 4 * Math.floor((jy - (jy <= 979 ? 0 : 979)) / 4)
    - Math.floor((jy - (jy <= 979 ? 0 : 979)) / 100)
    + Math.floor((jy - (jy <= 979 ? 0 : 979)) / 400)
  for (let i = 0; i < jm - 1; i++) days += J_DAYS_IN_MONTH[i]
  days += jd
  gy += 33 * Math.floor(days / 12053)
  days %= 12053
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const sal_a = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)
  let gm = 0
  for (let i = 0; i < 13; i++) {
    const dim = g_d_m[i] + (i > 1 && sal_a ? 1 : 0)
    if (days >= dim) { days -= dim; gm++ } else break
  }
  gm++
  const gd = days + 1
  return [gy, gm, gd]
}

// =====================================================
// DISPLAY: Read Jalali string directly, format as "DD Month YYYY"
// =====================================================
export function formatJalaliLong(jalaliStr) {
  if (!jalaliStr) return ''
  const [jy, jm, jd] = parseJalaliString(jalaliStr)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

export function formatJalaliShort(jalaliStr) {
  if (!jalaliStr) return ''
  const [jy, jm, jd] = parseJalaliString(jalaliStr)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]}`
}

// --- Format numbers ---
export function formatRial(n) {
  return toPersianDigits(Number(n || 0).toLocaleString('en-US'))
}

export function formatAmount(n, currency) {
  const v = currency === 'toman' ? Math.round(Number(n || 0) / 10) : Number(n || 0)
  return `${formatRial(v)} ${currencyLabel(currency)}`
}

export function currencyLabel(currency) {
  return currency === 'toman' ? 'تومان' : 'ریال'
}

// =====================================================
// FILTERING: Parse Jalali string directly, compare Y/M/D
// =====================================================
export function filterByDate(items, filter, dateField = 'date', selectedMonth = null) {
  if (filter === 'all') return items
  const [ty, tm] = todayJalali()
  return items.filter((it) => {
    if (!it[dateField]) return false
    const [jy, jm] = parseJalaliString(it[dateField])
    if (filter === 'yearly') return jy === ty
    if (filter === 'monthly') {
      if (selectedMonth != null) return jy === ty && jm === selectedMonth
      return jy === ty && jm === tm
    }
    return true
  })
}

export function formatFilterRange(filter, selectedMonth = null) {
  if (filter === 'all') return 'همه موارد'
  const [ty, tm] = todayJalali()
  if (filter === 'yearly') return `سال ${toPersianDigits(ty)}`
  if (filter === 'monthly') {
    const monthLabel = selectedMonth != null ? J_MONTHS[selectedMonth - 1] : J_MONTHS[tm - 1]
    return `${monthLabel} ${toPersianDigits(ty)}`
  }
  return ''
}

// Filter by explicit Jalali date range (for reports)
// startStr/endStr are "YYYY/MM/DD" Jalali strings
export function filterByDateRange(items, startStr, endStr, dateField = 'date') {
  if (!startStr && !endStr) return items
  return items.filter((it) => {
    if (!it[dateField]) return false
    const d = it[dateField]
    if (startStr && d < startStr) return false
    if (endStr && d > endStr) return false
    return true
  })
}

// =====================================================
// SORTING: Compare Jalali strings directly (string comparison works
// because "YYYY/MM/DD" format sorts lexicographically = chronologically)
// =====================================================
export function sortByDate(items, sortDir = 'desc', dateField = 'date') {
  const sorted = [...items].sort((a, b) => {
    const dateA = a[dateField] || ''
    const dateB = b[dateField] || ''
    return dateA.localeCompare(dateB)
  })
  return sortDir === 'desc' ? sorted : sorted.reverse()
}

// --- Month helpers ---
export function getMonthName(jm) {
  return J_MONTHS[jm - 1]
}

export function getMonthNameFromJalaliString(jalaliStr) {
  const [, jm] = parseJalaliString(jalaliStr)
  return J_MONTHS[jm - 1]
}

export function getJalaliMonths() {
  return J_MONTHS
}

// --- Day of week for a Jalali date (0=Saturday ... 6=Friday) ---
export function getJalaliWeekday(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  const jsDay = new Date(gy, gm - 1, gd).getDay()
  // JS: 0=Sunday...6=Saturday → Persian: 0=Saturday...6=Friday
  return (jsDay + 1) % 7
}

// --- Get start/end Jalali strings for a month ---
export function getJalaliMonthRange(jy, jm) {
  const startStr = makeJalaliString(jy, jm, 1)
  const lastDay = getDaysInJalaliMonth(jy, jm)
  const endStr = makeJalaliString(jy, jm, lastDay)
  return { startStr, endStr }
}

// --- Safe migration: convert old ISO "YYYY-MM-DD" dates to Jalali "YYYY/MM/DD" ---
// This only runs once and does not delete any data.
export function migrateOldDates(items, dateField = 'date') {
  return items.map((it) => {
    const d = it[dateField]
    if (!d) return it
    // Already in Jalali "YYYY/MM/DD" format
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(d)) return it
    // Old ISO format "YYYY-MM-DD" (Gregorian) → convert to Jalali
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [gy, gm, gd] = d.split('-').map(Number)
      const [jy, jm, jd] = gregorianToJalali(gy, gm, gd)
      return { ...it, [dateField]: makeJalaliString(jy, jm, jd) }
    }
    return it
  })
}
