// Jalali (Shamsi) date conversion utilities
// Based on the well-tested algorithm by Roozbeh Pournader and Mohammad Toossi
// Reference: https://jdf.scr.ir/

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d])
}

export function toEnglishDigits(s) {
  return String(s).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
}

// --- Jalali leap year calculation ---
// Based on the 33-year cycle algorithm
export function isLeapJalali(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2261, 2324, 2394, 2456, 3178]
  let jp = breaks[0], jump = 0, leap = 0, n = 0

  for (let i = 1; i <= breaks.length; i++) {
    if (jy < breaks[i]) {
      jp = breaks[i - 1]
      jump = breaks[i] - jp
      break
    }
    if (i === breaks.length) {
      jp = breaks[breaks.length - 1]
      jump = 0
    }
  }

  n = jy - jp

  if (n < jump) {
    if (jump - n < 6) {
      n = n - jump + Math.floor((jump + 4) / 4) - Math.floor((jump + 3) / 4)
    }
    leap = (n % 4 === 0) ? 1 : 0
  } else {
    if (n < jump + 4) {
      leap = 0
    } else {
      leap = (n % 4 === 0 && n % 100 !== 0) ? 1 : 0
    }
  }

  return leap === 1
}

// Days in each Jalali month
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export function getDaysInJalaliMonth(jy, jm) {
  if (jm === 12 && isLeapJalali(jy)) return 30
  return J_DAYS_IN_MONTH[jm - 1]
}

// --- Gregorian to Jalali conversion ---
// Uses the algorithm from the Persian Gulf library (jdf.scr.ir)
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

// --- Jalali to Gregorian conversion ---
export function jalaliToGregorian(jy, jm, jd) {
  let gy = (jy <= 979) ? 621 : 1600
  let days = 365 * (jy - (jy <= 979 ? 0 : 979))
    + 4 * Math.floor((jy - (jy <= 979 ? 0 : 979)) / 4)
    - Math.floor((jy - (jy <= 979 ? 0 : 979)) / 100)
    + Math.floor((jy - (jy <= 979 ? 0 : 979)) / 400)

  for (let i = 0; i < jm - 1; i++) {
    days += J_DAYS_IN_MONTH[i]
  }
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
    if (days >= dim) {
      days -= dim
      gm++
    } else {
      break
    }
  }
  gm++
  const gd = days + 1

  return [gy, gm, gd]
}

// --- ISO date string (YYYY-MM-DD) to Jalali ---
export function isoToJalali(iso) {
  if (!iso) return [0, 0, 0]
  const [y, m, d] = iso.split('-').map(Number)
  return gregorianToJalali(y, m, d)
}

// --- Jalali to ISO date string (YYYY-MM-DD) ---
export function jalaliToISO(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

// --- Today's Jalali date ---
export function todayJalali() {
  const now = new Date()
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// --- Today's ISO date ---
export function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const J_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// --- Format ISO date as "DD Month YYYY" in Persian ---
export function formatJalaliLong(iso) {
  if (!iso) return ''
  const [jy, jm, jd] = isoToJalali(iso)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

// --- Format ISO date as "DD Month" in Persian ---
export function formatJalaliShort(iso) {
  if (!iso) return ''
  const [jy, jm, jd] = isoToJalali(iso)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]}`
}

// --- Format numbers with Persian digits ---
export function formatRial(n) {
  return toPersianDigits(Number(n || 0).toLocaleString('en-US'))
}

export function formatToman(n) {
  return toPersianDigits(Number(n || 0).toLocaleString('en-US'))
}

export function formatAmount(n, currency) {
  const v = currency === 'toman' ? Math.round(Number(n || 0) / 10) : Number(n || 0)
  return `${formatRial(v)} ${currencyLabel(currency)}`
}

export function currencyLabel(currency) {
  return currency === 'toman' ? 'تومان' : 'ریال'
}

// --- Filter items by date range (monthly/yearly/all) ---
// For 'monthly': filters to the specified Jalali month and year
// For 'yearly': filters to the specified Jalali year
// For 'all': no filter
export function filterByDate(items, filter, dateField = 'date', selectedMonth = null) {
  if (filter === 'all') return items
  const [ty, tm] = todayJalali()
  return items.filter((it) => {
    if (!it[dateField]) return false
    const [jy, jm] = isoToJalali(it[dateField])
    if (filter === 'yearly') return jy === ty
    if (filter === 'monthly') {
      if (selectedMonth != null) {
        return jy === ty && jm === selectedMonth
      }
      return jy === ty && jm === tm
    }
    return true
  })
}

// --- Format filter range label ---
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

// --- Filter by explicit date range (for reports) ---
export function filterByDateRange(items, startISO, endISO, dateField = 'date') {
  if (!startISO && !endISO) return items
  return items.filter((it) => {
    if (!it[dateField]) return false
    if (startISO && it[dateField] < startISO) return false
    if (endISO && it[dateField] > endISO) return false
    return true
  })
}

// --- Get Jalali month name ---
export function getMonthName(jm) {
  return J_MONTHS[jm - 1]
}

// --- Get Jalali month name from ISO date ---
export function getMonthNameFromISO(iso) {
  const [, jm] = isoToJalali(iso)
  return J_MONTHS[jm - 1]
}

// --- Get all 12 Persian month names ---
export function getJalaliMonths() {
  return J_MONTHS
}

// --- Sort items by date ---
export function sortByDate(items, sortDir = 'desc', dateField = 'date') {
  const sorted = [...items].sort((a, b) => {
    const dateA = a[dateField] || ''
    const dateB = b[dateField] || ''
    return dateA.localeCompare(dateB)
  })
  return sortDir === 'desc' ? sorted : sorted.reverse()
}

// --- Get the day of the week for a Jalali date (0=Saturday, 6=Friday) ---
export function getJalaliWeekday(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  const jsDay = new Date(gy, gm - 1, gd).getDay()
  // JS getDay: 0=Sunday, 1=Monday, ..., 6=Saturday
  // Persian week starts on Saturday (0) and ends on Friday (6)
  // Convert: JS Sunday(0) -> Persian Saturday(0), ..., JS Saturday(6) -> Persian Friday(6)
  // Actually: Persian: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  // JS: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // So: JS Sat(6) -> Persian Sat(0), JS Sun(0) -> Persian Sun(1), ..., JS Fri(5) -> Persian Fri(6)
  return (jsDay + 1) % 7
}

// --- Get the start and end ISO dates for a Jalali month ---
export function getJalaliMonthRange(jy, jm) {
  const startISO = jalaliToISO(jy, jm, 1)
  const lastDay = getDaysInJalaliMonth(jy, jm)
  const endISO = jalaliToISO(jy, jm, lastDay)
  return { startISO, endISO }
}
