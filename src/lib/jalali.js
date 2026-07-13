// Jalali (Shamsi) date utilities
import DateObject from 'react-date-object'

const PERSIAN = 'persian'
const PERSIAN_FA = 'fa'

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(s) { return String(s).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d]) }
export function toEnglishDigits(s) { return String(s).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d)) }

const J_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export function isLeapJalali(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2261, 2324, 2394, 2456, 3178]
  let jp = breaks[0], jump = 0, n = 0, leap = 0
  for (let i = 1; i <= breaks.length; i++) {
    if (jy < breaks[i]) { jp = breaks[i - 1]; jump = breaks[i] - jp; break }
    if (i === breaks.length) { jp = breaks[breaks.length - 1]; jump = 0 }
  }
  n = jy - jp
  if (n < jump) { if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 4) - Math.floor((jump + 3) / 4); leap = (n % 4 === 0) ? 1 : 0 }
  else { leap = (n < jump + 4) ? 0 : ((n % 4 === 0 && n % 100 !== 0) ? 1 : 0) }
  return leap === 1
}

export function getDaysInJalaliMonth(jy, jm) { return jm === 12 && isLeapJalali(jy) ? 30 : J_DAYS_IN_MONTH[jm - 1] }
export function parseJalaliString(str) { if (!str) return [0, 0, 0]; const p = str.split(/[/-]/).map(Number); return [p[0] || 0, p[1] || 0, p[2] || 0] }
export function makeJalaliString(jy, jm, jd) { return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}` }
export function todayJalali() { const d = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA }); return [d.year, d.month.number, d.day] }
export function todayJalaliString() { const [jy, jm, jd] = todayJalali(); return makeJalaliString(jy, jm, jd) }

const PERSIAN_WEEKDAYS = ['', 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

export function getJalaliWeekday(jy, jm, jd) {
  const d = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA }); d.set({ year: jy, month: jm, day: jd }); return d.weekDay.number
}
export function getJalaliWeekdayName(jalaliStr) { if (!jalaliStr) return ''; const [jy, jm, jd] = parseJalaliString(jalaliStr); if (!jy || !jm || !jd) return ''; return PERSIAN_WEEKDAYS[getJalaliWeekday(jy, jm, jd)] || '' }
export function formatJalaliLong(jalaliStr) { if (!jalaliStr) return ''; const [jy, jm, jd] = parseJalaliString(jalaliStr); if (!jy || !jm || !jd) return ''; return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]} ${toPersianDigits(jy)}` }
export function formatJalaliShort(jalaliStr) { if (!jalaliStr) return ''; const [jy, jm, jd] = parseJalaliString(jalaliStr); if (!jy || !jm || !jd) return ''; return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]}` }
export function formatJalaliWithWeekday(jalaliStr) { if (!jalaliStr) return ''; const wd = getJalaliWeekdayName(jalaliStr); const ds = formatJalaliLong(jalaliStr); return wd ? `${wd} ${ds}` : ds }
export function formatRial(n) { return toPersianDigits(Number(n || 0).toLocaleString('en-US')) }
export function formatAmount(n, currency) { const v = currency === 'toman' ? Math.round(Number(n || 0) / 10) : Number(n || 0); return `${formatRial(v)} ${currencyLabel(currency)}` }
export function currencyLabel(currency) { return currency === 'toman' ? 'تومان' : 'ریال' }

export function filterByDate(items, filter, dateField = 'date', selectedMonth = null) {
  if (filter === 'all') return items
  const [ty] = todayJalali()
  return items.filter((it) => { if (!it[dateField]) return false; const [jy, jm] = parseJalaliString(it[dateField]); if (filter === 'yearly') return jy === ty; if (filter === 'monthly') { if (selectedMonth != null) return jy === ty && jm === selectedMonth; const [, tm] = todayJalali(); return jy === ty && jm === tm } return true })
}
export function filterByDateRange(items, startStr, endStr, dateField = 'date') {
  if (!startStr && !endStr) return items
  return items.filter((it) => { if (!it[dateField]) return false; const d = it[dateField]; if (startStr && d < startStr) return false; if (endStr && d > endStr) return false; return true })
}
export function getJalaliMonths() { return J_MONTHS }
export function getJalaliMonthRange(jy, jm) { return { startStr: makeJalaliString(jy, jm, 1), endStr: makeJalaliString(jy, jm, getDaysInJalaliMonth(jy, jm)) } }

export function migrateOldDates(items, dateField = 'date') {
  return items.map((it) => {
    const d = it[dateField]; if (!d) return it; if (/^\d{4}\/\d{2}\/\d{2}$/.test(d)) return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { const [gy, gm, gd] = d.split('-').map(Number); const dobj = new DateObject({ calendar: PERSIAN, locale: PERSIAN_FA }); dobj.set(new Date(gy, gm - 1, gd)); return { ...it, [dateField]: makeJalaliString(dobj.year, dobj.month.number, dobj.day) } }
    return it
  })
}

export function currentTimeString() { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}` }
export function jalaliDateForFilename(jalaliStr) { if (!jalaliStr) return ''; const [jy, jm, jd] = parseJalaliString(jalaliStr); return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}` }
export { PERSIAN_WEEKDAYS }
