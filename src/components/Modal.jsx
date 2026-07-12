import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const maxW = size === 'lg' ? 'sm:max-w-2xl' : size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4"
      style={{
        paddingTop: 'max(0px, env(safe-area-inset-top))',
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0px, env(safe-area-inset-left))',
        paddingRight: 'max(0px, env(safe-area-inset-right))',
      }}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade hidden sm:block"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxW} card flex flex-col animate-fade overflow-hidden
          fixed inset-0 sm:static sm:inset-auto sm:rounded-2xl sm:max-h-[90vh] h-full sm:h-auto`}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800/95 sm:rounded-t-2xl"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="px-5 py-4 overflow-y-auto flex-1 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end shrink-0 bg-white dark:bg-slate-800/95 sm:rounded-b-2xl"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
