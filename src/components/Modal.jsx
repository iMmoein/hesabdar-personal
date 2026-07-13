import { useEffect } from 'react'
import { X } from 'lucide-react'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    pushBackHandler(onClose)
    return () => popBackHandler()
  }, [open, onClose])

  if (!open) return null

  const sizeClass = size === 'lg' ? 'sm:max-w-2xl' : size === 'xl' ? 'sm:max-w-4xl' : 'sm:max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className={`flex flex-col w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] ${sizeClass} bg-white dark:bg-slate-800 sm:rounded-2xl shadow-card overflow-hidden animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur" style={{ paddingTop: 'calc(0.75rem + var(--safe-top))' }}>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-90">
            <X size={22} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          {children}
        </div>
        {footer && (
          <footer className="sticky bottom-0 px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur" style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
