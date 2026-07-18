import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { FullScreenSheet, ConfirmDialog, Toast } from './FullScreenSheet'
import { MonthPickerSheet } from './MonthPickerSheet'
import { BankLogo } from './BankLogo'
import { db } from '../db/database'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'
import { getTodayJalali, getMonthRange, getYearRange, formatAmount, formatJalaliDate, toPersianDigits, JALALI_MONTHS } from '../utils/jalali'
import { Users, Plus, Trash2, Pencil, User, ChevronLeft, X, Wallet, Calendar, Clock, Tag, FileText } from 'lucide-react'

function matchesCustomerPayment(t, customer) {
  const linksToCustomer =
    (customer.id != null && t.customerId === customer.id) ||
    (t.customerName && customer.name && String(t.customerName).trim() === String(customer.name).trim())
  const isExpense = t.type === 'expense' || !t.type
  const isPayment =
    t.categoryType === 'payment' ||
    t.category === 'پرداختی' ||
    t.categoryType === 'پرداختی'
  return linksToCustomer && isExpense && isPayment
}

export function CustomersPage({ currency, isDark }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [detailCustomer, setDetailCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [toast, setToast] = useState(null)

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const list = await db.customers.toArray()
      const allTxs = await db.transactions.toArray()
      const withCounts = list.map((c) => {
        const count = allTxs.filter((t) => matchesCustomerPayment(t, c)).length
        return { ...c, transactionCount: count }
      })
      withCounts.sort((a, b) => {
        const countDiff = (b.transactionCount || 0) - (a.transactionCount || 0)
        if (countDiff !== 0) return countDiff
        return (a.name || '').localeCompare(b.name || '', 'fa')
      })
      setCustomers(withCounts)
    } catch (e) {
      console.error('Failed to load customers:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const normalized = name.replace(/\s+/g, ' ').trim()
      const existing = await db.customers.where('name').equals(normalized).first()
      if (existing) {
        setError('این نام مشتری قبلاً ثبت شده است')
        return
      }
      await db.customers.add({
        name: normalized,
        createdAt: Date.now(),
        transactionCount: 0,
      })
      setShowAdd(false)
      setNewName('')
      setError('')
      showToast('مشتری اضافه شد')
      loadCustomers()
    } catch (e) {
      console.error('Failed to add customer:', e)
      setError('افزودن مشتری ناموفق بود')
    }
  }

  const openEdit = (c) => {
    setEditTarget(c)
    setEditName(c.name)
    setEditError('')
  }

  const handleEdit = async () => {
    if (!editTarget) return
    const name = editName.trim().replace(/\s+/g, ' ')
    if (!name) {
      setEditError('نام مشتری نمی‌تواند خالی باشد')
      return
    }
    try {
      const all = await db.customers.toArray()
      const dup = all.find(
        (c) => c.id !== editTarget.id && c.name.replace(/\s+/g, ' ').trim().toLowerCase() === name.toLowerCase()
      )
      if (dup) {
        setEditError('این نام مشتری قبلاً ثبت شده است')
        return
      }
      await db.customers.update(editTarget.id, { name })
      setEditTarget(null)
      setEditName('')
      setEditError('')
      showToast('نام مشتری با موفقیت ویرایش شد')
      loadCustomers()
    } catch (e) {
      console.error('Failed to edit customer:', e)
      setEditError('ویرایش ناموفق بود')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const txs = await db.transactions.where('customerId').equals(deleteTarget.id).toArray()
      if (txs.length > 0) {
        showToast('این مشتری تراکنش دارد و قابل حذف نیست', 'error')
        setDeleteTarget(null)
        return
      }
      await db.customers.delete(deleteTarget.id)
      setDeleteTarget(null)
      showToast('مشتری حذف شد')
      loadCustomers()
    } catch (e) {
      console.error('Failed to delete customer:', e)
      showToast('حذف ناموفق بود', 'error')
    }
  }

  useEffect(() => {
    if (!editTarget) return
    const close = () => { setEditTarget(null); setEditName(''); setEditError('') }
    pushBackHandler(close)
    return () => popBackHandler()
  }, [editTarget])

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-glow">
                <Users className="w-5 h-5 text-white" />
              </div>
              مشتریان
            </h1>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium shadow-glow btn-press transition-all"
            >
              <Plus className="w-4 h-4" />
              افزودن مشتری
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">هیچ مشتری ثبت نشده است</p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium btn-press shadow-glow"
              >
                افزودن اولین مشتری
              </button>
            </div>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-card-dark border border-slate-100 dark:border-slate-700/50 card-press"
              >
                <button
                  onClick={() => setDetailCustomer(c)}
                  className="flex-1 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 tabular-nums font-medium">{toPersianDigits(c.transactionCount || 0)}</span>
                  <button
                    onClick={() => openEdit(c)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showAdd && (
          <ErrorBoundary>
            <FullScreenSheet
              title="افزودن مشتری"
              onClose={() => { setShowAdd(false); setNewName(''); setError('') }}
              footer={
                <>
                  <button
                    onClick={() => { setShowAdd(false); setNewName(''); setError('') }}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium btn-press transition-all"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium disabled:opacity-50 btn-press shadow-glow"
                  >
                    تایید
                  </button>
                </>
              }
            >
              <div className="p-4 space-y-3">
                {error && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">نام مشتری</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="نام مشتری را وارد کنید"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </FullScreenSheet>
          </ErrorBoundary>
        )}

        {detailCustomer && (
          <ErrorBoundary>
            <CustomerDetail
              customer={detailCustomer}
              currency={currency}
              isDark={isDark}
              onClose={() => setDetailCustomer(null)}
            />
          </ErrorBoundary>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="تایید حذف"
            message={`آیا از حذف "${deleteTarget.name}" مطمئن هستید؟`}
            confirmText="حذف"
            cancelText="انصراف"
            confirmColor="red"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {editTarget && (
          <ErrorBoundary>
            <FullScreenSheet
              title="ویرایش نام مشتری"
              onClose={() => { setEditTarget(null); setEditName(''); setEditError('') }}
              footer={
                <>
                  <button
                    onClick={() => { setEditTarget(null); setEditName(''); setEditError('') }}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium btn-press transition-all"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editName.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium disabled:opacity-50 btn-press shadow-glow"
                  >
                    تایید
                  </button>
                </>
              }
            >
              <div className="p-4 space-y-3">
                {editError && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">نام مشتری</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="نام مشتری را وارد کنید"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </FullScreenSheet>
          </ErrorBoundary>
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </ErrorBoundary>
  )
}

function CustomerDetail({ customer, currency, isDark, onClose }) {
  const [transactions, setTransactions] = useState([])
  const [totalExpense, setTotalExpense] = useState(0)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [accountsMap, setAccountsMap] = useState({})
  const [selectedYear, setSelectedYear] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)

  const today = useMemo(() => getTodayJalali(), [])

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true)
      const allTxs = await db.transactions.toArray()
      let filtered = allTxs.filter((t) => matchesCustomerPayment(t, customer))

      if (filter === 'monthly') {
        const range = getMonthRange(selectedYear, selectedMonth)
        filtered = filtered.filter((t) => t.dateKey >= range.startKey && t.dateKey <= range.endKey)
      } else if (filter === 'yearly') {
        const range = getYearRange(today.year)
        filtered = filtered.filter((t) => t.dateKey >= range.startKey && t.dateKey <= range.endKey)
      }

      filtered.sort((a, b) => (b.dateKey || 0) - (a.dateKey || 0))
      setTransactions(filtered)
      setTotalExpense(filtered.reduce((acc, t) => acc + (t.amount || 0), 0))

      const accountIds = [...new Set(filtered.map((t) => t.accountId).filter(Boolean))]
      if (accountIds.length > 0) {
        const accs = await db.accounts.bulkGet(accountIds)
        const map = {}
        accs.forEach((a) => { if (a) map[a.id] = a })
        setAccountsMap(map)
      }
    } catch (e) {
      console.error('Failed to load customer detail:', e)
    } finally {
      setLoading(false)
    }
  }, [customer.id, filter, today.year, selectedYear, selectedMonth])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  return (
    <FullScreenSheet
      title={customer.name}
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium btn-press transition-all"
        >
          بستن
        </button>
      }
    >
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 shadow-md">
            <div className="text-white/80 text-xs mb-1">تعداد تراکنش‌ها</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {toPersianDigits(transactions.length)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-md">
            <div className="text-white/80 text-xs mb-1">مجموع هزینه‌ها</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {formatAmount(totalExpense, currency)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'all', label: 'همه' },
            { key: 'monthly', label: filter === 'monthly' ? `ماهیانه: ${JALALI_MONTHS[selectedMonth - 1]} ${toPersianDigits(selectedYear)}` : 'ماهیانه' },
            { key: 'yearly', label: 'سالانه' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => f.key === 'monthly' ? setShowMonthPicker(true) : setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
                filter === f.key
                  ? 'bg-gradient-to-l from-brand-800 to-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">در حال بارگذاری...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <User className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm">تراکنشی یافت نشد</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="w-full text-right bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 space-y-2 border border-slate-100 dark:border-slate-700/50 hover:border-brand-400 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <BankLogo bankId={accountsMap[tx.accountId]?.bankId} name={accountsMap[tx.accountId]?.name} size={36} isDark={isDark} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {accountsMap[tx.accountId]?.name || 'نامشخص'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatJalaliDate(tx.dateJalali)}
                  {tx.time && ` • ${toPersianDigits(tx.time)}`}
                  {tx.category && ` • ${tx.category}`}
                </div>
                <div className="text-base font-bold text-red-500 dark:text-red-400 tabular-nums">
                  - {formatAmount(tx.amount, currency)}
                </div>
                {tx.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">{tx.description}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {showMonthPicker && (
        <MonthPickerSheet
          selectedYear={selectedYear || today.year}
          selectedMonth={selectedMonth || today.month}
          onConfirm={({ year, month }) => {
            setSelectedYear(year)
            setSelectedMonth(month)
            setFilter('monthly')
            setShowMonthPicker(false)
          }}
          onClose={() => setShowMonthPicker(false)}
        />
      )}

      {selectedTx && (
        <FullScreenSheet
          title="جزئیات تراکنش"
          onClose={() => setSelectedTx(null)}
          footer={
            <button
              onClick={() => setSelectedTx(null)}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium btn-press transition-all"
            >
              بستن
            </button>
          }
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 mx-auto shadow-glow-red">
              <Wallet className="w-10 h-10 text-white" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-card-dark border border-slate-100 dark:border-slate-700/50 divide-y divide-slate-100 dark:divide-slate-700/50">
              <DetailRow icon={<User className="w-4 h-4" />} label="نام مشتری" value={customer.name} isDark={isDark} />
              <DetailRow icon={<Wallet className="w-4 h-4" />} label="بانک" value={accountsMap[selectedTx.accountId]?.name || 'نامشخص'} isDark={isDark} />
              <DetailRow icon={<Tag className="w-4 h-4" />} label="مبلغ" value={formatAmount(selectedTx.amount, currency)} valueClass="text-red-500 dark:text-red-400 font-bold" isDark={isDark} />
              <DetailRow icon={<Calendar className="w-4 h-4" />} label="تاریخ" value={formatJalaliDate(selectedTx.dateJalali)} isDark={isDark} />
              <DetailRow icon={<Clock className="w-4 h-4" />} label="ساعت" value={toPersianDigits(selectedTx.time || '--:--')} isDark={isDark} />
              <DetailRow icon={<Tag className="w-4 h-4" />} label="دسته‌بندی" value={selectedTx.category || 'سایر'} isDark={isDark} />
              <DetailRow icon={<FileText className="w-4 h-4" />} label="توضیحات" value={selectedTx.description?.trim() ? selectedTx.description : 'توضیحاتی ثبت نشده'} isDark={isDark} />
            </div>
          </div>
        </FullScreenSheet>
      )}
    </FullScreenSheet>
  )
}

function DetailRow({ icon, label, value, valueClass = '', isDark }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{label}</div>
        <div className={`text-sm text-slate-900 dark:text-slate-100 ${valueClass}`}>{value}</div>
      </div>
    </div>
  )
}
