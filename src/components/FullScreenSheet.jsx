import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

export function FullScreenSheet({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col animate-slide-up">
      <div className="safe-top flex-shrink-0 border-b border-slate-200/60 dark:border-slate-700/60 glass">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all"
            aria-label="بستن"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <div className="w-10" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
      {footer && (
        <div className="safe-bottom flex-shrink-0 border-t border-slate-200/60 dark:border-slate-700/60 glass p-4 flex gap-3">
          {footer}
        </div>
      )}
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmText = 'تایید', cancelText = 'انصراف', onConfirm, onCancel, confirmColor = 'blue' }) {
  const gradients = {
    blue: 'from-brand-800 to-brand-600 shadow-glow',
    red: 'from-red-600 to-red-500 shadow-glow-red',
    green: 'from-emerald-600 to-emerald-500 shadow-glow-green',
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-elevated max-w-sm w-full p-6 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 text-center">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 btn-press transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl text-white text-sm font-medium bg-gradient-to-l ${gradients[confirmColor]} btn-press transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Toast({ message, type = 'success' }) {
  const styles = {
    success: { bg: 'from-emerald-600 to-emerald-500', icon: '✓' },
    error: { bg: 'from-red-600 to-red-500', icon: '✕' },
    info: { bg: 'from-brand-800 to-brand-600', icon: 'ℹ' },
  }
  const s = styles[type] || styles.success
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-slide-up">
      <div className={`bg-gradient-to-l ${s.bg} text-white text-sm px-5 py-3 rounded-2xl shadow-elevated flex items-center gap-2`}>
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{s.icon}</span>
        {message}
      </div>
    </div>
  )
}
