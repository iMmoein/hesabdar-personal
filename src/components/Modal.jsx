import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  const maxWidth = size === 'full' ? 'max-w-lg' : size === 'sm' ? 'max-w-sm' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-card max-h-[92dvh] flex flex-col animate-slideUp`}>
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 shrink-0" style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
