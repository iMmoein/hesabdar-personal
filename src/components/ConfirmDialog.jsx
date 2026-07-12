import { useEffect } from 'react'

// Dirty-state confirmation dialog (save/discard/cancel) for unsaved form changes
export default function ConfirmDialog({ open, onDiscard, onCancel, onSave }) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-scaleIn">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
          ذخیره تغییرات؟
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5 leading-relaxed">
          تغییراتی که انجام دادید ذخیره نشده. آیا می‌خواهید ذخیره کنید؟
        </p>
        <div className="space-y-2">
          <button onClick={onSave} className="btn-primary w-full">ذخیره</button>
          <button onClick={onDiscard} className="btn-danger w-full">ذخیره نکن</button>
          <button onClick={onCancel} className="btn-ghost w-full">انصراف</button>
        </div>
      </div>
    </div>
  )
}
