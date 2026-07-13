import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, Wallet } from 'lucide-react'
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
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function RevenuePage({ store }) {
  const { revenues, allBanks, addRevenue, updateRevenue, deleteRevenue, addCustomBank, settings } = store
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
  const [formBankId, setFormBankId] = useState('')
  const [formCustomBankName, setFormCustomBankName] = useState('')
  const [formDate, setFormDate] = useState(todayJalaliString())
  const [showBankSelect, setShowBankSelect] = useState(false)
  const [showCustomBankInput, setShowCustomBankInput] = useState(false)
  const [customBankNameInput, setCustomBankNameInput] = useState('')
  const [formDirty, setFormDirty] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)

  // Track initial form state for dirty checking
  const [initialFormState, setInitialFormState] = useState({})

  const resetForm = () => {
    setFormAmount('')
    setFormBankId('')
    setFormCustomBankName('')
    setFormDate(todayJalaliString())
    setFormDirty(false)
    setShowBankSelect(false)
    setShowCustomBankInput(false)
    setCustomBankNameInput('')
  }

  const openAddForm = () => {
    resetForm()
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setFormAmount(item.amount || '')
    setFormBankId(item.bankId || '')
    setFormCustomBankName(item.customBankName || '')
    setFormDate(item.date || todayJalaliString())
    setFormDirty(false)
    setEditingId(item.id)
    setShowForm(true)
  }

  // Track dirty state
  useEffect(() => {
    if (!showForm) return
    const current = { amount: formAmount, bankId: formBankId, customBankName: formCustomBankName, date: formDate }
    const init = initialFormState
    const isDirty = Object.keys(current).some((k) => current[k] !== init[k])
    setFormDirty(isDirty)
  }, [formAmount, formBankId, formCustomBankName, formDate, showForm, initialFormState])

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

  // Back button for bank select modal
  useEffect(() => {
    if (!showBankSelect) return
    pushBackHandler(() => setShowBankSelect(false))
    return () => popBackHandler()
  }, [showBankSelect])

  // Set initial form state when form opens
  useEffect(() => {
    if (showForm) {
      setInitialFormState({ amount: formAmount, bankId: formBankId, customBankName: formCustomBankName, date: formDate })
    }
  }, [showForm])

  const handleSave = () => {
    if (!formAmount || Number(formAmount) <= 0) return
    if (!formBankId) return

    const bank = allBanks.find((b) => b.id === formBankId)
    const data = {
      amount: Number(formAmount),
      bankId: formBankId,
      bankName: bank?.name || formCustomBankName || '',
      customBankName: formBankId === 'other' ? formCustomBankName : '',
      date: formDate,
      time: currentTimeString()
    }

    if (editingId) {
      updateRevenue(editingId, data)
    } else {
      addRevenue(data)
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

  const handleAddCustomBank = () => {
    const name = customBankNameInput.trim()
    if (!name) return
    const id = addCustomBank(name)
    setFormBankId(id)
    setFormCustomBankName(name)
    setShowCustomBankInput(false)
    setCustomBankNameInput('')
    setShowBankSelect(false)
  }

  // Filter + sort
  const filtered = filterByDate(revenues, filter, 'date', selectedMonth)
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
        const nameA = a.bankName || a.customBankName || ''
        const nameB = b.bankName || b.customBankName || ''
        const cmp = nameA.localeCompare(nameB, 'fa')
        if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp
        return String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || ''))
      })
    }
    return items
  }, [filtered, sortField, sortDir])

  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0)

  const selectedBank = allBanks.find((b) => b.id === formBankId)

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">درآمد</h1>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={18} />
          ثبت درآمد جدید
        </button>
      </div>

      {/* Total card */}
      <div className="card p-3 mb-3 bg-gradient-to-l from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800/80">
        <p className="text-sm text-slate-500 dark:text-slate-400">مجموع درآمد</p>
        <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-0.5 tabular-nums">{formatAmount(total, currency)}</p>
      </div>

      {/* Sort bar */}
      <div className="mb-3">
        <SortBar sortField={sortField} sortDir={sortDir} onChange={(f, d) => { setSortField(f); setSortDir(d) }} />
      </div>

      {/* Filter bar */}
      <div className="mb-3">
        <FilterBar filter={filter} setFilter={setFilter} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      </div>

      {/* Revenue list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 dark:text-slate-500">
            <TrendingUp size={40} className="mx-auto mb-2 opacity-50" />
            <p>هنوز درآمدی ثبت نشده است</p>
          </div>
        ) : (
          sorted.map((item) => {
            const bank = allBanks.find((b) => b.id === item.bankId) || { id: item.bankId, name: item.bankName || item.customBankName, svg: null }
            return (
              <div key={item.id} className="card p-3">
                <div className="flex items-start gap-3">
                  <BankLogo bank={bank} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 break-words leading-tight">
                          {item.bankName || item.customBankName || 'نامشخص'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 no-wrap">
                          {formatJalaliWithWeekday(item.date)}
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
                      <p className="amount-text font-bold text-brand-600 dark:text-brand-400">
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
        title={editingId ? 'ویرایش درآمد' : 'ثبت درآمد جدید'}
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

          {/* Bank/Account */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">حساب</label>
            <button
              type="button"
              onClick={() => setShowBankSelect(true)}
              className="input-field flex items-center justify-between text-right"
            >
              <span className={selectedBank || formBankId === 'other' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
                {formBankId === 'other' ? (formCustomBankName || 'سایر') : (selectedBank?.name || 'انتخاب حساب')}
              </span>
              <Wallet size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">تاریخ</label>
            <JalaliDatePicker value={formDate} onChange={(d) => setFormDate(d)} />
          </div>
        </div>
      </Modal>

      {/* Bank Select Modal */}
      <Modal open={showBankSelect} onClose={() => setShowBankSelect(false)} title="انتخاب حساب">
        <div className="space-y-1.5">
          {allBanks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => {
                setFormBankId(bank.id)
                if (bank.id === 'other') {
                  setShowCustomBankInput(true)
                } else {
                  setShowBankSelect(false)
                }
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition ${
                formBankId === bank.id ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <BankLogo bank={bank} size={36} />
              <span className="font-medium text-slate-700 dark:text-slate-200">{bank.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Custom Bank Name Input */}
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
          placeholder="نام بانک را وارد کنید"
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
        onConfirm={() => { deleteRevenue(deleteId); setDeleteId(null) }}
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
