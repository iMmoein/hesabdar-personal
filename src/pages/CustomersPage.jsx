import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, ChevronLeft, ArrowRight } from 'lucide-react'
import {
  formatAmount, formatJalaliWithWeekday, formatJalaliLong,
  filterByDate, toPersianDigits, currentTimeString
} from '../lib/jalali'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import UnsavedDialog from '../components/UnsavedDialog'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function CustomersPage({ store }) {
  const {
    customers, expenses, revenues, allBanks,
    addCustomer, updateCustomer, deleteCustomer, settings
  } = store
  const currency = settings.currency

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDirty, setFormDirty] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editConfirm, setEditConfirm] = useState(false)
  const [duplicateError, setDuplicateError] = useState('')

  // Customer detail
  const [detailCustomerId, setDetailCustomerId] = useState(null)
  const [detailFilter, setDetailFilter] = useState('all')
  const [detailSelectedMonth, setDetailSelectedMonth] = useState(null)
  const [detailTransaction, setDetailTransaction] = useState(null)

  const [initialName, setInitialName] = useState('')

  const resetForm = () => {
    setFormName('')
    setFormDirty(false)
    setDuplicateError('')
    setEditingId(null)
  }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (customer) => {
    setFormName(customer.name || '')
    setFormDirty(false)
    setEditingId(customer.id)
    setShowForm(true)
    setDuplicateError('')
  }

  useEffect(() => {
    if (showForm) setInitialName(formName)
  }, [showForm])

  useEffect(() => {
    if (showForm) {
      setFormDirty(formName !== initialName)
    }
  }, [formName, showForm, initialName])

  // Back button for form
  useEffect(() => {
    if (!showForm) return
    pushBackHandler(() => {
      if (formDirty) setShowUnsaved(true)
      else setShowForm(false)
    })
    return () => popBackHandler()
  }, [showForm, formDirty])

  // Back button for customer detail
  useEffect(() => {
    if (!detailCustomerId) return
    pushBackHandler(() => setDetailCustomerId(null))
    return () => popBackHandler()
  }, [detailCustomerId])

  // Back button for transaction detail
  useEffect(() => {
    if (!detailTransaction) return
    pushBackHandler(() => setDetailTransaction(null))
    return () => popBackHandler()
  }, [detailTransaction])

  const normalizeName = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ')

  const handleSave = () => {
    const name = formName.trim()
    if (!name) return

    // Duplicate check
    const isDuplicate = customers.some((c) =>
      c.id !== editingId && normalizeName(c.name) === normalizeName(name)
    )
    if (isDuplicate) {
      setDuplicateError('این نام مشتری قبلاً ثبت شده است')
      return
    }

    if (editingId) {
      updateCustomer(editingId, name)
    } else {
      addCustomer(name)
    }
    setShowForm(false)
    resetForm()
  }

  const handleEditConfirmSave = () => {
    setEditConfirm(false)
    handleSave()
  }

  const handleFormClose = () => {
    if (formDirty) setShowUnsaved(true)
    else setShowForm(false)
  }

  const handleUnsavedSave = () => {
    setShowUnsaved(false)
    if (editingId) setEditConfirm(true)
    else handleSave()
  }

  const handleUnsavedDiscard = () => {
    setShowUnsaved(false)
    setShowForm(false)
    resetForm()
  }

  // Sort customers by transaction count descending
  const sortedCustomers = useMemo(() => {
    const counts = {}
    expenses.forEach((e) => {
      if (e.customerId) counts[e.customerId] = (counts[e.customerId] || 0) + 1
    })
    return [...customers].sort((a, b) => {
      const ca = counts[a.id] || 0
      const cb = counts[b.id] || 0
      if (ca !== cb) return cb - ca
      return a.name.localeCompare(b.name, 'fa')
    })
  }, [customers, expenses])

  // Customer detail transactions
  const detailCustomer = customers.find((c) => c.id === detailCustomerId)
  const detailTransactions = useMemo(() => {
    if (!detailCustomerId) return []
    const items = expenses.filter((e) => e.customerId === detailCustomerId)
    return filterByDate(items, detailFilter, 'date', detailSelectedMonth)
  }, [detailCustomerId, expenses, detailFilter, detailSelectedMonth])

  const detailTotalExpense = useMemo(() => {
    if (!detailCustomerId) return 0
    return expenses
      .filter((e) => e.customerId === detailCustomerId)
      .reduce((s, e) => s + Number(e.amount || 0), 0)
  }, [detailCustomerId, expenses])

  const detailTransactionCount = useMemo(() => {
    if (!detailCustomerId) return 0
    return expenses.filter((e) => e.customerId === detailCustomerId).length
  }, [detailCustomerId, expenses])

  // Transaction counts for customer list
  const transactionCounts = useMemo(() => {
    const counts = {}
    expenses.forEach((e) => {
      if (e.customerId) counts[e.customerId] = (counts[e.customerId] || 0) + 1
    })
    return counts
  }, [expenses])

  // If customer detail is open, render detail page
  if (detailCustomerId && detailCustomer) {
    return (
      <div className="px-4 py-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setDetailCustomerId(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <ArrowRight size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{detailCustomer.name}</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="card p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">تعداد تراکنش‌ها</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5 tabular-nums">{toPersianDigits(detailTransactionCount)}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">مجموع هزینه‌ها</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">{formatAmount(detailTotalExpense, currency)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-3">
          <FilterBar filter={detailFilter} setFilter={setDetailFilter} selectedMonth={detailSelectedMonth} setSelectedMonth={setDetailSelectedMonth} />
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {detailTransactions.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <p>تراکنشی یافت نشد</p>
            </div>
          ) : (
            detailTransactions.map((item) => {
              const bank = allBanks.find((b) => b.id === item.sourceBankId) || { id: item.sourceBankId, name: item.sourceBankName, svg: null }
              return (
                <button
                  key={item.id}
                  onClick={() => setDetailTransaction(item)}
                  className="card p-3 w-full text-right"
                >
                  <div className="flex items-start gap-3">
                    <BankLogo bank={bank} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 break-words leading-tight">
                            {item.billName || item.customerName || 'هزینه'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 no-wrap">{formatJalaliWithWeekday(item.date)}</p>
                        </div>
                        <p className="amount-text font-bold text-red-600 dark:text-red-400 shrink-0">
                          {formatAmount(item.amount, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Transaction Detail Modal */}
        <Modal open={!!detailTransaction} onClose={() => setDetailTransaction(null)} title="جزئیات تراکنش" size="sm">
          {detailTransaction && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">مبلغ</span>
                <span className="font-bold text-red-600 tabular-nums">{formatAmount(detailTransaction.amount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حساب</span>
                <span className="text-slate-800 dark:text-slate-100">{detailTransaction.sourceBankName || detailTransaction.customBankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاریخ</span>
                <span className="text-slate-800 dark:text-slate-100 no-wrap">{formatJalaliWithWeekday(detailTransaction.date)}</span>
              </div>
              {detailTransaction.time && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ساعت</span>
                  <span className="text-slate-800 dark:text-slate-100 tabular-nums">{toPersianDigits(detailTransaction.time)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">دسته</span>
                <span className="text-slate-800 dark:text-slate-100">{detailTransaction.category === 'payment' ? 'پرداختی' : 'قبوض'}</span>
              </div>
              {detailTransaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">مشتری</span>
                  <span className="text-slate-800 dark:text-slate-100">{detailTransaction.customerName}</span>
                </div>
              )}
              {detailTransaction.billName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">قبض</span>
                  <span className="text-slate-800 dark:text-slate-100">{detailTransaction.billName}</span>
                </div>
              )}
              {detailTransaction.description && (
                <div className="flex justify-between">
                  <span className="text-slate-500">توضیحات</span>
                  <span className="text-slate-800 dark:text-slate-100">{detailTransaction.description}</span>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    )
  }

  // Main customer list
  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">مشتریان</h1>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={18} />
          افزودن مشتری
        </button>
      </div>

      <div className="space-y-2">
        {sortedCustomers.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 dark:text-slate-500">
            <Users size={40} className="mx-auto mb-2 opacity-50" />
            <p>هنوز مشتری ثبت نشده است</p>
          </div>
        ) : (
          sortedCustomers.map((c) => (
            <div key={c.id} className="card p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDetailCustomerId(c.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-right"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 break-words leading-tight flex-1 min-w-0">
                    {c.name}
                  </span>
                  <span className="text-sm text-slate-400 tabular-nums shrink-0">
                    {toPersianDigits(transactionCounts[c.id] || 0)}
                  </span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditForm(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form */}
      <Modal
        open={showForm}
        onClose={handleFormClose}
        title={editingId ? 'ویرایش مشتری' : 'افزودن مشتری'}
        footer={
          <div className="flex gap-2">
            <button onClick={handleFormClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={editingId ? () => setEditConfirm(true) : handleSave} className="btn-primary flex-1">تایید</button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">نام</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => { setFormName(e.target.value); setDuplicateError('') }}
            placeholder="نام مشتری"
            className="input-field"
            autoFocus
          />
          {duplicateError && (
            <p className="text-sm text-red-500 mt-2">{duplicateError}</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="حذف"
        message="آیا از حذف این مورد اطمینان دارید؟"
        confirmText="تایید"
        cancelText="انصراف"
        danger
        onConfirm={() => { deleteCustomer(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Edit Confirmation */}
      <ConfirmDialog
        open={editConfirm}
        title="ویرایش"
        message="آیا از ویرایش این مورد اطمینان دارید؟"
        confirmText="تایید"
        cancelText="انصراف"
        onConfirm={handleEditConfirmSave}
        onCancel={() => setEditConfirm(false)}
      />

      {/* Unsaved Changes */}
      <UnsavedDialog
        open={showUnsaved}
        onSave={handleUnsavedSave}
        onDiscard={handleUnsavedDiscard}
        onCancel={() => setShowUnsaved(false)}
      />
    </div>
  )
}
