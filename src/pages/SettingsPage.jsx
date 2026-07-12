import { useRef, useState } from 'react'
import { Moon, Sun, Download, Upload, Trash2, Coins, BarChart3, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatAmount, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'

export default function SettingsPage() {
  const { theme, toggleTheme, currency, toggleCurrency, revenues, expenses, customers, accounts, exportData, importData, resetData } = useStore()
  const fileRef = useRef(null)
  const [showReset, setShowReset] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  const totalRev = revenues.reduce((s, r) => s + Number(r.amount || 0), 0)
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const ok = importData(ev.target.result)
      setImportMsg(ok ? 'بازیابی با موفقیت انجام شد' : 'خطا در بازیابی فایل')
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">تنظیمات</h1>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <Coins size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">واحد پول</p>
              <p className="text-xs text-slate-400">ریال یا تومان</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => currency !== 'rial' && toggleCurrency()}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currency === 'rial' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-soft' : 'text-slate-500'}`}
            >
              ریال
            </button>
            <button
              onClick={() => currency !== 'toman' && toggleCurrency()}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currency === 'toman' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-soft' : 'text-slate-500'}`}
            >
              تومان
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
              {theme === 'dark' ? <Moon size={20} className="text-amber-500" /> : <Sun size={20} className="text-amber-500" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">حالت نمایش</p>
              <p className="text-xs text-slate-400">{theme === 'dark' ? 'تاریک' : 'روشن'}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="btn-ghost">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            تغییر حالت
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40">
            <BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">آمار کلی</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={TrendingUp} label="درآمد کل" value={formatAmount(totalRev, currency)} color="green" />
          <StatCard icon={TrendingDown} label="هزینه کل" value={formatAmount(totalExp, currency)} color="red" />
          <StatCard icon={Users} label="مشتریان" value={toPersianDigits(customers.length)} color="blue" />
          <StatCard icon={BarChart3} label="حساب‌ها" value={toPersianDigits(accounts.length)} color="purple" />
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <p className="font-semibold text-slate-800 dark:text-slate-100">پشتیبان‌گیری</p>
        <button onClick={exportData} className="btn-primary w-full">
          <Download size={18} /> خروجی JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-ghost w-full">
          <Upload size={18} /> بازیابی از فایل
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        {importMsg && <p className="text-sm text-center text-brand-600 dark:text-brand-400">{importMsg}</p>}
      </div>

      <div className="card p-4">
        <button onClick={() => setShowReset(true)} className="btn-danger w-full">
          <Trash2 size={18} /> پاک کردن همه داده‌ها
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 pt-2">حسابدار شخصی — نسخه ۱.۰.۰</p>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="تایید پاک کردن" footer={
        <div className="flex gap-2">
          <button onClick={() => setShowReset(false)} className="btn-ghost flex-1">انصراف</button>
          <button onClick={() => { resetData(); setShowReset(false) }} className="btn-danger flex-1">پاک کردن</button>
        </div>
      }>
        <p className="text-slate-600 dark:text-slate-300">آیا مطمئن هستید؟ همه داده‌ها (درآمدها، هزینه‌ها، مشتریان، حساب‌ها) پاک خواهند شد. این عمل قابل بازگشت نیست.</p>
      </Modal>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  }
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <Icon size={18} className="mb-1" />
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-bold text-sm mt-0.5">{value}</p>
    </div>
  )
}
