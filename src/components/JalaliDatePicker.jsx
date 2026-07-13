import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { todayJalali, getJalaliMonths, getDaysInJalaliMonth, getJalaliWeekday, toPersianDigits, makeJalaliString, parseJalaliString } from '../lib/jalali'

const WEEKDAY_HEADERS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export default function JalaliDatePicker({ value, onChange }) {
  const [ty] = todayJalali()
  const [viewYear, setViewYear] = useState(ty[0])
  const [viewMonth, setViewMonth] = useState(ty ? ty[1] : 1)
  const [selected, setSelected] = useState(value || '')

  useEffect(() => {
    if (value) {
      const [vy, vm] = parseJalaliString(value)
      if (vy) { setViewYear(vy); setViewMonth(vm) }
      setSelected(value)
    }
  }, [value])

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth)
  const firstWeekday = getJalaliWeekday(viewYear, viewMonth, 1)
  const grid = useMemo(() => {
    const cells = []
    for (let i = 1; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [firstWeekday, daysInMonth])

  const monthName = getJalaliMonths()[viewMonth - 1]
  const todayStr = makeJalaliString(ty[0], ty[1], ty[2])

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const selectDay = (d) => {
    if (!d) return
    const str = makeJalaliString(viewYear, viewMonth, d)
    setSelected(str)
    onChange(str)
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-90">
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <span className="font-bold text-slate-800 dark:text-slate-100">{monthName} {toPersianDigits(viewYear)}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-90">
          <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          if (!d) return <div key={i} />
          const dateStr = makeJalaliString(viewYear, viewMonth, d)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selected
          return (
            <button
              key={i}
              onClick={() => selectDay(d)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition active:scale-90 ${
                isSelected
                  ? 'bg-brand-600 text-white'
                  : isToday
                  ? 'bg-brand-100 dark:bg-brand-800/40 text-brand-700 dark:text-brand-300 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {toPersianDigits(d)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
