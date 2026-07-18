import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { TransactionList } from './TransactionList'
import { ExpenseForm } from './ExpenseForm'
import { ConfirmDialog, Toast } from './FullScreenSheet'
import { db, updateUsageCounts } from '../db/database'
import { getTodayJalali, jalaliToKey, getMonthRange, getYearRange, formatAmount, JALALI_MONTHS, toPersianDigits } from '../utils/jalali'
import { MonthPickerSheet } from './MonthPickerSheet'
import { TrendingDown, Plus, ChevronLeft } from 'lucide-react'

export function ExpensePage({ currency, isDark }) {
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedYear, setSelectedYear] = useState(today.year)
  const [selectedMonth, setSelectedMonth] = useState(today.month)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const today = useMemo(() => getTodayJalali(), [])

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const allExpense = await db.transactions.where('type').equals('expense').toArray()
      let filtered = allExpense

      if (filter === 'monthly') {
        const range = getMonthRange(selectedYear, selectedMonth)
        filtered = allExpense.filter((t) => t.dateKey >= range.startKey && t.dateKey <= range.endKey)
      } else if (filter === 'yearly') {
        const range = getYearRange(today.year)
        filtered = allExpense.filter((t) => t.dateKey >= range.startKey && t.dateKey <= range.endKey)
      }

      filtered.sort((a, b) => {
        if (sortBy === 'date') return (b.dateKey || 0) - (a.dateKey || 0)
        if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0)
        return 0
      })

      setTransactions(filtered)
      setTotal(filtered.reduce((acc, t) => acc + (t.amount || 0), 0))
    } catch (e) {
      console.error('Failed to load expenses:', e)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [filter, sortBy, today.year, today.month, selectedYear, selectedMonth])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleConfirm = async (data) => {
    try {
      if (editData) {
        await db.transactions.update(editData.id, {
          amount: data.amount,
          categoryType: data.categoryType,
          category: data.category,
          accountId: data.accountId,
          dateJalali: data.dateJalali,
          dateKey: jalaliToKey(data.dateJalali),
          description: data.description,
          customerId: data.customerId,
          customerName: data.customerName,
          bill: data.bill,
        })
        showToast('هزینه ویرایش شد')
      } else {
        await db.transactions.add({
          type: 'expense',
          amount: data.amount,
          categoryType: data.categoryType,
          category: data.category,
          accountId: data.accountId,
          dateJalali: data.dateJalali,
          dateKey: jalaliToKey(data.dateJalali),
          createdAt: Date.now(),
          description: data.description,
          customerId: data.customerId,
          customerName: data.customerName,
          bill: data.bill,
          time: data.time,
        })
        showToast('هزینه ثبت شد')
      }
      await updateUsageCounts()
      setShowForm(false)
      setEditData(null)
      loadTransactions()
    } catch (e) {
      console.error('Failed to save expense:', e)
      showToast('ذخیره ناموفق بود', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await db.transactions.delete(deleteTarget.id)
      await updateUsageCounts()
      setDeleteTarget(null)
      showToast('هزینه حذف شد')
      loadTransactions()
    } catch (e) {
      console.error('Failed to delete:', e)
      showToast('حذف ناموفق بود', 'error')
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-glow-red">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              هزینه‌ها
            </h1>
            <button
              onClick={() => { setEditData(null); setShowForm(true) }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-medium shadow-glow-red btn-press transition-all"
            >
              <Plus className="w-4 h-4" />
              ثبت هزینه جدید
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            {[
              { key: 'all', label: 'همه' },
              { key: 'monthly', label: filter === 'monthly' ? `ماهیانه: ${JALALI_MONTHS[selectedMonth - 1]} ${toPersianDigits(selectedYear)}` : 'ماهیانه' },
              { key: 'yearly', label: 'سالانه' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => f.key === 'monthly' ? setShowMonthPicker(true) : setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press flex items-center gap-1 ${
                  filter === f.key
                    ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
                {f.key === 'monthly' && <ChevronLeft className="w-3.5 h-3.5 opacity-70" />}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-5 mb-3 shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />
            <div className="relative">
              <div className="text-white/80 text-sm mb-1">مجموع هزینه‌ها</div>
              <div className="text-3xl font-bold text-white tabular-nums">
                {formatAmount(total, currency)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 self-center">مرتب‌سازی:</span>
            {[
              { key: 'date', label: 'تاریخ' },
              { key: 'amount', label: 'مبلغ' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all btn-press ${
                  sortBy === s.key
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              currency={currency}
              isDark={isDark}
              onEdit={(tx) => { setEditData(tx); setShowForm(true) }}
              onDelete={(tx) => setDeleteTarget(tx)}
            />
          )}
        </div>

        {showForm && (
          <ErrorBoundary>
            <ExpenseForm
              editData={editData}
              onConfirm={handleConfirm}
              onClose={() => { setShowForm(false); setEditData(null) }}
              isDark={isDark}
            />
          </ErrorBoundary>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="تایید حذف"
            message="آیا از حذف این تراکنش مطمئن هستید؟"
            confirmText="حذف"
            cancelText="انصراف"
            confirmColor="red"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {showMonthPicker && (
          <MonthPickerSheet
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onConfirm={({ year, month }) => {
              setSelectedYear(year)
              setSelectedMonth(month)
              setFilter('monthly')
              setShowMonthPicker(false)
            }}
            onClose={() => setShowMonthPicker(false)}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </ErrorBoundary>
  )
}
