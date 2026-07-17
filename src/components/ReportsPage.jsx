import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { DatePickerSheet } from './DatePickerSheet'
import { db } from '../db/database'
import { getTodayJalali, jalaliToString, jalaliToKey, parseJalaliString, getMonthName, toPersianDigits, formatAmount, getDaysInJalaliMonth } from '../utils/jalali'
import { BarChart3, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

export function ReportsPage({ currency, isDark }) {
  const [reportType, setReportType] = useState('monthly')
  const [reportMode, setReportMode] = useState('revenue')
  const [startDate, setStartDate] = useState(() => {
    const t = getTodayJalali()
    return jalaliToString(t.year, t.month, 1)
  })
  const [endDate, setEndDate] = useState(() => {
    const t = getTodayJalali()
    return jalaliToString(t.year, t.month, getDaysInJalaliMonth(t.year, t.month))
  })
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateReport = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const startParsed = parseJalaliString(startDate)
      const endParsed = parseJalaliString(endDate)
      if (!startParsed || !endParsed) {
        setError('تاریخ‌های انتخابی نامعتبر هستند')
        setChartData([])
        return
      }

      const startKey = jalaliToKey(startDate)
      const endKey = jalaliToKey(endDate)
      if (startKey > endKey) {
        setError('تاریخ شروع باید قبل از تاریخ پایان باشد')
        setChartData([])
        return
      }

      const allTxs = await db.transactions.toArray()
      const inRange = allTxs.filter((t) => (t.dateKey || 0) >= startKey && (t.dateKey || 0) <= endKey)

      if (reportType === 'monthly') {
        const txType = reportMode === 'revenue' ? 'revenue' : 'expense'
        const filtered = inRange.filter((t) => t.type === txType)
        const monthMap = {}
        filtered.forEach((t) => {
          const key = t.dateJalali ? t.dateJalali.substring(0, 7) : ''
          if (!key) return
          if (!monthMap[key]) monthMap[key] = { label: '', amount: 0 }
          const parts = key.split('/')
          const y = parseInt(parts[0])
          const m = parseInt(parts[1])
          monthMap[key].label = `${getMonthName(m)} ${toPersianDigits(y)}`
          monthMap[key].amount += t.amount || 0
        })
        const sorted = Object.keys(monthMap).sort()
        setChartData(sorted.map((k) => monthMap[k]))
      } else {
        const revenueMap = {}
        const expenseMap = {}
        inRange.forEach((t) => {
          const key = t.dateJalali ? t.dateJalali.substring(0, 7) : ''
          if (!key) return
          const parts = key.split('/')
          const y = parseInt(parts[0])
          const m = parseInt(parts[1])
          const label = `${getMonthName(m)} ${toPersianDigits(y)}`
          if (t.type === 'revenue') {
            if (!revenueMap[key]) revenueMap[key] = { label, revenue: 0, expense: 0 }
            revenueMap[key].revenue += t.amount || 0
            if (!expenseMap[key]) expenseMap[key] = { label, revenue: 0, expense: 0 }
          } else {
            if (!expenseMap[key]) expenseMap[key] = { label, revenue: 0, expense: 0 }
            expenseMap[key].expense += t.amount || 0
            if (!revenueMap[key]) revenueMap[key] = { label, revenue: 0, expense: 0 }
          }
        })
        const allKeys = [...new Set([...Object.keys(revenueMap), ...Object.keys(expenseMap)])].sort()
        setChartData(allKeys.map((k) => ({
          label: (revenueMap[k]?.label || expenseMap[k]?.label || ''),
          درآمد: revenueMap[k]?.revenue || 0,
          هزینه: expenseMap[k]?.expense || 0,
        })))
      }
    } catch (e) {
      console.error('Report generation failed:', e)
      setError('خطا در تولید گزارش')
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [reportType, reportMode, startDate, endDate])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const formatTooltipValue = useCallback((value) => {
    return formatAmount(value, currency)
  }, [currency])

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            گزارشات
          </h1>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setReportType('monthly')}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all btn-press ${
                reportType === 'monthly'
                  ? 'bg-gradient-to-l from-brand-800 to-brand-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              گزارش ماهیانه
            </button>
            <button
              onClick={() => setReportType('compare')}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all btn-press ${
                reportType === 'compare'
                  ? 'bg-gradient-to-l from-brand-800 to-brand-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              گزارش مقایسه‌ای
            </button>
          </div>

          {reportType === 'monthly' && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setReportMode('revenue')}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all btn-press ${
                  reportMode === 'revenue'
                    ? 'bg-gradient-to-l from-emerald-600 to-emerald-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                درآمد
              </button>
              <button
                onClick={() => setReportMode('expense')}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all btn-press ${
                  reportMode === 'expense'
                    ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                هزینه
              </button>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowStartPicker(true)}
              className="flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 hover:border-brand-400 transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>از: {startDate}</span>
            </button>
            <button
              onClick={() => setShowEndPicker(true)}
              className="flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 hover:border-brand-400 transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>تا: {endDate}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-3">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="skeleton h-80 rounded-2xl mx-auto max-w-md" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 border border-slate-100 dark:border-slate-700/50">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fontFamily: 'Vazirmatn', fill: isDark ? '#94a3b8' : '#64748b' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: 'Vazirmatn', fill: isDark ? '#94a3b8' : '#64748b' }}
                    tickFormatter={(v) => toPersianDigits(v)}
                  />
                  <Tooltip
                    formatter={formatTooltipValue}
                    contentStyle={{
                      fontFamily: 'Vazirmatn',
                      fontSize: 12,
                      borderRadius: 16,
                      direction: 'rtl',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                    }}
                  />
                  {reportType === 'monthly' ? (
                    <Bar
                      dataKey="amount"
                      fill={reportMode === 'revenue' ? '#10b981' : '#ef4444'}
                      radius={[12, 12, 0, 0]}
                    />
                  ) : (
                    <>
                      <Legend />
                      <Bar dataKey="درآمد" fill="#10b981" radius={[12, 12, 0, 0]} />
                      <Bar dataKey="هزینه" fill="#ef4444" radius={[12, 12, 0, 0]} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {showStartPicker && (
          <DatePickerSheet
            initialDate={startDate}
            onConfirm={(d) => { setStartDate(d); setShowStartPicker(false) }}
            onClose={() => setShowStartPicker(false)}
          />
        )}
        {showEndPicker && (
          <DatePickerSheet
            initialDate={endDate}
            onConfirm={(d) => { setEndDate(d); setShowEndPicker(false) }}
            onClose={() => setShowEndPicker(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
