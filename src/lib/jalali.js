// Jalali (Shamsi) date utilities
// CRITICAL: All dates are stored as canonical Jalali strings "YYYY/MM/DD"
// (e.g. "1405/04/15"). We NEVER use new Date("1405-04-15") which JS
// interprets as Gregorian and causes wrong month/year/timezone bugs.
// All parsing, sorting, filtering, and display reads the Jalali string directly.
// Weekday calculation uses react-date-object with Persian calendar + Persian locale.

import DateObject from 'react-date-object'

// react-date-object v1.x uses string identifiers for calendars/locales
// (no subpath exports). We pass "persian" and "gregorian" as the calendar
// parameter and "fa" / "en" as the locale.
const PERSIAN = 'persian'
const PERSIAN_FA = 'fa'

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

export function parseJalaliString(str) {
  if (!str) return [0, 0, 0]
  const parts = str.split(/[/-]/).map(Number)
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

export function makeJalaliString(jy, jm, jd) {
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

// Today's Jalali date as [jy, jm, jd] — uses Gregorian today, converts to Jalali
export function todayJalali() {
  const dobj = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA })
  return [dobj.year, dobj.month.number, dobj.day]
}

export function todayJalaliString() {
  const [jy, jm, jd] = todayJalali()
  return makeJalaliString(jy, jm, jd)
}

// =====================================================
// WEEKDAY: Use react-date-object with Persian calendar + Persian locale
// This gives accurate Jalali weekday names.
// =====================================================

// react-date-object weekday.number mapping (Persian calendar):
// 1=شنبه(Saturday), 2=یکشنبه(Sunday), 3=دوشنبه(Monday),
// 4=سه‌شنبه(Tuesday), 5=چهارشنبه(Wednesday),
// 6=پنج‌شنبه(Thursday), 7=جمعه(Friday)
const PERSIAN_WEEKDAYS = [
  '', 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
]

// getJalaliWeekday returns 1=Saturday ... 7=Friday
export function getJalaliWeekday(jy, jm, jd) {
  const dobj = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA })
  dobj.set({ year: jy, month: jm, day: jd })
  return dobj.weekDay.number
}

// Get weekday NAME for a Jalali date string
export function getJalaliWeekdayName(jalaliStr) {
  if (!jalaliStr) return ''
  const [jy, jm, jd] = parseJalaliString(jalaliStr)
  if (!jy || !jm || !jd) return ''
  const wd = getJalaliWeekday(jy, jm, jd)
  return PERSIAN_WEEKDAYS[wd] || ''
}

// =====================================================
// DISPLAY: Read Jalali string directly, format as "DD Month YYYY"
// =====================================================

export function formatJalaliLong(jalaliStr) {
  if (!jalaliStr) return ''
  const [jy, jm, jd] = parseJalaliString(jalaliStr)
  if (!jy || !jm || !jd) return ''
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

export function formatJalaliShort(jalaliStr) {
  if (!jalaliStr) return ''
  const [jy, jm, jd] = parseJalaliString(jalaliStr)
  if (!jy || !jm || !jd) return ''
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]}`
}

// Format with weekday: "دوشنبه ۲۲ تیر ۱۴۰۵"
export function formatJalaliWithWeekday(jalaliStr) {
  if (!jalaliStr) return ''
  const weekday = getJalaliWeekdayName(jalaliStr)
  const dateStr = formatJalaliLong(jalaliStr)
  if (!weekday) return dateStr
  return `${weekday} ${dateStr}`
}

// =====================================================
// FORMAT NUMBERS
// =====================================================

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
  const [ty] = todayJalali()
  return items.filter((it) => {
    if (!it[dateField]) return false
    const [jy, jm] = parseJalaliString(it[dateField])
    if (filter === 'yearly') return jy === ty
    if (filter === 'monthly') {
      if (selectedMonth != null) return jy === ty && jm === selectedMonth
      const [, tm] = todayJalali()
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
    const cmp = dateA.localeCompare(dateB)
    if (cmp !== 0) return sortDir === 'desc' ? -cmp : cmp
    // tie-breaker: most recently created first
    const ca = String(a.createdAt || a.id || '')
    const cb = String(b.createdAt || b.id || '')
    return cb.localeCompare(ca)
  })
  return sorted
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

// --- Get start/end Jalali strings for a month ---
export function getJalaliMonthRange(jy, jm) {
  const startStr = makeJalaliString(jy, jm, 1)
  const lastDay = getDaysInJalaliMonth(jy, jm)
  const endStr = makeJalaliString(jy, jm, lastDay)
  return { startStr, endStr }
}

// --- Safe migration: convert old ISO "YYYY-MM-DD" dates to Jalali "YYYY/MM/DD" ---
export function migrateOldDates(items, dateField = 'date') {
  return items.map((it) => {
    const d = it[dateField]
    if (!d) return it
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(d)) return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [gy, gm, gd] = d.split('-').map(Number)
      const dobj = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA })
      dobj.set(new Date(gy, gm - 1, gd))
      return { ...it, [dateField]: makeJalaliString(dobj.year, dobj.month.number, dobj.day) }
    }
    return it
  })
}

// Get current time as HH:MM
export function currentTimeString() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export { PERSIAN_WEEKDAYS }
