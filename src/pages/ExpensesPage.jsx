import { useState, useMemo } from 'react'
import { Plus, CreditCard as Edit2, Trash2, TrendingDown } from 'lucide-react'
import { filterByDate, formatAmount, getJalaliWeekdayName, toPersianDigits, todayJalaliString } from '../lib/jalali'
import { EXPENSE_CATEGORIES } from '../lib/banks'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import UnsavedDialog from '../components/UnsavedDialog'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'
import AccountSelect from '../components/AccountSelect'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import SortBar from '../components/SortBar'

const EMPTY = { amount: '', date: todayJalaliString(), description: '', accountId: '', category: 'payment', billId: '' }

export default function ExpensesPage({ store }) {
  const { expenses, addExpense, updateExpense, deleteExpense, sortedAccounts, accountUsage, allBanks, allBills, addAccount, deleteAccount, settings } = store
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [dirty, setDirty] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const [filter, setFilter] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')

  const filtered = useMemo(() => {
    let items = filterByDate(expenses, filter, 'date', selectedMonth)
    items = [...items].sort((a, b) => {
      if (sortBy === 'date-desc') return (b.date || '').localeCompare(a.date || '')
      if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '')
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0)
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0)
      return 0
    })
    return items
  }, [expenses, filter, selectedMonth, sortBy])

  const total = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount || 0), 0), [filtered])

  const openAdd = () => { setForm({ ...EMPTY, date: todayJalaliString() }); setEditingId(null); setDirty(false); setModalOpen(true) }
  const openEdit = (exp) => { setForm({ amount: String(exp.amount || ''), date: exp.date || todayJalaliString(), description: exp.description || '', accountId: exp.accountId || '', category: exp.category || 'payment', billId: exp.billId || '' }); setEditingId(exp.id); setDirty(false); setModalOpen(true) }

  const handleClose = () => { if (dirty) setShowUnsaved(true); else setModalOpen(false) }

  const handleSave = () => {
    if (!form.amount) return
    const data = { amount: Number(form.amount), date: form.date, description: form.description.trim(), accountId: form.accountId || null, category: form.category, billId: form.category === 'bills' ? form.billId : null }
    if (editingId) updateExpense(editingId, data)
    else addExpense(data)
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">هزینه‌ها</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">جمع: {formatAmount(total, settings.currency)}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1">
          <Plus size={20} /> افزودن
        </button>
      </div>

      <FilterBar filter={filter} setFilter={setFilter} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <SortBar sortBy={sortBy} setSortBy={setSortBy} options={[
        { value: 'date-desc', label: 'جدیدترین' },
        { value: 'date-asc', label: 'قدیمی‌ترین' },
        { value: 'amount-desc', label: 'بیشترین مبلغ' },
        { value: 'amount-asc', label: 'کمترین مبلغ' }
      ]} />

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <TrendingDown size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">هنوز هزینه‌ای ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((exp) => {
            const acc = sortedAccounts.find((a) => a.id === exp.accountId)
            const bill = allBills.find((b) => b.id === exp.billId)
            return (
              <div key={exp.id} className="card p-3 flex items-center gap-3">
                <BankLogo bank={acc ? { id: acc.bankId, name: acc.name, svg: acc.logo ? acc.logo.replace('banks/', '') : null } : { id: null, name: '' }} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100 amount-text">{formatAmount(exp.amount, settings.currency)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {acc ? acc.name : 'نامشخص'} • {getJalaliWeekdayName(exp.date)} {toPersianDigits(exp.date.split('/')[2])}
                    {exp.category === 'bills' && bill ? ` • ${bill.name}` : ''}
                  </p>
                  {exp.description && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{exp.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(exp)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-90">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(exp.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editingId ? 'ویرایش هزینه' : 'افزودن هزینه'}
        footer={
          <button onClick={handleSave} disabled={!form.amount} className="btn-primary w-full disabled:opacity-50">
            {editingId ? 'ذخیره تغییرات' : 'افزودن هزینه'}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نوع هزینه</label>
            <div className="flex gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setForm({ ...form, category: cat.id }); setDirty(true) }}
                  className={`chip flex-1 justify-center ${form.category === cat.id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {form.category === 'bills' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نوع قبض</label>
              <select
                value={form.billId}
                onChange={(e) => { setForm({ ...form, billId: e.target.value }); setDirty(true) }}
                className="input-field"
              >
                <option value="">انتخاب قبض...</option>
                {allBills.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">مبلغ</label>
            <AmountInput value={form.amount} onChange={(v) => { setForm({ ...form, amount: v }); setDirty(true) }} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">تاریخ</label>
            <JalaliDatePicker value={form.date} onChange={(v) => { setForm({ ...form, date: v }); setDirty(true) }} />
          </div>
          <AccountSelect
            accounts={store.accounts}
            sortedAccounts={sortedAccounts}
            accountUsage={accountUsage}
            allBanks={allBanks}
            value={form.accountId}
            onChange={(v) => { setForm({ ...form, accountId: v }); setDirty(true) }}
            onAddAccount={addAccount}
            onDeleteAccount={deleteAccount}
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">توضیحات (اختیاری)</label>
            <textarea
              value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setDirty(true) }}
              rows={2}
              className="input-field resize-none"
              placeholder="توضیح..."
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="حذف هزینه"
        message="آیا از حذف این تراکنش مطمئن هستید؟"
        danger
        confirmText="حذف"
        onConfirm={() => { deleteExpense(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />

      <UnsavedDialog
        open={showUnsaved}
        onDiscard={() => { setShowUnsaved(false); setModalOpen(false) }}
        onCancel={() => setShowUnsaved(false)}
      />
    </div>
  )
}
