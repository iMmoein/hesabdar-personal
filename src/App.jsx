import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Receipt, ChartBar as BarChart3, Users, Settings as SettingsIcon } from 'lucide-react'
import { useStore } from './lib/store'
import { getTopBackHandler, clearBackStack, subscribeBackStack } from './lib/backButtonRegistry'
import RevenuePage from './pages/RevenuePage'
import ExpensesPage from './pages/ExpensesPage'
import ReportsPage from './pages/ReportsPage'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'

const TABS = [
  { id: 'revenue', label: 'درآمد', icon: TrendingUp, component: RevenuePage },
  { id: 'expenses', label: 'هزینه‌ها', icon: Receipt, component: ExpensesPage },
  { id: 'reports', label: 'گزارشات', icon: BarChart3, component: ReportsPage },
  { id: 'customers', label: 'مشتریان', icon: Users, component: CustomersPage },
  { id: 'settings', label: 'تنظیمات', icon: SettingsIcon, component: SettingsPage }
]

export default function App() {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('revenue')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const exitAppRef = useRef(null)
  const [, forceUpdate] = useState(0)

  // Subscribe to back stack changes so App re-renders when handlers push/pop
  useEffect(() => {
    return subscribeBackStack(() => forceUpdate((n) => n + 1))
  }, [])

  useEffect(() => {
    let listener
    let cancelled = false

    ;(async () => {
      try {
        const { App } = await import('@capacitor/app')
        if (cancelled) return
        exitAppRef.current = App
        listener = await App.addListener('backButton', () => {
          // Priority 1: sub-handler registered (date picker, modal, form, etc.)
          const topHandler = getTopBackHandler()
          if (topHandler) { topHandler(); return }

          // Priority 2: exit dialog already open → treat as "خیر"
          if (showExitConfirm) { setShowExitConfirm(false); return }

          // Priority 3: not on root tab → go to root
          if (activeTab !== 'revenue') { setActiveTab('revenue'); return }

          // Priority 4: root level → show exit confirmation
          setShowExitConfirm(true)
        })
      } catch { /* Not running in Capacitor */ }
    })()

    return () => {
      cancelled = true
      if (listener && typeof listener.remove === 'function') listener.remove()
      clearBackStack()
    }
  }, [activeTab, showExitConfirm])

  const handleExitConfirm = () => {
    setShowExitConfirm(false)
    if (exitAppRef.current) {
      exitAppRef.current.exitApp()
    }
  }

  const handleExitCancel = () => {
    setShowExitConfirm(false)
  }

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || RevenuePage

  return (
    <div className="app-bg min-h-[100dvh] flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <ActiveComponent store={store} />
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 z-40"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2.5 px-3 transition flex-1 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleExitCancel} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">خروج از برنامه</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5 leading-relaxed">آیا می‌خواهید از برنامه خارج شوید؟</p>
            <div className="flex gap-2">
              <button onClick={handleExitCancel} className="btn-ghost flex-1">خیر</button>
              <button onClick={handleExitConfirm} className="btn-danger flex-1">بله</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
