import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BottomNav } from './components/BottomNav'
import { RevenuePage } from './components/RevenuePage'
import { ExpensePage } from './components/ExpensePage'
import { ReportsPage } from './components/ReportsPage'
import { CustomersPage } from './components/CustomersPage'
import { SettingsPage } from './components/SettingsPage'
import { ConfirmDialog } from './components/FullScreenSheet'
import { initDatabase, getSetting, setSetting } from './db/database'

export default function App() {
  const [activeTab, setActiveTab] = useState('revenue')
  const [currency, setCurrency] = useState('rial')
  const [isDark, setIsDark] = useState(false)
  const [ready, setReady] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const overlayRef = useRef(null)

  const setOverlay = useCallback((type, data = null) => {
    overlayRef.current = { type, data }
  }, [])

  const closeOverlay = useCallback(() => {
    overlayRef.current = null
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await initDatabase()
        const savedCurrency = await getSetting('currency')
        const savedTheme = await getSetting('theme')
        if (savedCurrency) setCurrency(savedCurrency)
        if (savedTheme === 'dark') setIsDark(true)
      } catch (e) {
        console.error('App init failed:', e)
      } finally {
        setReady(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a')
    } else {
      document.documentElement.classList.remove('dark')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff')
    }
  }, [isDark])

  useEffect(() => {
    let backHandler
    const setupBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app')
        backHandler = App.addListener('backButton', () => {
          const overlay = overlayRef.current
          if (overlay) {
            closeOverlay()
            return
          }
          if (showExitDialog) {
            setShowExitDialog(false)
            return
          }
          if (activeTab !== 'revenue') {
            setActiveTab('revenue')
            return
          }
          setShowExitDialog(true)
        })
      } catch (e) {
        console.log('Capacitor App not available (web mode):', e)
      }
    }
    setupBackButton()
    return () => {
      if (backHandler && backHandler.remove) backHandler.remove()
    }
  }, [activeTab, showExitDialog, closeOverlay])

  const handleExitApp = useCallback(async () => {
    try {
      const { App } = await import('@capacitor/app')
      App.exitApp()
    } catch {
      window.close()
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center mx-auto mb-4 shadow-glow animate-spring">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="text-slate-400 text-sm">در حال بارگذاری...</div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'revenue' && <RevenuePage currency={currency} isDark={isDark} />}
          {activeTab === 'expenses' && <ExpensePage currency={currency} isDark={isDark} />}
          {activeTab === 'reports' && <ReportsPage currency={currency} isDark={isDark} />}
          {activeTab === 'customers' && <CustomersPage currency={currency} isDark={isDark} />}
          {activeTab === 'settings' && (
            <SettingsPage
              currency={currency}
              setCurrency={setCurrency}
              isDark={isDark}
              setIsDark={setIsDark}
              onDataChanged={() => {}}
            />
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {showExitDialog && (
          <ConfirmDialog
            title="خروج از برنامه"
            message="آیا می‌خواهید از برنامه خارج شوید؟"
            confirmText="بله"
            cancelText="خیر"
            confirmColor="red"
            onConfirm={handleExitApp}
            onCancel={() => setShowExitDialog(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
