import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'

export default function SortButton({ sortDir, onChange }) {
  return (
    <button onClick={() => onChange(sortDir === 'desc' ? 'asc' : 'desc')} className="btn-ghost px-3 py-2" title={sortDir === 'desc' ? 'جدید به قدیم' : 'قدیم به جدید'}>
      {sortDir === 'desc' ? <ArrowDownAZ size={18} /> : <ArrowUpAZ size={18} />}
      <span className="text-sm">{sortDir === 'desc' ? 'جدید به قدیم' : 'قدیم به جدید'}</span>
    </button>
  )
}
