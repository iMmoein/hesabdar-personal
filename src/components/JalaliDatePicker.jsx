import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronLeft, Calendar, X } from 'lucide-react'
import {
  parseJalaliString, makeJalaliString, todayJalaliString, todayJalali,
  isLeapJalali, getDaysInJalaliMonth, getJalaliWeekday,
  toPersianDigits, getJalaliMonths, formatJalaliLong, getJalaliWeekdayName
} from '../lib/jalali'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

// Full-screen Jalali date picker for Android mobile
// - RTL Persian, real Jalali calendar
// - Year/Month/Day selection with easy year navigation
// - Temporary pending date until confirmed
// - تایید / انصراف buttons at bottom
// - Android Back = انصراف

const WEEKDAY_HEADERS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export default function JalaliDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('calendar') // 'calendar' | 'year' | 'month'
  const [viewYear, setViewYear] = useState(null)
  const [viewMonth, setViewMonth] = useState(null)
  const [pending, setPending] = useState(null) // [jy, jm, jd]

  const months = getJalaliMonths()

  // Initialize from current value or today's real Jalali date
  const initialValue = useMemo(() => {
    if (value) return parseJalaliString(value)
    return todayJalali()
  }, [value])

  const openPicker = () => {
    setViewYear(initialValue[0])
    setViewMonth(initialValue[1])
    setPending(initialValue)
    setView('calendar')
    setOpen(true)
  }

  // Android back button = cancel (priority handler)
  useEffect(() => {
    if (!open) return
    pushBackHandler(() => {
      setOpen(false)
    })
    return () => popBackHandler()
  }, [open])

  const handleConfirm = () => {
    if (pending) {
      onChange(makeJalaliString(pending[0], pending[1], pending[2]))
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const daysInMonth = viewYear && viewMonth ? getDaysInJalaliMonth(viewYear, viewMonth) : 30
  const firstWeekday = viewYear && viewMonth ? getJalaliWeekday(viewYear, viewMonth, 1) : 0
  const offset = firstWeekday > 0 ? firstWeekday - 1 : 0

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isPending = (day) => pending && pending[0] === viewYear && pending[1] === viewMonth && pending[2] === day
  const isToday = (day) => {
    const [ty, tm, td] = todayJalali()
    return ty === viewYear && tm === viewMonth && td === day
  }

  // Year picker: 24 years centered around current viewYear
  const yearRange = []
  if (viewYear) {
    for (let i = -6; i <= 17; i++) yearRange.push(viewYear + i)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPicker}
        className="card p-3 w-full flex items-center justify-between transition hover:border-brand-400"
      >
        <span className="text-slate-800 dark:text-slate-100 font-semibold no-wrap">
          {value ? formatJalaliLong(value) : formatJalaliLong(todayJalaliString())}
        </span>
        <Calendar size={20} className="text-brand-500 shrink-0" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 flex flex-col animate-fadeIn">
      {/* Header - sticky top */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
        style={{ paddingTop: 'calc(0.75rem + var(--safe-top))' }}
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">انتخاب تاریخ</h2>
        <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X size={22} />
        </button>
      </div>

      {/* Scrollable calendar content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {view === 'calendar' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRight size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('month')}
                  className="font-bold text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {viewMonth ? months[viewMonth - 1] : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setView('year')}
                  className="font-bold text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  {toPersianDigits(viewYear)}
                  <Calendar size={14} className="text-slate-400" />
                </button>
              </div>
              <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeft size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_HEADERS.map((w) => (
                <div key={w} className="text-center text-xs font-medium text-slate-400 py-1.5">{w}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => (
                <div key={i} className="aspect-square">
                  {day && (
                    <button
                      type="button"
                      onClick={() => setPending([viewYear, viewMonth, day])}
                      className={`w-full h-full flex items-center justify-center rounded-lg text-base font-medium transition ${
                        isPending(day)
                          ? 'bg-brand-600 text-white shadow-soft'
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

            {/* Pending date preview with weekday */}
            {pending && (
              <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400 no-wrap">
                تاریخ انتخاب شده: {getJalaliWeekdayName(makeJalaliString(pending[0], pending[1], pending[2]))} {formatJalaliLong(makeJalaliString(pending[0], pending[1], pending[2]))}
              </div>
            )}
          </>
        )}

        {view === 'year' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setViewYear((y) => y - 24)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRight size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="font-bold text-slate-800 dark:text-slate-100">انتخاب سال</span>
              <button type="button" onClick={() => setViewYear((y) => y + 24)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeft size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {yearRange.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => { setViewYear(yr); setView('calendar') }}
                  className={`py-4 rounded-xl text-lg font-medium transition ${
                    yr === viewYear
                      ? 'bg-brand-600 text-white shadow-soft'
                      : yr === initialValue[0]
                      ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {toPersianDigits(yr)}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setView('calendar')} className="btn-ghost w-full mt-4">بازگشت به تقویم</button>
          </>
        )}

        {view === 'month' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setViewYear((y) => y - 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRight size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="font-bold text-slate-800 dark:text-slate-100">{toPersianDigits(viewYear)}</span>
              <button type="button" onClick={() => setViewYear((y) => y + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeft size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {months.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setViewMonth(idx + 1); setView('calendar') }}
                  className={`py-4 rounded-xl text-lg font-medium transition ${
                    idx + 1 === viewMonth
                      ? 'bg-brand-600 text-white shadow-soft'
                      : idx + 1 === initialValue[1] && viewYear === initialValue[0]
                      ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setView('calendar')} className="btn-ghost w-full mt-4">بازگشت به تقویم</button>
          </>
        )}
      </div>

      {/* Bottom buttons - sticky */}
      <div
        className="flex gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
      >
        <button onClick={handleCancel} className="btn-ghost flex-1">انصراف</button>
        <button onClick={handleConfirm} className="btn-primary flex-1">تایید</button>
      </div>
    </div>
  )
}
