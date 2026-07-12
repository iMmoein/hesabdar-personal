import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Receipt, BarChart3, Users, Settings, House } from 'lucide-react'
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
  { id: 'settings', label: 'تنظیمات', icon: Settings, component: SettingsPage }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [modalOpen, setModalOpen] = useState(false)
  const [subPage, setSubPage] = useState(null)
  const exitTimer = useRef(null)

  // Android back button via @capacitor/app (dynamic import — no-op on web)
  useEffect(() => {
    let listener
    let cancelled = false

    ;(async () => {
      try {
        const { App } = await import('@capacitor/app')
        if (cancelled) return
        listener = await App.addListener('backButton', () => {
          if (modalOpen) {
            setModalOpen(false)
            return
          }
          if (subPage) {
            setSubPage(null)
            return
          }
          if (activeTab !== 'revenue') {
            setActiveTab('revenue')
            return
          }
          // On root tab — exit app
          App.exitApp()
        })
      } catch {
        // Not running in Capacitor — ignore
      }
    })()

    return () => {
      cancelled = true
      if (listener && typeof listener.remove === 'function') listener.remove()
    }
  }, [activeTab, modalOpen, subPage])

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || RevenuePage

  return (
    <div className="app-bg min-h-[100dvh] flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <ActiveComponent onSubPageChange={setSubPage} onModalChange={setModalOpen} />
      </div>

      {/* Bottom nav */}
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
                className={`flex flex-col items-center gap-1 py-2.5 px-3 transition flex-1 ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
