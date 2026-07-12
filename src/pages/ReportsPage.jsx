import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useStore } from '../lib/store'
import { FilterBar, formatFilterRange } from '../components/FilterBar'
import { JalaliDatePicker } from '../components/JalaliDatePicker'
import { formatAmount, isoToJalali, todayJalali, jalaliToISO, currencyLabel, toPersianDigits } from '../lib/jalali'

export function ReportsPage() {
  const { data, currency } = useStore()
  const [filter, setFilter] = useState('all')
  const [customStart, setCustomStart] = useState(null)
  const [customEnd, setCustomEnd] = useState(null)

  // Determine date range based on filter
  const dateRange = useMemo(() => {
    const today = todayJalali()
    if (filter === 'all') {
      return { start: null, end: null }
    }
    if (filter === 'monthly') {
      return {
        start: jalaliToISO({ jy: today.jy, jm: today.jm, jd: 1 }),
        end: jalaliToISO({ jy: today.jy, jm: today.jm, jd: 30 }),
      }
    }
    if (filter === 'yearly') {
      return {
        start: jalaliToISO({ jy: today.jy, jm: 1, jd: 1 }),
        end: jalaliToISO({ jy: today.jy, jm: 12, jd: 30 }),
      }
    }
    if (filter === 'custom') {
      return {
        start: customStart ? jalaliToISO(customStart) : null,
        end: customEnd ? jalaliToISO(customEnd) : null,
      }
    }
    return { start: null, end: null }
  }, [filter, customStart, customEnd])

  // Filter revenues and expenses by date range
  const filteredRevenues = useMemo(() => {
    return data.revenues.filter((r) => {
      if (filter === 'all') return true
      if (filter === 'custom') {
        if (dateRange.start && r.date < dateRange.start) return false
        if (dateRange.end && r.date > dateRange.end) return false
        return true
      }
      if (dateRange.start && r.date < dateRange.start) return false
      if (dateRange.end && r.date > dateRange.end) return false
      return true
    })
  }, [data.revenues, filter, dateRange])

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((e) => {
      if (filter === 'all') return true
      if (filter === 'custom') {
        if (dateRange.start && e.date < dateRange.start) return false
        if (dateRange.end && e.date > dateRange.end) return false
        return true
      }
      if (dateRange.start && e.date < dateRange.start) return false
      if (dateRange.end && e.date > dateRange.end) return false
      return true
    })
  }, [data.expenses, filter, dateRange])

  const totalRevenue = filteredRevenues.reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalRevenue - totalExpense

  // Build monthly chart data
  const chartData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
    const today = todayJalali()

    if (filter === 'monthly') {
      // Daily breakdown for current month
      const daysInMonth = 30
      const dayRev = new Array(daysInMonth).fill(0)
      const dayExp = new Array(daysInMonth).fill(0)
      filteredRevenues.forEach((r) => {
        const j = isoToJalali(r.date)
        if (j && j.jy === today.jy && j.jm === today.jm) {
          dayRev[j.jd - 1] += Number(r.amount)
        }
      })
      filteredExpenses.forEach((e) => {
        const j = isoToJalali(e.date)
        if (j && j.jy === today.jy && j.jm === today.jm) {
          dayExp[j.jd - 1] += Number(e.amount)
        }
      })
      // Group into 5-day buckets for readability
      const buckets = 6
      const revBuckets = new Array(buckets).fill(0)
      const expBuckets = new Array(buckets).fill(0)
      const labels = []
      for (let i = 0; i < buckets; i++) {
        const start = i * 5 + 1
        const end = Math.min(start + 4, daysInMonth)
        labels.push(`${toPersianDigits(start)}-${toPersianDigits(end)}`)
        for (let d = start - 1; d < end && d < daysInMonth; d++) {
          revBuckets[i] += dayRev[d]
          expBuckets[i] += dayExp[d]
        }
      }
      return { labels, revBuckets, expBuckets }
    }

    if (filter === 'custom' && dateRange.start && dateRange.end) {
      // Group by day for custom range
      const startJ = isoToJalali(dateRange.start)
      const endJ = isoToJalali(dateRange.end)
      const days = []
      const revByDay = {}
      const expByDay = {}
      filteredRevenues.forEach((r) => { revByDay[r.date] = (revByDay[r.date] || 0) + Number(r.amount) })
      filteredExpenses.forEach((e) => { expByDay[e.date] = (expByDay[e.date] || 0) + Number(e.amount) })
      // Simple: just list all unique dates in range
      const allDates = [...new Set([...filteredRevenues.map((r) => r.date), ...filteredExpenses.map((e) => e.date)])].sort()
      const labels = allDates.map((d) => {
        const j = isoToJalali(d)
        return j ? `${toPersianDigits(j.jm)}/${toPersianDigits(j.jd)}` : d
      })
      return {
        labels,
        revBuckets: allDates.map((d) => revByDay[d] || 0),
        expBuckets: allDates.map((d) => expByDay[d] || 0),
      }
    }

    // Default: monthly breakdown for current year
    const revByMonth = new Array(12).fill(0)
    const expByMonth = new Array(12).fill(0)
    filteredRevenues.forEach((r) => {
      const j = isoToJalali(r.date)
      if (j && j.jy === today.jy) revByMonth[j.jm - 1] += Number(r.amount)
    })
    filteredExpenses.forEach((e) => {
      const j = isoToJalali(e.date)
      if (j && j.jy === today.jy) expByMonth[j.jm - 1] += Number(e.amount)
    })
    return { labels: months, revBuckets: revByMonth, expBuckets: expByMonth }
  }, [filteredRevenues, filteredExpenses, filter, dateRange])

  const maxBar = Math.max(...chartData.revBuckets, ...chartData.expBuckets, 1)

  return (
    <div className="space-y-4 animate-fade">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">گزارشات</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">تحلیل مالی شما</p>
      </div>

      <FilterBar
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'همه' },
          { key: 'monthly', label: 'ماهیانه' },
          { key: 'yearly', label: 'سالانه' },
          { key: 'custom', label: 'بازه دلخواه' },
        ]}
      />

      {filter === 'custom' && (
        <div className="card p-4 space-y-3 animate-fade">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">از تاریخ</label>
              <JalaliDatePicker value={customStart} onChange={setCustomStart} />
            </div>
            <div>
              <label className="label">تا تاریخ</label>
              <JalaliDatePicker value={customEnd} onChange={setCustomEnd} />
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp size={18} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">درآمد</span>
          </div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatAmount(totalRevenue, currency)} {currencyLabel(currency)}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <TrendingDown size={18} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">هزینه</span>
          </div>
          <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {formatAmount(totalExpense, currency)} {currencyLabel(currency)}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
              <Wallet size={18} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">مانده</span>
          </div>
          <div className={`text-lg font-extrabold ${balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatAmount(balance, currency)} {currencyLabel(currency)}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            {filter === 'monthly' ? 'گزارش ماهیانه' : filter === 'custom' ? 'گزارش مقایسه ای' : 'گزارش سالیانه'}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-48 sm:h-64 overflow-x-auto no-scrollbar">
          {chartData.labels.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[30px]">
              <div className="flex items-end gap-0.5 w-full justify-center h-full">
                <div
                  className="w-3 sm:w-4 rounded-t bg-emerald-500/80 transition-all"
                  style={{ height: `${(chartData.revBuckets[i] / maxBar) * 100}%`, minHeight: chartData.revBuckets[i] > 0 ? '4px' : '0' }}
                  title={`${formatAmount(chartData.revBuckets[i], currency)} ${currencyLabel(currency)}`}
                />
                <div
                  className="w-3 sm:w-4 rounded-t bg-rose-500/80 transition-all"
                  style={{ height: `${(chartData.expBuckets[i] / maxBar) * 100}%`, minHeight: chartData.expBuckets[i] > 0 ? '4px' : '0' }}
                  title={`${formatAmount(chartData.expBuckets[i], currency)} ${currencyLabel(currency)}`}
                />
              </div>
              <span className="text-[10px] text-slate-400 text-center whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/80" />
            <span className="text-xs text-slate-500">درآمد</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/80" />
            <span className="text-xs text-slate-500">هزینه</span>
          </div>
        </div>
      </div>

      {filteredRevenues.length === 0 && filteredExpenses.length === 0 && (
        <div className="card p-10 text-center text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
          <p>داده ای برای نمایش گزارش وجود ندارد.</p>
        </div>
      )}
    </div>
  )
}
