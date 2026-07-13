import { ArrowDownWideNarrow } from 'lucide-react'

export default function SortBar({ sortBy, setSortBy, options }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowDownWideNarrow size={16} className="text-slate-400 shrink-0" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="input-field !py-1.5 !px-2 text-sm min-w-[8rem]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
