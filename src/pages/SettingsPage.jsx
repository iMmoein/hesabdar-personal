import { useState, useRef } from 'react'
import { Moon, Sun, Download, Upload, Trash2, Wallet, Database } from 'lucide-react'
import { useStore } from '../lib/store'
import { currencyLabel } from '../lib/jalali'

export function SettingsPage() {
  const { theme, toggleTheme, currency, setCurrencyMode, exportData, importData, resetData, data } = useStore()
  const fileRef = useRef(null)
  const [showReset, setShowReset] = useState(false)

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
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
      try {
        importData(ev.target.result)
        alert('بازیابی با موفقیت انجام شد')
      } catch {
        alert('فایل نامعتبر است')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4 animate-fade">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">تنظیمات</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">پیکربندی برنامه</p>
      </div>

      {/* Currency selector */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">واحد پول</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">واحد نمایش مبالغ در کل برنامه</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrencyMode('rial')}
            className={`flex-1 chip ${currency === 'rial' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'}`}
          >
            ریال
          </button>
          <button
            onClick={() => setCurrencyMode('toman')}
            className={`flex-1 chip ${currency === 'toman' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'}`}
          >
            تومان
          </button>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">حالت نمایش</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? 'تاریک' : 'روشن'}</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative w-14 h-8 rounded-full transition shrink-0 ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${theme === 'dark' ? 'right-1' : 'right-7'}`}
          />
        </button>
      </div>

      {/* Backup & Restore */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Database size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">پشتیبان گیری</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">ذخیره و بازیابی اطلاعات</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handleExport} className="btn-ghost flex-1">
            <Download size={18} /> خروجی JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost flex-1">
            <Upload size={18} /> بازیابی
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Statistics */}
      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">آمار</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="حساب ها" value={data.accounts.length} />
          <StatBox label="درآمدها" value={data.revenues.length} />
          <StatBox label="هزینه ها" value={data.expenses.length} />
          <StatBox label="مشتریان" value={data.customers.length} />
        </div>
      </div>

      {/* Reset */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">حذف همه داده ها</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">بازنشانی کامل برنامه</p>
          </div>
        </div>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} className="btn-danger w-full">
            <Trash2 size={18} /> حذف همه
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setShowReset(false)} className="btn-ghost flex-1">انصراف</button>
            <button
              onClick={() => { resetData(); setShowReset(false) }}
              className="btn-danger flex-1"
            >
              تایید حذف
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 text-center">
      <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
