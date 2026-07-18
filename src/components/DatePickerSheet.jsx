import React, { useState, useCallback, useMemo } from 'react'
import jalaali from 'jalaali-js'
import { FullScreenSheet } from './FullScreenSheet'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { JALALI_MONTHS, PERSIAN_WEEKDAYS, getDaysInJalaliMonth, getWeekday, toPersianDigits, jalaliToString, parseJalaliString } from '../utils/jalali'

const YEARS = Array.from({ length: 41 }, (_, i) => 1380 + i)

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
  const [picker, setPicker] = useState(null)

  const daysInMonth = useMemo(() => getDaysInJalaliMonth(year, month), [year, month])
  const firstWeekday = useMemo(() => getWeekday(year, month, 1), [year, month])
  const weekdayIndex = useMemo(() => PERSIAN_WEEKDAYS.indexOf(firstWeekday), [firstWeekday])

  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < weekdayIndex; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [weekdayIndex, daysInMonth])

  const selectedWeekday = useMemo(() => {
    if (!selectedDay || selectedDay > daysInMonth) return ''
    return getWeekday(year, month, selectedDay)
  }, [year, month, selectedDay, daysInMonth])

  const handlePrevMonth = useCallback(() => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }, [month])

  const handleNextMonth = useCallback(() => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }, [month])

  const handleConfirm = useCallback(() => {
    const day = Math.min(selectedDay, daysInMonth)
    onConfirm(jalaliToString(year, month, day))
  }, [year, month, selectedDay, daysInMonth, onConfirm])

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
          <button
            onClick={() => setPicker('year')}
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium hover:border-brand-400 transition-all"
          >
            <span>{toPersianDigits(year)}</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => setPicker('month')}
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium hover:border-brand-400 transition-all"
          >
            <span>{JALALI_MONTHS[month - 1]}</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
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

        {selectedWeekday && (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
            {selectedWeekday} {toPersianDigits(selectedDay)} {JALALI_MONTHS[month - 1]} {toPersianDigits(year)}
          </div>
        )}
      </div>

      {picker === 'year' && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setPicker(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-w-md max-h-[70vh] overflow-y-auto no-scrollbar p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">انتخاب سال</h3>
              <button onClick={() => setPicker(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setPicker(null) }}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all btn-press ${
                    y === year
                      ? 'bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-glow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {toPersianDigits(y)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {picker === 'month' && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setPicker(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-w-md p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">انتخاب ماه</h3>
              <button onClick={() => setPicker(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {JALALI_MONTHS.map((m, i) => (
                <button
                  key={i + 1}
                  onClick={() => { setMonth(i + 1); setPicker(null) }}
                  className={`py-3 rounded-xl text-sm font-medium transition-all btn-press flex items-center justify-center gap-2 ${
                    i + 1 === month
                      ? 'bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-glow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {i + 1 === month && <Check className="w-4 h-4" />}
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </FullScreenSheet>
  )
}
