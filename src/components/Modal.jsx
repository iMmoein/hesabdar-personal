import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function Modal({ open, onClose, title, children, footer, size = 'md', dirty = false, onSave, onDiscard }) {
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  useEffect(() => { if (!open) setShowConfirm(false) }, [open])

  useEffect(() => {
    if (!open) return
    pushBackHandler(attemptClose)
    return () => popBackHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dirty, showConfirm])

  if (!open) return null

  const maxW = size === 'lg' ? 'sm:max-w-lg' : size === 'xl' ? 'sm:max-w-xl' : 'sm:max-w-md'

  function attemptClose() {
    if (showConfirm) { setShowConfirm(false); return }
    if (dirty) setShowConfirm(true)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm hidden sm:block" onClick={attemptClose} />
      <div className={`relative w-full ${maxW} sm:max-h-[90vh] h-[100dvh] sm:h-auto sm:rounded-2xl bg-white dark:bg-slate-800 shadow-card flex flex-col animate-fadeIn`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10" style={{ paddingTop: 'calc(0.75rem + var(--safe-top))' }}>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={attemptClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800" style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
            {typeof footer === 'function' ? footer({ attemptClose }) : footer}
          </div>
        )}
      </div>
      <ConfirmDialog open={showConfirm} onSave={() => { setShowConfirm(false); if (onSave) onSave(); else onClose() }} onDiscard={() => { setShowConfirm(false); if (onDiscard) onDiscard(); else onClose() }} onCancel={() => setShowConfirm(false)} />
    </div>
  )
}
