import { AlertCircle } from 'lucide-react'

export default function UnsavedDialog({ open, onDiscard, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">تغییرات ذخیره نشده</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">آیا می‌خواهید بدون ذخیره تغییرات خارج شوید؟</p>
          <div className="flex gap-2 w-full mt-2">
            <button onClick={onCancel} className="btn-ghost flex-1">ادامه ویرایش</button>
            <button onClick={onDiscard} className="btn-danger flex-1">دور انداختن</button>
          </div>
        </div>
      </div>
    </div>
  )
}
