// Jalali (Shamsi) date conversion utilities — algorithm per Kazimierz M. Borkowski

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d])
}

export function toEnglishDigits(s) {
  return String(s).replace(/[۰-۹٦-٩]/g, (d) => {
    const code = d.charCodeAt(0)
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
    return String(PERSIAN_DIGITS.indexOf(d))
  })
}

const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export function isLeapJalali(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2261, 2324, 2394, 2456, 3178]
  let jp = breaks[0], jm = 0, jump = 0, leap = 0, n = 0
  for (let i = 1; i <= breaks.length; i++) {
    if (jy < breaks[i]) { jm = breaks[i - 1]; jump = breaks[i] - jm; break }
    jp = breaks[i]
  }
  n = jy - jp
  if (n < jump) {
    if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 4) - Math.floor((jump + 3) / 4)
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

export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = (gy <= 1600) ? 0 : 979
  gy -= (gy <= 1600) ? 621 : 1600
  let gy2 = (gm > 2) ? (gy + 1) : gy
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let jm, jd
  for (jm = 0; jm < 11 && days >= J_DAYS_IN_MONTH[jm]; jm++) days -= J_DAYS_IN_MONTH[jm]
  jm++
  jd = days + 1
  return [jy, jm, jd]
}

export function jalaliToGregorian(jy, jm, jd) {
  let gy = (jy <= 979) ? 621 : 1600
  let days = (365 * (jy - (jy <= 979 ? 0 : 979)))
    + (4 * Math.floor((jy - (jy <= 979 ? 0 : 979)) / 4))
    - (Math.floor((jy - (jy <= 979 ? 0 : 979)) / 100))
    + (Math.floor((jy - (jy <= 979 ? 0 : 979)) / 400))
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
  let gd, gm
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const sal_a = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)
  for (gm = 0; gm < 13 && days >= (g_d_m[gm] + (gm > 1 && sal_a ? 1 : 0)); gm++) {
    days -= g_d_m[gm] + (gm > 1 && sal_a ? 1 : 0)
  }
  gd = days + 1
  gm++
  return [gy, gm, gd]
}

export function isoToJalali(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return gregorianToJalali(y, m, d)
}

export function jalaliToISO(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

export function todayJalali() {
  const now = new Date()
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const J_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

export function formatJalaliLong(iso) {
  if (!iso) return ''
  const [jy, jm, jd] = isoToJalali(iso)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

export function formatJalaliShort(iso) {
  if (!iso) return ''
  const [jy, jm, jd] = isoToJalali(iso)
  return `${toPersianDigits(jd)} ${J_MONTHS[jm - 1]}`
}

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

export function filterByDate(items, filter, dateField = 'date') {
  if (filter === 'all') return items
  const [ty, tm] = todayJalali()
  return items.filter((it) => {
    if (!it[dateField]) return false
    const [jy, jm] = isoToJalali(it[dateField])
    if (filter === 'yearly') return jy === ty
    return jy === ty && jm === tm
  })
}

export function formatFilterRange(filter) {
  if (filter === 'all') return 'همه موارد'
  const [ty, tm] = todayJalali()
  if (filter === 'yearly') return `سال ${toPersianDigits(ty)}`
  return `${J_MONTHS[tm - 1]} ${toPersianDigits(ty)}`
}

export function filterByDateRange(items, startISO, endISO, dateField = 'date') {
  if (!startISO && !endISO) return items
  return items.filter((it) => {
    if (!it[dateField]) return false
    if (startISO && it[dateField] < startISO) return false
    if (endISO && it[dateField] > endISO) return false
    return true
  })
}

export function getMonthName(jm) {
  return J_MONTHS[jm - 1]
}

export function getMonthNameFromISO(iso) {
  const [, jm] = isoToJalali(iso)
  return J_MONTHS[jm - 1]
}
