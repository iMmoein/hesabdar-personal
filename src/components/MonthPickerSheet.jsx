import React, { useState, useMemo } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { JALALI_MONTHS, getTodayJalali, toPersianDigits } from '../utils/jalali'
import { ChevronLeft, Check } from 'lucide-react'

const YEARS = Array.from({ length: 41 }, (_, i) => 1380 + i)

export function MonthPickerSheet({ selectedYear, selectedMonth, onConfirm, onClose }) {
  const today = useMemo(() => getTodayJalali(), [])
  const [year, setYear] = useState(selectedYear || today.year)
  const [month, setMonth] = useState(selectedMonth || today.month)
  const [showYears, setShowYears] = useState(false)

  const handleConfirm = () => {
    onConfirm({ year, month })
  }

  return (
    <FullScreenSheet
      title="انتخاب ماه"
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
        <button
          onClick={() => setShowYears(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium hover:border-brand-400 transition-all"
        >
          <span>{toPersianDigits(year)}</span>
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          {JALALI_MONTHS.map((m, i) => (
            <button
              key={i + 1}
              onClick={() => setMonth(i + 1)}
              className={`py-3.5 rounded-2xl text-sm font-medium transition-all btn-press flex items-center justify-center gap-2 ${
                i + 1 === month
                  ? 'bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-glow'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {i + 1 === month && <Check className="w-4 h-4" />}
              {m} {toPersianDigits(year)}
            </button>
          ))}
        </div>
      </div>

      {showYears && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setShowYears(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl w-full max-w-md max-h-[70vh] overflow-y-auto no-scrollbar p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">انتخاب سال</h3>
              <button onClick={() => setShowYears(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setShowYears(false) }}
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
    </FullScreenSheet>
  )
}
