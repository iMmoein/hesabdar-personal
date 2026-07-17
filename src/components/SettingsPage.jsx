import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { ConfirmDialog, Toast } from './FullScreenSheet'
import { db, getBackupData, validateBackup, restoreBackup, getStats, getSetting, setSetting } from '../db/database'
import { formatAmount, toPersianDigits, getTodayJalali, jalaliToString } from '../utils/jalali'
import { Settings as SettingsIcon, Database, BarChart3, Download, Upload, Sun, Moon, Coins, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function SettingsPage({ currency, setCurrency, isDark, setIsDark, onDataChanged }) {
  const [stats, setStats] = useState({ totalRevenue: 0, totalExpense: 0, netProfit: 0 })
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [pendingRestoreData, setPendingRestoreData] = useState(null)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const loadStats = useCallback(async () => {
    try {
      const s = await getStats()
      setStats(s)
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleCurrencyToggle = async () => {
    const newCurrency = currency === 'rial' ? 'toman' : 'rial'
    setCurrency(newCurrency)
    await setSetting('currency', newCurrency)
  }

  const handleThemeToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(newTheme === 'dark')
    await setSetting('theme', newTheme)
  }

  const handleBackup = async () => {
    try {
      const data = await getBackupData()
      const json = JSON.stringify(data, null, 2)
      const today = getTodayJalali()
      const filename = `hesabdar-backup-${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}.json`

      const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform
      if (isCapacitor) {
        try {
          const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
          await Filesystem.writeFile({
            path: filename,
            data: json,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          })
          showToast('فایل نسخه پشتیبان آماده شد. آن را در پوشه دانلودها یا محل دلخواه ذخیره کنید.')
        } catch (fsErr) {
          console.error('Filesystem failed, trying share:', fsErr)
          try {
            const { Share } = await import('@capacitor/share')
            const base64 = btoa(unescape(encodeURIComponent(json)))
            await Share.share({
              title: 'نسخه پشتیبان حسابدار',
              text: filename,
              url: `data:application/json;base64,${base64}`,
            })
            showToast('فایل نسخه پشتیبان آماده شد. آن را در پوشه دانلودها یا محل دلخواه ذخیره کنید.')
          } catch (shareErr) {
            console.error('Share also failed:', shareErr)
            downloadBlob(json, filename)
            showToast('فایل نسخه پشتیبان دانلود شد')
          }
        }
      } else {
        downloadBlob(json, filename)
        showToast('فایل نسخه پشتیبان دانلود شد')
      }
    } catch (e) {
      console.error('Backup failed:', e)
      showToast('خطا در تهیه نسخه پشتیبان', 'error')
    }
  }

  const handleRestoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!validateBackup(data)) {
        showToast('فایل نسخه پشتیبان نامعتبر است', 'error')
        return
      }
      setPendingRestoreData(data)
      setShowRestoreConfirm(true)
    } catch (err) {
      console.error('Failed to read backup file:', err)
      showToast('خطا در خواندن فایل', 'error')
    }
    e.target.value = ''
  }

  const handleRestoreConfirm = async () => {
    try {
      await restoreBackup(pendingRestoreData)
      setShowRestoreConfirm(false)
      setPendingRestoreData(null)
      showToast('نسخه پشتیبان با موفقیت بازگردانی شد')
      loadStats()
      if (onDataChanged) onDataChanged()
    } catch (e) {
      console.error('Restore failed:', e)
      showToast('خطا در بازگردانی', 'error')
    }
  }

  const isProfit = stats.netProfit > 0
  const isLoss = stats.netProfit < 0

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-md">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            تنظیمات
          </h1>

          <div className="bg-gradient-to-br from-brand-700 to-brand-500 rounded-3xl p-5 mb-4 text-center shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="relative">
              <p className="text-white/70 text-sm">سازنده</p>
              <p className="text-xl font-bold text-white mt-1">غیب اللهی</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-4">
          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 border border-slate-100 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-600" />
              واحد پول
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {currency === 'rial' ? 'ریال' : 'تومان'}
              </span>
              <button
                onClick={handleCurrencyToggle}
                className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-600 transition-all"
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                    currency === 'rial' ? 'right-0.5' : 'right-7'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 border border-slate-100 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              حالت نمایش
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {isDark ? 'شب' : 'روز'}
              </span>
              <button
                onClick={handleThemeToggle}
                className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-600 transition-all"
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                    !isDark ? 'right-0.5' : 'right-7'
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 border border-slate-100 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              پایگاه داده
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium shadow-glow btn-press transition-all"
              >
                <Download className="w-4 h-4" />
                نسخه پشتیبان
              </button>
              <button
                onClick={handleRestoreClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 btn-press transition-all"
              >
                <Upload className="w-4 h-4" />
                بازگردانی نسخه پشتیبان
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                برای انتقال داده‌ها به گوشی دیگر، ابتدا نسخه پشتیبان تهیه کنید و سپس در گوشی جدید آن را بازگردانی نمایید.
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 border border-slate-100 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              آمار
            </h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-xs mb-1">آمار درآمد</div>
                    <div className="text-lg font-bold text-white tabular-nums">
                      {formatAmount(stats.totalRevenue, currency)}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/30" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-xs mb-1">آمار هزینه</div>
                    <div className="text-lg font-bold text-white tabular-nums">
                      {formatAmount(stats.totalExpense, currency)}
                    </div>
                  </div>
                  <TrendingDown className="w-8 h-8 text-white/30" />
                </div>
              </div>

              {isProfit && (
                <div className="bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl p-4 shadow-glow-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-xs mb-1">خالص سود و زیان</div>
                      <div className="text-lg font-bold text-white tabular-nums">
                        سود: {formatAmount(stats.netProfit, currency)}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-white/30" />
                  </div>
                </div>
              )}

              {isLoss && (
                <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-4 shadow-glow-red">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-xs mb-1">خالص سود و زیان</div>
                      <div className="text-lg font-bold text-white tabular-nums">
                        زیان: {formatAmount(Math.abs(stats.netProfit), currency)}
                      </div>
                    </div>
                    <TrendingDown className="w-8 h-8 text-white/30" />
                  </div>
                </div>
              )}

              {!isProfit && !isLoss && (
                <div className="bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-xs mb-1">خالص سود و زیان</div>
                      <div className="text-lg font-bold text-white tabular-nums">
                        سر به سر: {formatAmount(0, currency)}
                      </div>
                    </div>
                    <Minus className="w-8 h-8 text-white/30" />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {showRestoreConfirm && (
          <ConfirmDialog
            title="بازگردانی نسخه پشتیبان"
            message="آیا مطمئن هستید؟ تمام داده‌های فعلی با داده‌های فایل پشتیبان جایگزین خواهند شد."
            confirmText="بازگردانی"
            cancelText="انصراف"
            confirmColor="blue"
            onConfirm={handleRestoreConfirm}
            onCancel={() => { setShowRestoreConfirm(false); setPendingRestoreData(null) }}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </ErrorBoundary>
  )
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
