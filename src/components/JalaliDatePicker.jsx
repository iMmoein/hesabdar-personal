import { useState } from 'react'
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react'
import {
  jalaliToGregorian, jalaliToISO, isoToJalali, isLeapJalali, todayJalali,
  toPersianDigits, getDaysInJalaliMonth, getJalaliMonths
} from '../lib/jalali'

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export default function JalaliDatePicker({ value, onChange }) {
  const months = getJalaliMonths()
  const initial = value ? isoToJalali(value) : todayJalali()
  const [viewYear, setViewYear] = useState(initial[0])
  const [viewMonth, setViewMonth] = useState(initial[1])
  const [selected, setSelected] = useState(value ? initial : null)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth)

  // Calculate the day of week for the 1st of the month
  // JS getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // Persian week starts on Saturday: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1)
  const jsDay = new Date(gy, gm - 1, gd).getDay()
  // Convert JS day to Persian day offset: (jsDay + 1) % 7
  // JS Sat(6) -> Persian Sat(0), JS Sun(0) -> Persian Sun(1), ..., JS Fri(5) -> Persian Fri(6)
  const offset = (jsDay + 1) % 7

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

  // Year picker: show a range of years around the current view year
  const yearRange = []
  const yearStart = Math.floor(viewYear / 12) * 12
  for (let i = -6; i < 18; i++) {
    yearRange.push(yearStart + i)
  }

  return (
    <div className="card p-4">
      {!showYearPicker ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <button
              type="button"
              onClick={() => setShowYearPicker(true)}
              className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              {months[viewMonth - 1]} {toPersianDigits(viewYear)}
              <Calendar size={14} className="text-slate-400" />
            </button>
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
              تاریخ انتخاب شده: {toPersianDigits(selected[2])} {months[selected[1] - 1]} {toPersianDigits(selected[0])}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 12)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              انتخاب سال
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 12)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {yearRange.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  setViewYear(yr)
                  setShowYearPicker(false)
                }}
                className={`py-3 rounded-lg text-sm font-medium transition ${
                  yr === viewYear
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {toPersianDigits(yr)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowYearPicker(false)}
            className="btn-ghost w-full mt-3"
          >
            بازگشت به تقویم
          </button>
        </>
      )}
    </div>
  )
}
