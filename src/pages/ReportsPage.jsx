import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useStore } from '../lib/store'
import { formatAmount, isoToJalali, toPersianDigits, getMonthName, filterByDateRange } from '../lib/jalali'
import JalaliDatePicker from '../components/JalaliDatePicker'

export default function ReportsPage() {
  const { revenues, expenses, currency } = useStore()
  const [reportType, setReportType] = useState('monthly')
  const [subType, setSubType] = useState('revenue')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const chartData = useMemo(() => {
    if (reportType === 'monthly') {
      const items = subType === 'revenue' ? revenues : expenses
      const filtered = filterByDateRange(items, startDate, endDate)

      const byMonth = {}
      filtered.forEach((item) => {
        if (!item.date) return
        const [jy, jm] = isoToJalali(item.date)
        const key = `${jy}-${jm}`
        if (!byMonth[key]) byMonth[key] = { label: `${getMonthName(jm)} ${toPersianDigits(jy)}`, amount: 0, count: 0 }
        byMonth[key].amount += Number(item.amount || 0)
        byMonth[key].count += 1
      })

      return Object.values(byMonth).map((d) => ({
        name: d.label,
        amount: currency === 'toman' ? Math.round(d.amount / 10) : d.amount,
        count: d.count
      }))
    } else {
      const revFiltered = filterByDateRange(revenues, startDate, endDate)
      const expFiltered = filterByDateRange(expenses, startDate, endDate)

      const byMonth = {}
      revFiltered.forEach((r) => {
        if (!r.date) return
        const [jy, jm] = isoToJalali(r.date)
        const key = `${jy}-${jm}`
        if (!byMonth[key]) byMonth[key] = { name: `${getMonthName(jm)} ${toPersianDigits(jy)}`, درآمد: 0, هزینه: 0 }
        byMonth[key].درآمد += Number(r.amount || 0)
      })
      expFiltered.forEach((e) => {
        if (!e.date) return
        const [jy, jm] = isoToJalali(e.date)
        const key = `${jy}-${jm}`
        if (!byMonth[key]) byMonth[key] = { name: `${getMonthName(jm)} ${toPersianDigits(jy)}`, درآمد: 0, هزینه: 0 }
        byMonth[key].هزینه += Number(e.amount || 0)
      })

      return Object.values(byMonth).map((d) => ({
        name: d.name,
        درآمد: currency === 'toman' ? Math.round(d.درآمد / 10) : d.درآمد,
        هزینه: currency === 'toman' ? Math.round(d.هزینه / 10) : d.هزینه
      }))
    }
  }, [revenues, expenses, reportType, subType, startDate, endDate, currency])

  const totalRev = filterByDateRange(revenues, startDate, endDate).reduce((s, r) => s + Number(r.amount || 0), 0)
  const totalExp = filterByDateRange(expenses, startDate, endDate).reduce((s, e) => s + Number(e.amount || 0), 0)

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">گزارشات</h1>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setReportType('monthly')}
          className={`btn ${reportType === 'monthly' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          گزارش ماهیانه
        </button>
        <button
          onClick={() => setReportType('comparative')}
          className={`btn ${reportType === 'comparative' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
        >
          گزارش مقایسه‌ای ماهیانه
        </button>
      </div>

      {reportType === 'monthly' && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSubType('revenue')}
            className={`chip justify-center py-2.5 ${subType === 'revenue' ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            درآمد
          </button>
          <button
            onClick={() => setSubType('expense')}
            className={`chip justify-center py-2.5 ${subType === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            هزینه
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">از تاریخ</label>
          <JalaliDatePicker value={startDate} onChange={setStartDate} />
        </div>
        <div>
          <label className="label">تا تاریخ</label>
          <JalaliDatePicker value={endDate} onChange={setEndDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 bg-green-50 dark:bg-green-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400">مجموع درآمد</p>
          <p className="font-bold text-green-600 dark:text-green-400 text-sm mt-1">{formatAmount(totalRev, currency)}</p>
        </div>
        <div className="card p-3 bg-red-50 dark:bg-red-900/20">
          <p className="text-xs text-slate-500 dark:text-slate-400">مجموع هزینه</p>
          <p className="font-bold text-red-600 dark:text-red-400 text-sm mt-1">{formatAmount(totalExp, currency)}</p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
          {reportType === 'monthly'
            ? `نمودار ${subType === 'revenue' ? 'درآمد' : 'هزینه'} ماهیانه`
            : 'نمودار مقایسه‌ای درآمد و هزینه'}
        </h3>
        {chartData.length === 0 ? (
          <p className="text-center text-slate-400 py-8">داده‌ای برای نمایش وجود ندارد</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Vazirmatn' }} />
              <YAxis tick={{ fontSize: 10 }} width={60} tickFormatter={(v) => toPersianDigits(v)} />
              <Tooltip
                formatter={(v) => formatAmount(v, currency)}
                labelStyle={{ fontFamily: 'Vazirmatn' }}
                contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '12px', fontSize: '13px' }}
              />
              {reportType === 'comparative' && <Legend />}
              {reportType === 'monthly' ? (
                <Bar dataKey="amount" fill={subType === 'revenue' ? '#16a34a' : '#dc2626'} radius={[8, 8, 0, 0]} />
              ) : (
                <>
                  <Bar dataKey="درآمد" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="هزینه" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
