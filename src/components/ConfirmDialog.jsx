import { TriangleAlert as AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmText = 'تایید', cancelText = 'انصراف', danger = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
            <AlertTriangle size={24} />
          </div>
          {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>}
          {message && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>}
          <div className="flex gap-2 w-full mt-2">
            <button onClick={onCancel} className="btn-ghost flex-1">{cancelText}</button>
            <button onClick={onConfirm} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
