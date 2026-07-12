import { filterByDate, formatFilterRange } from '../lib/jalali'

const OPTIONS = [
  { value: 'all', label: 'همه' },
  { value: 'monthly', label: 'ماهیانه' },
  { value: 'yearly', label: 'سالانه' }
]

export default function FilterBar({ filter, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`chip whitespace-nowrap ${
            filter === opt.value
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">
        {formatFilterRange(filter)}
      </span>
    </div>
  )
}

export { filterByDate, formatFilterRange }
