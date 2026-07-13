import { useState, useRef, useMemo } from 'react'
import { Settings as SettingsIcon, Sun, Moon, DollarSign, Database, Download, Upload, ChartBar as BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatAmount, toPersianDigits } from '../lib/jalali'

export default function SettingsPage({ store }) {
  const { revenues, expenses, settings, updateSettings, exportBackup, importBackup } = store
  const currency = settings.currency
  const fileInputRef = useRef(null)
  const [importStatus, setImportStatus] = useState(null)

  const totalRevenue = revenues.reduce((s, r) => s + Number(r.amount || 0), 0)
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netResult = totalRevenue - totalExpense

  const handleExport = () => {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hesabdar-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const success = importBackup(ev.target.result)
      setImportStatus(success ? 'بازگردانی با موفقیت انجام شد' : 'خطا در بازگردانی')
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">تنظیمات</h1>

      {/* Creator */}
      <div className="card p-3 mb-3 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">سازنده</p>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">غیب اللهی</p>
      </div>

      {/* Currency */}
      <div className="card p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">واحد پول</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ currency: 'rial' })}
            className={`chip flex-1 justify-center ${currency === 'rial' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            ریال
          </button>
          <button
            onClick={() => updateSettings({ currency: 'toman' })}
            className={`chip flex-1 justify-center ${currency === 'toman' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            تومان
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="card p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          {settings.theme === 'dark' ? <Moon size={18} className="text-slate-400" /> : <Sun size={18} className="text-slate-400" />}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">پوسته</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`chip flex-1 justify-center ${settings.theme === 'light' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Sun size={16} />
            حالت روز
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`chip flex-1 justify-center ${settings.theme === 'dark' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Moon size={16} />
            حالت شب
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="card p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">آمار</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">آمار درآمد</span>
            <span className="font-bold text-brand-600 dark:text-brand-400 tabular-nums">{formatAmount(totalRevenue, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">آمار هزینه</span>
            <span className="font-bold text-red-600 dark:text-red-400 tabular-nums">{formatAmount(totalExpense, currency)}</span>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">خالص سود و زیان</span>
              {netResult > 0 ? (
                <span className="font-bold text-green-600 tabular-nums">
                  سود: {formatAmount(netResult, currency)}
                </span>
              ) : netResult < 0 ? (
                <span className="font-bold text-red-600 tabular-nums">
                  زیان: {formatAmount(Math.abs(netResult), currency)}
                </span>
              ) : (
                <span className="font-bold text-slate-500 tabular-nums">
                  سر به سر: {formatAmount(0, currency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="card p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">پشتیبان‌گیری</span>
        </div>
        <div className="space-y-2">
          <button onClick={handleExport} className="btn-ghost w-full flex items-center justify-center gap-2">
            <Download size={18} />
            نسخه پشتیبان
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-ghost w-full flex items-center justify-center gap-2">
            <Upload size={18} />
            بازگردانی نسخه پشتیبان
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          {importStatus && (
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">{importStatus}</p>
          )}
        </div>
      </div>
    </div>
  )
}
