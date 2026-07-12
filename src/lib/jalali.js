// Jalali (Shamsi) date utilities — compact, no external deps

const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
const G_DAYS_IN_MONTH = [31, 28, 31, 31, 31, 31, 31, 31, 31, 30, 31, 30, 31]

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d])
}

export function toEnglishDigits(str) {
  return String(str).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
}

function div(a, b) { return Math.floor(a / b) }

export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = G_DAYS_IN_MONTH.slice()
  let jy
  if (gy <= 1600) {
    jy = 0; gy -= 621
  } else {
    jy = 979; gy -= 1600
  }
  let gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd +
    g_d_m.slice(0, gm - 1).reduce((a, b) => a + b, 0)
  jy += 33 * div(days, 12053)
  days %= 12053
  jy += 4 * div(days, 1461)
  days %= 1461
  if (days > 365) {
    jy += div(days - 1, 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

export function jalaliToGregorian(jy, jm, jd) {
  let gy
  if (jy <= 979) {
    gy = 621
  } else {
    gy = 1600; jy -= 979
  }
  let days =
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    78 +
    jd +
    J_DAYS_IN_MONTH.slice(0, jm - 1).reduce((a, b) => a + b, 0)
  gy += 1600
  days -= 123
  if (days >= 0) {
    gy += div(days, 146097) * 400
    days %= 146097
  } else {
    gy += div(days, 146097) - (days % 146097 !== 0 ? 1 : 0)
    days = ((days % 146097) + 146097) % 146097
  }
  let leap = 1
  if (days >= 36525) {
    days--
    leap += div(days, 36525)
    days %= 36525
    if (days >= 365) {
      days -= leap === 4 ? 1 : 0
      leap += div(days, 365)
      days %= 365
    }
  }
  const sal_a = G_DAYS_IN_MONTH.slice()
  if (leap === 4 && days === 365) return [gy + 1, 12, 31]
  const sal_d = days + (days >= 59 && leap <= 2 ? 1 : 0)
  let gm = 1
  for (let i = 0; i < 12; i++) {
    if (sal_d < sal_a[i]) break
    sal_d -= sal_a[i]
    gm++
  }
  return [gy, gm, sal_d + 1]
}

export function isoToJalali(iso) {
  if (!iso) return null
  const [gy, gm, gd] = iso.split('-').map(Number)
  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd)
  return { jy, jm, jd }
}

export function jalaliToISO(jalali) {
  let jy, jm, jd
  if (typeof jalali === 'string') {
    const parts = jalali.split('/').map(Number)
    jy = parts[0]; jm = parts[1]; jd = parts[2]
  } else {
    jy = jalali.jy; jm = jalali.jm; jd = jalali.jd
  }
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

export function todayJalali() {
  const now = new Date()
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
  return { jy, jm, jd }
}

export function todayJalaliStr() {
  const { jy, jm, jd } = todayJalali()
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

export function formatJalaliLong(j) {
  if (!j) return ''
  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
  return `${toPersianDigits(j.jd)} ${months[j.jm - 1]} ${toPersianDigits(j.jy)}`
}

export function formatJalaliShort(j) {
  if (!j) return ''
  return `${toPersianDigits(j.jy)}/${toPersianDigits(String(j.jm).padStart(2, '0'))}/${toPersianDigits(String(j.jd).padStart(2, '0'))}`
}

export function formatRial(n) {
  return toPersianDigits(Number(n || 0).toLocaleString('en-US'))
}

export function formatToman(n) {
  return toPersianDigits(Number((n || 0) / 10).toLocaleString('en-US'))
}

export function formatMoney(n, currency = 'rial') {
  if (currency === 'toman') return formatToman(n) + ' تومان'
  return formatRial(n) + ' ریال'
}

export function formatAmount(n, currency = 'rial') {
  if (currency === 'toman') return formatToman(n)
  return formatRial(n)
}

export function currencyLabel(currency) {
  return currency === 'toman' ? 'تومان' : 'ریال'
}

export function filterByDate(item, filter, customStart, customEnd) {
  if (filter === 'all') return true
  if (filter === 'custom') {
    if (customStart && item.date < customStart) return false
    if (customEnd && item.date > customEnd) return false
    return true
  }
  const today = new Date()
  const [jy, jm, jd] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())
  if (filter === 'monthly') {
    return item.date >= jalaliToISO({ jy, jm, jd: 1 }) && item.date <= jalaliToISO({ jy, jm, jd: 31 })
  }
  if (filter === 'yearly') {
    return item.date >= jalaliToISO({ jy, jm: 1, jd: 1 }) && item.date <= jalaliToISO({ jy, jm: 12, jd: 29 })
  }
  return true
}

export function formatFilterRange(filter) {
  if (filter === 'all') return 'همه'
  if (filter === 'monthly') return 'ماهیانه'
  if (filter === 'yearly') return 'سالانه'
  if (filter === 'custom') return 'بازه دلخواه'
  return ''
}
