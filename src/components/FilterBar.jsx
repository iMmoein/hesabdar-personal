import { formatFilterRange } from '../lib/jalali'

export function FilterBar({ value, onChange, options }) {
  const opts = options || [
    { key: 'all', label: 'همه' },
    { key: 'monthly', label: 'ماهیانه' },
    { key: 'yearly', label: 'سالانه' },
  ]
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
      {opts.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`chip whitespace-nowrap ${
            value === opt.key
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export { filterByDate, formatFilterRange } from '../lib/jalali'
