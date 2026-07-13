import { useState, useMemo } from 'react'
import { ChartBar as BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  formatAmount, formatJalaliLong, filterByDateRange,
  parseJalaliString, toPersianDigits, getJalaliMonths, getJalaliMonthRange, todayJalali
} from '../lib/jalali'
import JalaliDatePicker from '../components/JalaliDatePicker'

export default function ReportsPage({ store }) {
  const { revenues, expenses, settings } = store
  const currency = settings.currency

  const [reportType, setReportType] = useState('monthly') // 'monthly' | 'comparative'
  const [chartMode, setChartMode] = useState('revenue') // 'revenue' | 'expense'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const months = getJalaliMonths()
  const [currentYear] = todayJalali()

  // Default to current year range
  const effectiveStart = startDate || `${currentYear}/01/01`
  const effectiveEnd = endDate || `${currentYear}/12/30`

  const filteredRevenues = useMemo(() =>
    filterByDateRange(revenues, effectiveStart, effectiveEnd, 'date'),
    [revenues, effectiveStart, effectiveEnd]
  )

  const filteredExpenses = useMemo(() =>
    filterByDateRange(expenses, effectiveStart, effectiveEnd, 'date'),
    [expenses, effectiveStart, effectiveEnd]
  )

  // Group by Jalali month
  const monthlyData = useMemo(() => {
    const data = {}
    for (let m = 1; m <= 12; m++) {
      data[m] = { month: months[m - 1], revenue: 0, expense: 0 }
    }
    filteredRevenues.forEach((r) => {
      const [, jm] = parseJalaliString(r.date)
      if (jm >= 1 && jm <= 12) data[jm].revenue += Number(r.amount || 0)
    })
    filteredExpenses.forEach((e) => {
      const [, jm] = parseJalaliString(e.date)
      if (jm >= 1 && jm <= 12) data[jm].expense += Number(e.amount || 0)
    })
    return Object.values(data).filter((d) => d.revenue > 0 || d.expense > 0)
  }, [filteredRevenues, filteredExpenses, months])

  const totalRevenue = filteredRevenues.reduce((s, r) => s + Number(r.amount || 0), 0)
  const totalExpense = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)

  const formatTooltipValue = (val) => {
    const v = currency === 'toman' ? Math.round(val / 10) : val
    return toPersianDigits(v.toLocaleString('en-US'))
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">گزارشات</h1>

      {/* Report type selector */}
      <div className="card p-3 mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('monthly')}
            className={`chip flex-1 justify-center ${reportType === 'monthly' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            گزارش ماهیانه
          </button>
          <button
            onClick={() => setReportType('comparative')}
            className={`chip flex-1 justify-center ${reportType === 'comparative' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            گزارش مقایسه‌ای
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="card p-3 mb-3">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">از تاریخ</label>
            <JalaliDatePicker value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">تا تاریخ</label>
            <JalaliDatePicker value={endDate} onChange={setEndDate} />
          </div>
        </div>
      </div>

      {/* Monthly report mode selector */}
      {reportType === 'monthly' && (
        <div className="card p-3 mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setChartMode('revenue')}
              className={`chip flex-1 justify-center ${chartMode === 'revenue' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              درآمد
            </button>
            <button
              onClick={() => setChartMode('expense')}
              className={`chip flex-1 justify-center ${chartMode === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              هزینه
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="card p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">مجموع درآمد</p>
          <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5 tabular-nums">{formatAmount(totalRevenue, currency)}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">مجموع هزینه</p>
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">{formatAmount(totalExpense, currency)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4 mb-4">
        {monthlyData.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
            <p>داده‌ای برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} />
              <YAxis tickFormatter={(v) => toPersianDigits(Math.round(v / 1000000)) + 'M'} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val) => formatTooltipValue(val)} labelStyle={{ fontFamily: 'Vazirmatn' }} />
              {reportType === 'comparative' && <Legend />}
              {reportType === 'monthly' && chartMode === 'revenue' && (
                <Bar dataKey="revenue" fill="#2563eb" name="درآمد" radius={[4, 4, 0, 0]} />
              )}
              {reportType === 'monthly' && chartMode === 'expense' && (
                <Bar dataKey="expense" fill="#dc2626" name="هزینه" radius={[4, 4, 0, 0]} />
              )}
              {reportType === 'comparative' && (
                <>
                  <Bar dataKey="revenue" fill="#2563eb" name="درآمد" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#dc2626" name="هزینه" radius={[4, 4, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
