import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Users, Settings } from 'lucide-react'
import { useStore } from './lib/store'
import { getTopBackHandler } from './lib/backButtonRegistry'
import { App as CapacitorApp } from '@capacitor/app'
import RevenuePage from './pages/RevenuePage'
import ExpensesPage from './pages/ExpensesPage'
import ReportsPage from './pages/ReportsPage'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'

const TABS = [
  { id: 'revenues', label: 'درآمد', icon: TrendingUp },
  { id: 'expenses', label: 'هزینه', icon: TrendingDown },
  { id: 'reports', label: 'گزارش', icon: BarChart3 },
  { id: 'customers', label: 'اشخاص', icon: Users },
  { id: 'settings', label: 'تنظیمات', icon: Settings }
]

export default function App() {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('revenues')

  useEffect(() => {
    const handleBack = () => {
      const top = getTopBackHandler()
      if (top) { top(); return }
      if (activeTab !== 'revenues') { setActiveTab('revenues'); return }
      CapacitorApp.exitApp()
    }
    let listener
    CapacitorApp.addListener('backButton', handleBack).then((l) => { listener = l })
    return () => { if (listener) listener.remove() }
  }, [activeTab])

  const renderPage = () => {
    switch (activeTab) {
      case 'revenues': return <RevenuePage store={store} />
      case 'expenses': return <ExpensesPage store={store} />
      case 'reports': return <ReportsPage store={store} />
      case 'customers': return <CustomersPage store={store} />
      case 'settings': return <SettingsPage store={store} />
      default: return null
    }
  }

  return (
    <div className="app-bg min-h-[100dvh] flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24 max-w-2xl mx-auto w-full">
        {renderPage()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-slate-100 dark:border-slate-700" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition active:scale-90 ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[0.65rem] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
