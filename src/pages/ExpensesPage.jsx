import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Receipt, Wallet, Clock, Tag, FileText, User } from 'lucide-react'
import {
  formatAmount, formatJalaliWithWeekday, formatJalaliLong, todayJalaliString,
  filterByDate, toPersianDigits, currentTimeString
} from '../lib/jalali'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import UnsavedDialog from '../components/UnsavedDialog'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import SortBar from '../components/SortBar'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'
import { EXPENSE_CATEGORIES, DEFAULT_BILLS } from '../lib/banks'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function ExpensesPage({ store }) {
  const {
    expenses, allBanks, allBills, customers, customBills,
    addExpense, updateExpense, deleteExpense,
    addCustomBill, deleteCustomBill, addCustomBank, settings
  } = store
  const currency = settings.currency

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [deleteId, setDeleteId] = useState(null)
  const [editConfirm, setEditConfirm] = useState(false)

  // Form state
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('payment')
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formBillId, setFormBillId] = useState('')
  const [formBillName, setFormBillName] = useState('')
  const [formSourceBankId, setFormSourceBankId] = useState('')
  const [formSourceBankName, setFormSourceBankName] = useState('')
  const [formCustomBankName, setFormCustomBankName] = useState('')
  const [formDate, setFormDate] = useState(todayJalaliString())
  const [formTime, setFormTime] = useState(currentTimeString())
  const [formDescription, setFormDescription] = useState('')
  const [formDirty, setFormDirty] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)

  // Sub-modals
  const [showBankSelect, setShowBankSelect] = useState(false)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showBillSelect, setShowBillSelect] = useState(false)
  const [showCustomBillInput, setShowCustomBillInput] = useState(false)
  const [customBillNameInput, setCustomBillNameInput] = useState('')
  const [showCustomBankInput, setShowCustomBankInput] = useState(false)
  const [customBankNameInput, setCustomBankNameInput] = useState('')
  const [billDeleteId, setBillDeleteId] = useState(null)

  const [initialFormState, setInitialFormState] = useState({})

  const resetForm = () => {
    setFormAmount('')
    setFormCategory('payment')
    setFormCustomerId('')
    setFormCustomerName('')
    setFormBillId('')
    setFormBillName('')
    setFormSourceBankId('')
    setFormSourceBankName('')
    setFormCustomBankName('')
    setFormDate(todayJalaliString())
    setFormTime(currentTimeString())
    setFormDescription('')
    setFormDirty(false)
    setShowBankSelect(false)
    setShowCustomerSelect(false)
    setShowBillSelect(false)
    setShowCustomBillInput(false)
    setShowCustomBankInput(false)
    setCustomBillNameInput('')
    setCustomBankNameInput('')
  }

  const openAddForm = () => {
    resetForm()
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setFormAmount(item.amount || '')
    setFormCategory(item.category || 'payment')
    setFormCustomerId(item.customerId || '')
    setFormCustomerName(item.customerName || '')
    setFormBillId(item.billId || '')
    setFormBillName(item.billName || '')
    setFormSourceBankId(item.sourceBankId || '')
    setFormSourceBankName(item.sourceBankName || '')
    setFormCustomBankName(item.customBankName || '')
    setFormDate(item.date || todayJalaliString())
    setFormTime(item.time || currentTimeString())
    setFormDescription(item.description || '')
    setFormDirty(false)
    setEditingId(item.id)
    setShowForm(true)
  }

  // Track dirty
  useEffect(() => {
    if (!showForm) return
    const current = {
      amount: formAmount, category: formCategory, customerId: formCustomerId,
      billId: formBillId, sourceBankId: formSourceBankId, customBankName: formCustomBankName,
      date: formDate, time: formTime, description: formDescription
    }
    const isDirty = Object.keys(current).some((k) => current[k] !== initialFormState[k])
    setFormDirty(isDirty)
  }, [formAmount, formCategory, formCustomerId, formBillId, formSourceBankId, formCustomBankName, formDate, formTime, formDescription, showForm, initialFormState])

  useEffect(() => {
    if (showForm) {
      setInitialFormState({
        amount: formAmount, category: formCategory, customerId: formCustomerId,
        billId: formBillId, sourceBankId: formSourceBankId, customBankName: formCustomBankName,
        date: formDate, time: formTime, description: formDescription
      })
    }
  }, [showForm])

  // Back button for form
  useEffect(() => {
    if (!showForm) return
    pushBackHandler(() => {
      if (formDirty) {
        setShowUnsaved(true)
      } else {
        setShowForm(false)
      }
    })
    return () => popBackHandler()
  }, [showForm, formDirty])

  // Back button for sub-modals
  useEffect(() => {
    if (!showBankSelect && !showCustomerSelect && !showBillSelect && !showCustomBillInput && !showCustomBankInput) return
    pushBackHandler(() => {
      if (showCustomBankInput) { setShowCustomBankInput(false); return }
      if (showCustomBillInput) { setShowCustomBillInput(false); return }
      if (showBillSelect) { setShowBillSelect(false); return }
      if (showCustomerSelect) { setShowCustomerSelect(false); return }
      if (showBankSelect) { setShowBankSelect(false); return }
    })
    return () => popBackHandler()
  }, [showBankSelect, showCustomerSelect, showBillSelect, showCustomBillInput, showCustomBankInput])

  const handleSave = () => {
    if (!formAmount || Number(formAmount) <= 0) return
    if (!formSourceBankId) return
    if (formCategory === 'payment' && !formCustomerId) return
    if (formCategory === 'bills' && !formBillId) return

    const bank = allBanks.find((b) => b.id === formSourceBankId)
    const customer = customers.find((c) => c.id === formCustomerId)
    const bill = allBills.find((b) => b.id === formBillId)

    const data = {
      amount: Number(formAmount),
      category: formCategory,
      customerId: formCategory === 'payment' ? formCustomerId : '',
      customerName: formCategory === 'payment' ? (customer?.name || formCustomerName) : '',
      billId: formCategory === 'bills' ? formBillId : '',
      billName: formCategory === 'bills' ? (bill?.name || formBillName) : '',
      sourceBankId: formSourceBankId,
      sourceBankName: bank?.name || formCustomBankName || '',
      customBankName: formSourceBankId === 'other' ? formCustomBankName : '',
      date: formDate,
      time: formTime,
      description: formDescription || ''
    }

    if (editingId) {
      updateExpense(editingId, data)
    } else {
      addExpense(data)
    }
    setShowForm(false)
    resetForm()
  }

  const handleEditConfirmSave = () => {
    setEditConfirm(false)
    handleSave()
  }

  const handleFormClose = () => {
    if (formDirty) {
      setShowUnsaved(true)
    } else {
      setShowForm(false)
    }
  }

  const handleUnsavedSave = () => {
    setShowUnsaved(false)
    if (editingId) {
      setEditConfirm(true)
    } else {
      handleSave()
    }
  }

  const handleUnsavedDiscard = () => {
    setShowUnsaved(false)
    setShowForm(false)
    resetForm()
  }

  const handleAddCustomBill = () => {
    const name = customBillNameInput.trim()
    if (!name) return
    // Check duplicate
    const exists = allBills.some((b) => b.name === name)
    if (exists) {
      alert('این قبض قبلاً وجود دارد')
      return
    }
    const id = addCustomBill(name)
    setFormBillId(id)
    setFormBillName(name)
    setShowCustomBillInput(false)
    setCustomBillNameInput('')
    setShowBillSelect(false)
  }

  const handleAddCustomBank = () => {
    const name = customBankNameInput.trim()
    if (!name) return
    const id = addCustomBank(name)
    setFormSourceBankId(id)
    setFormCustomBankName(name)
    setShowCustomBankInput(false)
    setCustomBankNameInput('')
    setShowBankSelect(false)
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

  // Filter + sort
  const filtered = filterByDate(expenses, filter, 'date', selectedMonth)
  const sorted = useMemo(() => {
    const items = [...filtered]
    if (sortField === 'date') {
      items.sort((a, b) => {
        const cmp = (a.date || '').localeCompare(b.date || '')
        if (cmp !== 0) return sortDir === 'desc' ? -cmp : cmp
        return String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || ''))
      })
    } else if (sortField === 'amount') {
      items.sort((a, b) => {
        const cmp = Number(a.amount || 0) - Number(b.amount || 0)
        if (cmp !== 0) return sortDir === 'desc' ? -cmp : cmp
        return String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || ''))
      })
    } else if (sortField === 'bank') {
      items.sort((a, b) => {
        const nameA = a.sourceBankName || a.customBankName || ''
        const nameB = b.sourceBankName || b.customBankName || ''
        const cmp = nameA.localeCompare(nameB, 'fa')
        if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp
        return String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || ''))
      })
    }
    return items
  }, [filtered, sortField, sortDir])

  const total = filtered.reduce((s, e) => s + Number(e.amount || 0), 0)

  const selectedBank = allBanks.find((b) => b.id === formSourceBankId)
  const selectedCustomer = customers.find((c) => c.id === formCustomerId)
  const selectedBill = allBills.find((b) => b.id === formBillId)

  const getExpenseTitle = (item) => {
    if (item.category === 'payment') return item.customerName || 'پرداختی'
    if (item.category === 'bills') return item.billName || 'قبض'
    return item.category || 'هزینه'
  }

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">هزینه‌ها</h1>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={18} />
          ثبت هزینه جدید
        </button>
      </div>

      {/* Total card */}
      <div className="card p-3 mb-3 bg-gradient-to-l from-red-50 to-white dark:from-red-900/20 dark:to-slate-800/80">
        <p className="text-sm text-slate-500 dark:text-slate-400">مجموع هزینه‌ها</p>
        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">{formatAmount(total, currency)}</p>
      </div>

      {/* Sort bar */}
      <div className="mb-3">
        <SortBar sortField={sortField} sortDir={sortDir} onChange={(f, d) => { setSortField(f); setSortDir(d) }} />
      </div>

      {/* Filter bar */}
      <div className="mb-3">
        <FilterBar filter={filter} setFilter={setFilter} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      </div>

      {/* Expense list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 dark:text-slate-500">
            <Receipt size={40} className="mx-auto mb-2 opacity-50" />
            <p>هنوز هزینه‌ای ثبت نشده است</p>
          </div>
        ) : (
          sorted.map((item) => {
            const bank = allBanks.find((b) => b.id === item.sourceBankId) || { id: item.sourceBankId, name: item.sourceBankName || item.customBankName, svg: null }
            return (
              <div key={item.id} className="card p-3">
                <div className="flex items-start gap-3">
                  <BankLogo bank={bank} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 break-words leading-tight">
                          {getExpenseTitle(item)}
                        </p>
                        {item.sourceBankName && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 break-words">
                            {item.sourceBankName || item.customBankName}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 no-wrap">
                          {formatJalaliWithWeekday(item.date)}
                          {item.time && <span className="mr-2">-{toPersianDigits(item.time)}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditForm(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <p className="amount-text font-bold text-red-600 dark:text-red-400">
                        {formatAmount(item.amount, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        open={showForm}
        onClose={handleFormClose}
        title={editingId ? 'ویرایش هزینه' : 'ثبت هزینه جدید'}
        footer={
          <div className="flex gap-2">
            <button onClick={handleFormClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={editingId ? () => setEditConfirm(true) : handleSave} className="btn-primary flex-1">تایید</button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">مبلغ</label>
            <AmountInput value={formAmount} onChange={setFormAmount} currency={currency} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">دسته‌بندی</label>
            <div className="flex gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormCategory(cat.id)}
                  className={`chip flex-1 justify-center ${
                    formCategory === cat.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Customer (when category = payment) */}
          {formCategory === 'payment' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">مشتری</label>
              <button
                type="button"
                onClick={() => setShowCustomerSelect(true)}
                className="input-field flex items-center justify-between text-right"
              >
                <span className={selectedCustomer ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
                  {selectedCustomer?.name || 'انتخاب مشتری'}
                </span>
                <User size={18} className="text-slate-400" />
              </button>
            </div>
          )}

          {/* Bill (when category = bills) */}
          {formCategory === 'bills' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">قبض</label>
              <button
                type="button"
                onClick={() => setShowBillSelect(true)}
                className="input-field flex items-center justify-between text-right"
              >
                <span className={selectedBill ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
                  {selectedBill?.name || 'انتخاب قبض'}
                </span>
                <FileText size={18} className="text-slate-400" />
              </button>
            </div>
          )}

          {/* Source Bank */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">حساب مبدأ</label>
            <button
              type="button"
              onClick={() => setShowBankSelect(true)}
              className="input-field flex items-center justify-between text-right"
            >
              <span className={selectedBank || formSourceBankId === 'other' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
                {formSourceBankId === 'other' ? (formCustomBankName || 'سایر') : (selectedBank?.name || 'انتخاب حساب')}
              </span>
              <Wallet size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">تاریخ</label>
            <JalaliDatePicker value={formDate} onChange={(d) => setFormDate(d)} />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">ساعت</label>
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="input-field tabular-nums"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">توضیحات</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="اختیاری"
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Bank Select Modal */}
      <Modal open={showBankSelect} onClose={() => setShowBankSelect(false)} title="انتخاب حساب مبدأ">
        <div className="space-y-1.5">
          {allBanks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => {
                setFormSourceBankId(bank.id)
                if (bank.id === 'other') {
                  setShowCustomBankInput(true)
                } else {
                  setShowBankSelect(false)
                }
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition ${
                formSourceBankId === bank.id ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <BankLogo bank={bank} size={36} />
              <span className="font-medium text-slate-700 dark:text-slate-200">{bank.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Customer Select Modal */}
      <Modal open={showCustomerSelect} onClose={() => setShowCustomerSelect(false)} title="انتخاب مشتری">
        {sortedCustomers.length === 0 ? (
          <p className="text-center text-slate-400 py-4">هنوز مشتری ثبت نشده است</p>
        ) : (
          <div className="space-y-1.5">
            {sortedCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => { setFormCustomerId(c.id); setFormCustomerName(c.name); setShowCustomerSelect(false) }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition ${
                  formCustomerId === c.id ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-sm">
                  {c.name.charAt(0)}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Bill Select Modal */}
      <Modal open={showBillSelect} onClose={() => setShowBillSelect(false)} title="انتخاب قبض">
        <div className="space-y-1.5">
          {allBills.map((bill) => {
            const isCustom = customBills.some((b) => b.id === bill.id)
            return (
              <div key={bill.id} className="flex items-center gap-2">
                <button
                  onClick={() => { setFormBillId(bill.id); setFormBillName(bill.name); setShowBillSelect(false) }}
                  className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl transition ${
                    formBillId === bill.id ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <FileText size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{bill.name}</span>
                </button>
                {isCustom && (
                  <button onClick={() => setBillDeleteId(bill.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )
          })}
          <button
            onClick={() => setShowCustomBillInput(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 text-slate-500 hover:border-brand-400 hover:text-brand-500 transition"
          >
            <Plus size={18} />
            افزودن قبض جدید
          </button>
        </div>
      </Modal>

      {/* Custom Bill Input */}
      <Modal
        open={showCustomBillInput}
        onClose={() => { setShowCustomBillInput(false); setCustomBillNameInput('') }}
        title="افزودن قبض"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setShowCustomBillInput(false); setCustomBillNameInput('') }} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleAddCustomBill} className="btn-primary flex-1">تایید</button>
          </div>
        }
      >
        <input
          type="text"
          value={customBillNameInput}
          onChange={(e) => setCustomBillNameInput(e.target.value)}
          placeholder="نام قبض"
          className="input-field"
          autoFocus
        />
      </Modal>

      {/* Custom Bank Input */}
      <Modal
        open={showCustomBankInput}
        onClose={() => { setShowCustomBankInput(false); setCustomBankNameInput('') }}
        title="نام بانک"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setShowCustomBankInput(false); setCustomBankNameInput('') }} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleAddCustomBank} className="btn-primary flex-1">تایید</button>
          </div>
        }
      >
        <input
          type="text"
          value={customBankNameInput}
          onChange={(e) => setCustomBankNameInput(e.target.value)}
          placeholder="نام بانک"
          className="input-field"
          autoFocus
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="حذف"
        message="آیا از حذف این مورد اطمینان دارید؟"
        confirmText="تایید"
        cancelText="انصراف"
        danger
        onConfirm={() => { deleteExpense(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Bill Delete Confirmation */}
      <ConfirmDialog
        open={!!billDeleteId}
        title="حذف قبض"
        message="آیا از حذف این قبض اطمینان دارید؟"
        confirmText="تایید"
        cancelText="انصراف"
        danger
        onConfirm={() => { deleteCustomBill(billDeleteId); setBillDeleteId(null) }}
        onCancel={() => setBillDeleteId(null)}
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

      {/* Unsaved Changes Dialog */}
      <UnsavedDialog
        open={showUnsaved}
        onSave={handleUnsavedSave}
        onDiscard={handleUnsavedDiscard}
        onCancel={() => setShowUnsaved(false)}
      />
    </div>
  )
}
