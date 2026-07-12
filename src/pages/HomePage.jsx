import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, Users, Receipt, BarChart3 } from 'lucide-react'
import { useStore } from '../lib/store'
import { formatAmount, currencyLabel, todayJalali, isoToJalali, formatJalaliLong } from '../lib/jalali'

export function HomePage({ onNavigate }) {
  const { data, currency } = useStore()

  const totalRevenue = data.revenues.reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = data.expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalRevenue - totalExpense

  const today = todayJalali()

  const todayRevenues = data.revenues.filter((r) => {
    const j = isoToJalali(r.date)
    return j && j.jy === today.jy && j.jm === today.jm && j.jd === today.jd
  })
  const todayExpenses = data.expenses.filter((e) => {
    const j = isoToJalali(e.date)
    return j && j.jy === today.jy && j.jm === today.jm && j.jd === today.jd
  })

  return (
    <div className="space-y-4 animate-fade">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">داشبورد</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{formatJalaliLong(today)}</p>
      </div>

      <div className="card p-5 bg-gradient-to-l from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={20} />
          <span className="text-sm opacity-90">مانده کل</span>
        </div>
        <div className="text-3xl font-extrabold">
          {formatAmount(Math.abs(balance), currency)} {currencyLabel(currency)}
        </div>
        <div className="text-sm opacity-75 mt-1">{balance >= 0 ? 'سود' : 'زیان'}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate?.('revenue')} className="card p-4 text-right hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
            <TrendingUp size={20} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">درآمد کل</div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatAmount(totalRevenue, currency)}
          </div>
        </button>
        <button onClick={() => onNavigate?.('expenses')} className="card p-4 text-right hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 mb-2">
            <TrendingDown size={20} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">هزینه کل</div>
          <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {formatAmount(totalExpense, currency)}
          </div>
        </button>
        <button onClick={() => onNavigate?.('customers')} className="card p-4 text-right hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 mb-2">
            <Users size={20} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">مشتریان</div>
          <div className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
            {data.customers.length}
          </div>
        </button>
        <button onClick={() => onNavigate?.('reports')} className="card p-4 text-right hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
            <BarChart3 size={20} />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">گزارشات</div>
          <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
            مشاهده
          </div>
        </button>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">امروز</h3>
        <div className="space-y-2">
          {todayRevenues.length === 0 && todayExpenses.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">تراکنشی امروز ثبت نشده است</p>
          )}
          {todayRevenues.map((r) => (
            <div key={r.id} className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp size={14} />
              </div>
              <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">درآمد</span>
              <span className="font-medium text-emerald-600 whitespace-nowrap">
                +{formatAmount(r.amount, currency)}
              </span>
            </div>
          ))}
          {todayExpenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                <Receipt size={14} />
              </div>
              <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">
                {e.description || 'هزینه'}
              </span>
              <span className="font-medium text-rose-600 whitespace-nowrap">
                -{formatAmount(e.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
