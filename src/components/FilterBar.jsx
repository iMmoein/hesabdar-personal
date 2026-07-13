import { getJalaliMonths, todayJalali } from '../lib/jalali'

export default function FilterBar({ filter, setFilter, selectedMonth, setSelectedMonth }) {
  const months = getJalaliMonths()
  const [, tm] = todayJalali()
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-soft">
        {[
          { v: 'all', label: 'همه' },
          { v: 'monthly', label: 'این ماه' },
          { v: 'yearly', label: 'امسال' }
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFilter(opt.v)}
            className={`chip ${filter === opt.v ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {filter === 'monthly' && (
        <select
          value={selectedMonth ?? tm}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="input-field !py-1.5 !px-2 text-sm min-w-[7rem]"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
      )}
    </div>
  )
}
