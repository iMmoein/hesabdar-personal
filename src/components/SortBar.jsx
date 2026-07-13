import { ArrowDown, ArrowUp } from 'lucide-react'

const FIELDS = [
  { id: 'date', label: 'تاریخ' },
  { id: 'bank', label: 'بانک' },
  { id: 'amount', label: 'مبلغ' }
]

// SortBar: 3-button sort control with active highlight and direction arrow
// Default: date descending (newest first)
export default function SortBar({ sortField, sortDir, onChange }) {
  const handleFieldClick = (fieldId) => {
    if (sortField === fieldId) {
      // Toggle direction
      onChange(fieldId, sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      // Default direction per field
      const defaultDir = fieldId === 'bank' ? 'asc' : 'desc'
      onChange(fieldId, defaultDir)
    }
  }

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">مرتب‌سازی بر اساس:</span>
        <div className="flex items-center gap-1.5">
          {FIELDS.map((f) => {
            const active = sortField === f.id
            return (
              <button
                key={f.id}
                onClick={() => handleFieldClick(f.id)}
                className={`chip ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                {f.label}
                {active && (
                  sortDir === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
