import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatFilterRange, getJalaliMonths, toPersianDigits } from '../lib/jalali'

const OPTIONS = [
  { value: 'all', label: 'همه' },
  { value: 'monthly', label: 'ماهیانه' },
  { value: 'yearly', label: 'سالانه' }
]

export default function FilterBar({ filter, onChange, selectedMonth, onMonthSelect }) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const months = getJalaliMonths()

  const handleFilterClick = (value) => {
    if (value === 'monthly' && onMonthSelect) {
      setShowMonthPicker((s) => !s)
    } else {
      setShowMonthPicker(false)
    }
    onChange(value)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterClick(opt.value)}
            className={`chip whitespace-nowrap ${filter === opt.value ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            {opt.label}
            {opt.value === 'monthly' && (
              <ChevronDown size={14} className={`transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            )}
          </button>
        ))}
        <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">
          {formatFilterRange(filter, selectedMonth)}
        </span>
      </div>

      {showMonthPicker && filter === 'monthly' && (
        <div className="absolute top-full left-0 right-0 mt-1 card p-2 z-30 animate-scaleIn">
          <div className="grid grid-cols-3 gap-1">
            {months.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onMonthSelect?.(idx + 1)
                  setShowMonthPicker(false)
                }}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition ${
                  selectedMonth === idx + 1
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
