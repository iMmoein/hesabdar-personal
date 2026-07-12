import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { jalaliToGregorian, jalaliToISO, isoToJalali, isLeapJalali, todayJalali, toPersianDigits } from '../lib/jalali'

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const J_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export default function JalaliDatePicker({ value, onChange }) {
  const initial = value ? isoToJalali(value) : todayJalali()
  const [viewYear, setViewYear] = useState(initial[0])
  const [viewMonth, setViewMonth] = useState(initial[1])
  const [selected, setSelected] = useState(value ? initial : null)

  const daysInMonth = viewMonth === 12 && isLeapJalali(viewYear) ? 30 : J_DAYS[viewMonth - 1]

  const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1)
  const firstDow = new Date(gy, gm - 1, gd).getDay()
  const offset = (firstDow + 1) % 7

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const handleDayClick = (day) => {
    const iso = jalaliToISO(viewYear, viewMonth, day)
    setSelected([viewYear, viewMonth, day])
    onChange(iso)
  }

  const isSelected = (day) => {
    if (!selected) return false
    return selected[0] === viewYear && selected[1] === viewMonth && selected[2] === day
  }

  const isToday = (day) => {
    const [ty, tm, td] = todayJalali()
    return ty === viewYear && tm === viewMonth && td === day
  }

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}
        </span>
        <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-slate-400 py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className="aspect-square">
            {day && (
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={`w-full h-full flex items-center justify-center rounded-lg text-sm font-medium transition ${
                  isSelected(day)
                    ? 'bg-brand-600 text-white'
                    : isToday(day)
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {toPersianDigits(day)}
              </button>
            )}
          </div>
        ))}
      </div>
      {selected && (
        <div className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          تاریخ انتخاب شده: {toPersianDigits(selected[2])} {MONTHS[selected[1] - 1]} {toPersianDigits(selected[0])}
        </div>
      )}
    </div>
  )
}
