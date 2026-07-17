import React, { useState, useCallback, useMemo } from 'react'
import jalaali from 'jalaali-js'
import { FullScreenSheet } from './FullScreenSheet'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { JALALI_MONTHS, PERSIAN_WEEKDAYS, getDaysInJalaliMonth, getWeekday, toPersianDigits, jalaliToString, parseJalaliString } from '../utils/jalali'

export function DatePickerSheet({ initialDate, onConfirm, onClose }) {
  const today = useMemo(() => {
    const now = new Date()
    const j = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return { year: j.jy, month: j.jm, day: j.jd }
  }, [])

  const parsed = useMemo(() => {
    if (!initialDate) return null
    return parseJalaliString(initialDate)
  }, [initialDate])

  const [year, setYear] = useState(parsed?.year || today.year)
  const [month, setMonth] = useState(parsed?.month || today.month)
  const [selectedDay, setSelectedDay] = useState(parsed?.day || today.day)

  const daysInMonth = useMemo(() => getDaysInJalaliMonth(year, month), [year, month])
  const firstWeekday = useMemo(() => getWeekday(year, month, 1), [year, month])
  const weekdayIndex = useMemo(() => PERSIAN_WEEKDAYS.indexOf(firstWeekday), [firstWeekday])

  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < weekdayIndex; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [weekdayIndex, daysInMonth])

  const handlePrevMonth = useCallback(() => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }, [month])

  const handleNextMonth = useCallback(() => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }, [month])

  const handleConfirm = useCallback(() => {
    onConfirm(jalaliToString(year, month, selectedDay))
  }, [year, month, selectedDay, onConfirm])

  const isToday = (day) => year === today.year && month === today.month && day === today.day

  return (
    <FullScreenSheet
      title="انتخاب تاریخ"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 btn-press transition-all"
          >
            انصراف
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium shadow-glow btn-press transition-all"
          >
            تایید
          </button>
        </>
      }
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium"
          >
            {Array.from({ length: 21 }, (_, i) => today.year - 10 + i).map((y) => (
              <option key={y} value={y}>{toPersianDigits(y)}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium"
          >
            {JALALI_MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-2">
          <button onClick={handleNextMonth} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all">
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {JALALI_MONTHS[month - 1]} {toPersianDigits(year)}
          </span>
          <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {PERSIAN_WEEKDAYS.map((d) => (
            <div key={d} className="text-xs text-slate-400 dark:text-slate-500 py-2 font-medium">
              {d.charAt(0)}
            </div>
          ))}
          {cells.map((day, i) => (
            <div key={i}>
              {day === null ? (
                <div className="aspect-square" />
              ) : (
                <button
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all btn-press ${
                    day === selectedDay
                      ? 'bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-glow'
                      : isToday(day)
                      ? 'text-brand-600 dark:text-brand-400 ring-2 ring-brand-300 dark:ring-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </FullScreenSheet>
  )
}
