import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { todayJalali, toPersianDigits, jalaliToGregorian, formatJalaliShort } from '../lib/jalali'

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

const J_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

function isLeap(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2268, 2324, 2394, 2456, 3178]
  let jp = breaks[0], jm = breaks[1], jump = 0
  for (let i = 2; i < breaks.length; i += 2) {
    const jt = breaks[i]
    if (jy < jt) { jm = jt; break }
    jp = jt
  }
  let n = jy - jp
  if (jy === jm) jump = 0
  else {
    const div = Math.floor((jm - jp) / 12)
    jump = n - div * 12
  }
  let leap = (n + 1) * 12 - jump
  return leap % 4 === 0
}

export function JalaliDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const initial = (() => {
    if (!value) {
      const t = todayJalali()
      return { jy: t.jy, jm: t.jm, jd: t.jd }
    }
    if (typeof value === 'string') {
      const parts = value.split('/').map(Number)
      return { jy: parts[0], jm: parts[1], jd: parts[2] }
    }
    return { jy: value.jy, jm: value.jm, jd: value.jd }
  })()

  const [view, setView] = useState({ jy: initial.jy, jm: initial.jm })
  const [selected, setSelected] = useState({ jy: initial.jy, jm: initial.jm, jd: initial.jd })

  useEffect(() => {
    if (value) {
      const v = typeof value === 'string'
        ? { jy: +value.split('/')[0], jm: +value.split('/')[1], jd: +value.split('/')[2] }
        : value
      setSelected(v)
      setView({ jy: v.jy, jm: v.jm })
    }
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [open])

  const today = todayJalali()
  const daysInMonth = J_DAYS[view.jm - 1] + (view.jm === 12 && isLeap(view.jy) ? 1 : 0)

  const firstDayOfMonth = (() => {
    const [gy, gm, gd] = jalaliToGregorian(view.jy, view.jm, 1)
    const d = new Date(gy, gm - 1, gd)
    return (d.getDay() + 1) % 7
  })()

  const handleSelect = (day) => {
    const newDate = { jy: view.jy, jm: view.jm, jd: day }
    setSelected(newDate)
    onChange(newDate)
    setOpen(false)
  }

  const prevMonth = () => {
    setView((v) => {
      if (v.jm === 1) return { jy: v.jy - 1, jm: 12 }
      return { jy: v.jy, jm: v.jm - 1 }
    })
  }

  const nextMonth = () => {
    setView((v) => {
      if (v.jm === 12) return { jy: v.jy + 1, jm: 1 }
      return { jy: v.jy, jm: v.jm + 1 }
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-right"
      >
        <span>{toPersianDigits(formatJalaliShort(selected))}</span>
        <Calendar size={18} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 right-0 w-72 card p-3 animate-fade shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <ChevronRight size={20} className="text-slate-500" />
            </button>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {MONTHS[view.jm - 1]} {toPersianDigits(view.jy)}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <ChevronLeft size={20} className="text-slate-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d, i) => (
              <div key={i} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={'e' + i} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = selected.jy === view.jy && selected.jm === view.jm && selected.jd === day
              const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === day
              return (
                <button
                  key={day}
                  onClick={() => handleSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm transition
                    ${isSelected
                      ? 'bg-brand-600 text-white font-bold'
                      : isToday
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {toPersianDigits(day)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
