// FilterBar: همه / ماهیانه / سالانه filters
// When ماهیانه is selected, shows 12 Jalali month buttons

import { getJalaliMonths, toPersianDigits, todayJalali } from '../lib/jalali'

export default function FilterBar({ filter, setFilter, selectedMonth, setSelectedMonth }) {
  const months = getJalaliMonths()
  const [, currentMonth] = todayJalali()

  const filters = [
    { id: 'all', label: 'همه' },
    { id: 'monthly', label: 'ماهیانه' },
    { id: 'yearly', label: 'سالانه' }
  ]

  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id)
              if (f.id !== 'monthly') setSelectedMonth(null)
            }}
            className={`chip flex-1 justify-center ${
              filter === f.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filter === 'monthly' && (
        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          {months.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedMonth(idx + 1)}
              className={`chip text-xs ${
                selectedMonth === idx + 1
                  ? 'bg-brand-600 text-white'
                  : (idx + 1) === currentMonth
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
