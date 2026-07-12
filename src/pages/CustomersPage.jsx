import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Users, ArrowRight, TrendingUp, TrendingDown, Pencil } from 'lucide-react'
import { useStore, DEFAULT_BANKS } from '../lib/store'
import { formatAmount, formatJalaliLong, todayISO, filterByDate, sortByDate, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'
import ConfirmActionDialog from '../components/ConfirmActionDialog'

export default function CustomersPage() {
  const {
    customers, revenues, expenses, accounts, categories, currency,
    addCustomer, updateCustomer, deleteCustomer, isCustomerNameDuplicate
  } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [detailTx, setDetailTx] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editConfirm, setEditConfirm] = useState(false)
  const [nameError, setNameError] = useState('')

  const formDirty = useMemo(() => {
    if (editingId) return Boolean(newName.trim())
    return Boolean(newName.trim())
  }, [newName, editingId])

  const validateName = (name, excludeId = null) => {
    if (!name.trim()) {
      setNameError('')
      return false
    }
    if (isCustomerNameDuplicate(name, excludeId)) {
      setNameError('این نام مشتری قبلاً ثبت شده است')
      return false
    }
    setNameError('')
    return true
  }

  const handleNameChange = (val) => {
    setNewName(val)
    if (nameError) validateName(val, editingId)
  }

  const openAddForm = () => {
    setEditingId(null)
    setNewName('')
    setNameError('')
    setShowForm(true)
  }

  const openEditForm = (cust) => {
    setEditingId(cust.id)
    setNewName(cust.name)
    setNameError('')
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!newName.trim()) return
    if (!validateName(newName, editingId)) return
    if (editingId) {
      setEditConfirm(true)
    } else {
      addCustomer({ name: newName.trim() })
      setNewName('')
      setNameError('')
      setShowForm(false)
    }
  }

  const confirmEdit = () => {
    updateCustomer(editingId, { name: newName.trim() })
    setEditConfirm(false)
    setNewName('')
    setNameError('')
    setEditingId(null)
    setShowForm(false)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const getCustomerTransactions = (custId) => {
    const revs = revenues.filter((r) => r.customerId === custId).map((r) => ({ ...r, type: 'revenue' }))
    const exps = expenses.filter((e) => e.customerId === custId).map((e) => ({ ...e, type: 'expense' }))
    return [...revs, ...exps].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }

  const getCustomerBalance = (custId) => {
    const txs = getCustomerTransactions(custId)
    return txs.reduce((s, t) => s + (t.type === 'revenue' ? Number(t.amount) : -Number(t.amount)), 0)
  }

  useEffect(() => {
    if (!selectedCustomer) return
    pushBackHandler(() => setSelectedCustomer(null))
    return () => popBackHandler()
  }, [selectedCustomer])

  if (selectedCustomer) {
    const allTxs = getCustomerTransactions(selectedCustomer.id)
    const txs = filterByDate(allTxs, filter, 'date', selectedMonth)
    const sortedTxs = sortByDate(txs, sortDir)
    const balance = getCustomerBalance(selectedCustomer.id)

    return (
      <div className="px-4 pt-4 pb-28 space-y-4">
        <button onClick={() => setSelectedCustomer(null)} className="btn-ghost mb-2">
          <ArrowRight size={18} /> بازگشت
        </button>

        <div className="card p-4 bg-gradient-to-l from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800/80">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            مانده حساب: <span className={balance >= 0 ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>{formatAmount(Math.abs(balance), currency)}</span>
          </p>
        </div>

        <FilterBar filter={filter} onChange={setFilter} selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />

        <div className="space-y-2">
          {sortedTxs.length === 0 && (
            <div className="card p-8 text-center text-slate-400">
              <p>تراکنشی برای این مشتری ثبت نشده</p>
            </div>
          )}
          {sortedTxs.map((tx) => {
            const acc = accounts.find((a) => a.id === tx.accountId)
            const bank = DEFAULT_BANKS.find((b) => b.id === acc?.bankId)
            const cat = categories.find((c) => c.id === tx.categoryId)
            const isRev = tx.type === 'revenue'
            return (
              <button
                key={tx.id}
                onClick={() => setDetailTx(tx)}
                className="card p-3 flex items-center gap-3 w-full text-right hover:border-brand-400 transition"
              >
                <div className={`p-2 rounded-full shrink-0 ${isRev ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {isRev ? <TrendingUp size={16} className="text-green-600 dark:text-green-400" /> : <TrendingDown size={16} className="text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {isRev ? 'درآمد' : cat?.name || 'هزینه'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatJalaliLong(tx.date)}
                    {tx.time && ` • ${toPersianDigits(tx.time)}`}
                  </p>
                </div>
                <p className={`font-bold whitespace-nowrap ${isRev ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isRev ? '+' : '-'}{formatAmount(tx.amount, currency)}
                </p>
              </button>
            )
          })}
        </div>

        <Modal open={!!detailTx} onClose={() => setDetailTx(null)} title="جزئیات تراکنش">
          {detailTx && (
            <div className="space-y-3">
              <DetailRow label="نوع" value={detailTx.type === 'revenue' ? 'درآمد' : 'هزینه'} />
              <DetailRow label="مبلغ" value={formatAmount(detailTx.amount, currency)} />
              <DetailRow label="حساب" value={accounts.find((a) => a.id === detailTx.accountId)?.name || '-'} />
              <DetailRow label="بانک" value={DEFAULT_BANKS.find((b) => b.id === accounts.find((a) => a.id === detailTx.accountId)?.bankId)?.name || '-'} />
              <DetailRow label="تاریخ" value={formatJalaliLong(detailTx.date)} />
              {detailTx.time && <DetailRow label="ساعت" value={toPersianDigits(detailTx.time)} />}
              {detailTx.categoryId && <DetailRow label="دسته‌بندی" value={categories.find((c) => c.id === detailTx.categoryId)?.name || '-'} />}
              {detailTx.description && <DetailRow label="توضیحات" value={detailTx.description} />}
            </div>
          )}
        </Modal>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">مشتریان</h1>
        <button onClick={openAddForm} className="btn-primary">
          <Plus size={20} /> افزودن مشتری
        </button>
      </div>

      <div className="space-y-2">
        {customers.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-2 opacity-40" />
            <p>هنوز مشتری‌ای ثبت نشده</p>
          </div>
        )}
        {customers.map((c) => {
          const balance = getCustomerBalance(c.id)
          const txCount = getCustomerTransactions(c.id).length
          return (
            <div key={c.id} className="card p-3 flex items-center gap-3">
              <button onClick={() => setSelectedCustomer(c)} className="flex items-center gap-3 flex-1 min-w-0 text-right">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{toPersianDigits(txCount)} تراکنش</p>
                </div>
                <p className={`text-sm font-bold whitespace-nowrap ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatAmount(Math.abs(balance), currency)}
                </p>
              </button>
              <button onClick={() => openEditForm(c)} className="p-2 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 shrink-0">
                <Pencil size={16} />
              </button>
              <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setNewName(''); setNameError(''); setEditingId(null) }}
        title={editingId ? 'ویرایش مشتری' : 'افزودن مشتری'}
        dirty={formDirty}
        onSave={handleSubmit}
        onDiscard={() => { setShowForm(false); setNewName(''); setNameError(''); setEditingId(null) }}
        footer={({ attemptClose }) => (
          <div className="flex gap-2">
            <button onClick={attemptClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">{editingId ? 'ذخیره تغییرات' : 'افزودن'}</button>
          </div>
        )}
      >
        <div>
          <input
            value={newName}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`input ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="نام مشتری"
            autoFocus
          />
          {nameError && <p className="text-sm text-red-500 mt-1.5">{nameError}</p>}
        </div>
      </Modal>

      <ConfirmActionDialog
        open={editConfirm}
        onConfirm={confirmEdit}
        onCancel={() => setEditConfirm(false)}
        title="ویرایش مشتری"
        message="آیا از ویرایش این مورد اطمینان دارید؟"
        confirmLabel="ذخیره تغییرات"
      />

      <ConfirmActionDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="حذف مشتری"
        message="آیا از حذف این مورد اطمینان دارید؟"
        confirmLabel="حذف"
        confirmClass="btn-danger"
      />
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100 text-left">{value}</span>
    </div>
  )
}
