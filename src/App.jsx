import { useState, useEffect, useCallback } from 'react'
import { Chrome as Home, TrendingUp, TrendingDown, Users, BarChart3, Settings } from 'lucide-react'
import { StoreProvider, useStore } from './lib/store'
import { HomePage } from './pages/HomePage'
import { RevenuePage } from './pages/RevenuePage'
import { ExpensesPage } from './pages/ExpensesPage'
import { ReportsPage } from './pages/ReportsPage'
import { CustomersPage } from './pages/CustomersPage'
import { SettingsPage } from './pages/SettingsPage'

const TABS = [
  { key: 'home', label: 'خانه', icon: Home },
  { key: 'revenue', label: 'درآمد', icon: TrendingUp },
  { key: 'expenses', label: 'هزینه', icon: TrendingDown },
  { key: 'customers', label: 'مشتریان', icon: Users },
  { key: 'reports', label: 'گزارش', icon: BarChart3 },
  { key: 'settings', label: 'تنظیمات', icon: Settings },
]

function AppContent() {
  const [tab, setTab] = useState('home')
  const [modalState, setModalState] = useState({ open: false, closer: null })
  const [subPage, setSubPage] = useState(null)

  // Register a modal open/close with the back handler
  const registerModal = useCallback((open, closer) => {
    setModalState({ open, closer })
  }, [])

  // Android back button support via Capacitor App plugin
  useEffect(() => {
    let listener

    async function setupBackButton() {
      try {
        const { App } = await import('@capacitor/app')
        listener = await App.addListener('backButton', () => {
          // Priority: modal > sub-page > main tab
          if (modalState.open && modalState.closer) {
            modalState.closer()
          } else if (subPage) {
            setSubPage(null)
          } else if (tab !== 'home') {
            setTab('home')
          } else {
            // On home tab with nothing open — let the app exit
            App.exitApp()
          }
        })
      } catch {
        // Not running in Capacitor (web dev) — no-op
      }
    }

    setupBackButton()

    return () => {
      if (listener) listener.remove()
    }
  }, [modalState, subPage, tab])

  const navigate = (t) => {
    setSubPage(null)
    setTab(t)
  }

  const renderPage = () => {
    switch (tab) {
      case 'home': return <HomePage onNavigate={navigate} />
      case 'revenue': return <RevenuePage />
      case 'expenses': return <ExpensesPage />
      case 'customers': return <CustomersPage />
      case 'reports': return <ReportsPage />
      case 'settings': return <SettingsPage />
      default: return <HomePage onNavigate={navigate} />
    }
  }

  return (
    <div className="min-h-screen pb-20" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-2xl mx-auto p-4">
        {renderPage()}
      </div>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition ${
                tab === key
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}
