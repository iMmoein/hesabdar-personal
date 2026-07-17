import jalaali from 'jalaali-js'

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export const PERSIAN_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(str) {
  if (str == null) return ''
  return String(str).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

export function toEnglishDigits(str) {
  if (str == null) return ''
  return String(str).replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return '۰'
  const n = Number(num)
  return toPersianDigits(n.toLocaleString('en-US'))
}

export function formatAmount(num, currency = 'rial') {
  const formatted = formatNumber(Math.abs(num))
  const unit = currency === 'rial' ? 'ریال' : 'تومان'
  return `${formatted} ${unit}`
}

export function getTodayJalali() {
  const now = new Date()
  const j = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate())
  return {
    year: j.jy,
    month: j.jm,
    day: j.jd,
    str: `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`,
  }
}

export function jalaliToString(year, month, day) {
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
}

export function parseJalaliString(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.split('/')
  if (parts.length !== 3) return null
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  return { year, month, day }
}

export function jalaliToKey(str) {
  const parsed = parseJalaliString(str)
  if (!parsed) return 0
  return parsed.year * 10000 + parsed.month * 100 + parsed.day
}

export function keyToJalali(key) {
  if (!key) return ''
  const year = Math.floor(key / 10000)
  const month = Math.floor((key % 10000) / 100)
  const day = key % 100
  return jalaliToString(year, month, day)
}

export function getWeekday(year, month, day) {
  try {
    const g = jalaali.toGregorian(year, month, day)
    if (!g) return ''
    const date = new Date(Date.UTC(g.gy, g.gm - 1, g.gd))
    const weekdayIndex = date.getUTCDay()
    return PERSIAN_WEEKDAYS[weekdayIndex]
  } catch {
    return ''
  }
}

export function formatJalaliDate(str) {
  const parsed = parseJalaliString(str)
  if (!parsed) return ''
  const weekday = getWeekday(parsed.year, parsed.month, parsed.day)
  const monthName = JALALI_MONTHS[parsed.month - 1] || ''
  return `${weekday} ${toPersianDigits(parsed.day)} ${monthName} ${toPersianDigits(parsed.year)}`
}

export function formatJalaliDateShort(str) {
  const parsed = parseJalaliString(str)
  if (!parsed) return ''
  const monthName = JALALI_MONTHS[parsed.month - 1] || ''
  return `${toPersianDigits(parsed.day)} ${monthName} ${toPersianDigits(parsed.year)}`
}

export function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function getDaysInJalaliMonth(year, month) {
  if (month <= 6) return 31
  if (month <= 11) return 30
  return jalaali.isLeapJalaaliYear(year) ? 30 : 29
}

export function getMonthName(monthNum) {
  return JALALI_MONTHS[monthNum - 1] || ''
}

export function getMonthRange(year, month) {
  const startKey = year * 10000 + month * 100 + 1
  const endDay = getDaysInJalaliMonth(year, month)
  const endKey = year * 10000 + month * 100 + endDay
  return { startKey, endKey }
}

export function getYearRange(year) {
  return { startKey: year * 10000 + 101, endKey: year * 10000 + 1231 }
}

export function getDateRange(dateKey) {
  if (!dateKey) return { year: 0, month: 0 }
  return {
    year: Math.floor(dateKey / 10000),
    month: Math.floor((dateKey % 10000) / 100),
  }
}

export function formatInputAmount(num) {
  if (!num) return ''
  return toPersianDigits(Number(num).toLocaleString('en-US'))
}

export function parseAmountInput(str) {
  if (!str) return 0
  const english = toEnglishDigits(str).replace(/[^0-9]/g, '')
  return english ? parseInt(english, 10) : 0
}
