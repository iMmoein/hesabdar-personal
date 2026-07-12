import { useEffect } from 'react'

// Generic confirmation dialog for edit/delete actions
export default function ConfirmActionDialog({ open, onConfirm, onCancel, title, message, confirmLabel = 'تایید', confirmClass = 'btn-primary' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCancel() }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-scaleIn">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1">انصراف</button>
          <button onClick={onConfirm} className={`${confirmClass} flex-1`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
