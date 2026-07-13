import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'
import { filterByDate, formatAmount, getJalaliMonths, todayJalali } from '../lib/jalali'

const CHART_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#4f46e5', '#be123c', '#0369a1', '#9333ea', '#65a30d', '#c026d3']

export default function ReportsPage({ store }) {
  const { revenues, expenses, settings } = store
  const [filter, setFilter] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState(null)

  const filteredRev = useMemo(() => filterByDate(revenues, filter, 'date', selectedMonth), [revenues, filter, selectedMonth])
  const filteredExp = useMemo(() => filterByDate(expenses, filter, 'date', selectedMonth), [expenses, filter, selectedMonth])

  const totalRev = useMemo(() => filteredRev.reduce((s, r) => s + Number(r.amount || 0), 0), [filteredRev])
  const totalExp = useMemo(() => filteredExp.reduce((s, e) => s + Number(e.amount || 0), 0), [filteredExp])
  const balance = totalRev - totalExp

  const expenseByCategory = useMemo(() => {
    const cats = {}
    filteredExp.forEach((e) => {
      const key = e.category === 'bills' ? (e.billId || 'bills') : 'payment'
      cats[key] = (cats[key] || 0) + Number(e.amount || 0)
    })
    return Object.entries(cats).map(([name, value]) => ({ name: name === 'payment' ? 'پرداختی' : 'قبوض', value }))
  }, [filteredExp])

  const expenseByAccount = useMemo(() => {
    const accs = {}
    filteredExp.forEach((e) => {
      if (!e.accountId) return
      accs[e.accountId] = (accs[e.accountId] || 0) + Number(e.amount || 0)
    })
    return Object.entries(accs).map(([id, value]) => {
      const acc = store.accounts.find((a) => a.id === id)
      return { name: acc?.name || 'نامشخص', value }
    }).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [filteredExp, store.accounts])

  const monthlyData = useMemo(() => {
    const [ty] = todayJalali()
    const months = []
    for (let m = 1; m <= 12; m++) {
      const rev = revenues.filter((r) => { const [jy, jm] = r.date.split('/').map(Number); return jy === ty && jm === m }).reduce((s, r) => s + Number(r.amount || 0), 0)
      const exp = expenses.filter((e) => { const [jy, jm] = e.date.split('/').map(Number); return jy === ty && jm === m }).reduce((s, e) => s + Number(e.amount || 0), 0)
      months.push({ name: getJalaliMonths()[m - 1].slice(0, 3), درآمد: rev, هزینه: exp })
    }
    return months
  }, [revenues, expenses])

  const cur = settings.currency
  const fmt = (n) => formatAmount(n, cur)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">گزارش‌ها</h1>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400">درآمد</p>
          <p className="font-bold text-green-600 dark:text-green-400 amount-text">{fmt(totalRev)}</p>
        </div>
        <div className="card p-3 text-center">
          <TrendingDown size={20} className="mx-auto text-red-500 mb-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400">هزینه</p>
          <p className="font-bold text-red-600 dark:text-red-400 amount-text">{fmt(totalExp)}</p>
        </div>
        <div className="card p-3 text-center">
          <Wallet size={20} className="mx-auto text-brand-500 mb-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400">مانده</p>
          <p className={`font-bold amount-text ${balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-amber-600 dark:text-amber-400'}`}>{fmt(balance)}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[{ v: 'all', l: 'همه' }, { v: 'monthly', l: 'این ماه' }, { v: 'yearly', l: 'امسال' }].map((opt) => (
          <button key={opt.v} onClick={() => setFilter(opt.v)} className={`chip ${filter === opt.v ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {opt.l}
          </button>
        ))}
      </div>

      {monthlyData.some((d) => d.درآمد > 0 || d.هزینه > 0) && (
        <div className="card p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">نمودار ماهانه</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '0.75rem', fontSize: '0.75rem' }} />
              <Bar dataKey="درآمد" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="هزینه" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {expenseByCategory.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">هزینه بر اساس دسته</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '0.75rem', fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {expenseByCategory.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="flex-1 text-slate-600 dark:text-slate-300">{item.name}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100 amount-text">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {expenseByAccount.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">هزینه بر اساس حساب</h3>
          <div className="space-y-2">
            {expenseByAccount.map((item, i) => {
              const max = expenseByAccount[0].value
              const pct = max > 0 ? (item.value / max) * 100 : 0
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100 amount-text">{fmt(item.value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {filteredRev.length === 0 && filteredExp.length === 0 && (
        <div className="card p-8 text-center">
          <PieIcon size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">داده‌ای برای نمایش گزارش وجود ندارد</p>
        </div>
      )}
    </div>
  )
}
