import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react'
import { filterByDate, formatAmount, getJalaliWeekdayName, toPersianDigits, todayJalaliString } from '../lib/jalali'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import UnsavedDialog from '../components/UnsavedDialog'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'
import AccountSelect from '../components/AccountSelect'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import SortBar from '../components/SortBar'

const EMPTY = { amount: '', date: todayJalaliString(), description: '', accountId: '' }

export default function RevenuePage({ store }) {
  const { revenues, addRevenue, updateRevenue, deleteRevenue, sortedAccounts, accountUsage, allBanks, addAccount, deleteAccount, settings } = store
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
    let items = filterByDate(revenues, filter, 'date', selectedMonth)
    items = [...items].sort((a, b) => {
      if (sortBy === 'date-desc') return (b.date || '').localeCompare(a.date || '')
      if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '')
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0)
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0)
      return 0
    })
    return items
  }, [revenues, filter, selectedMonth, sortBy])

  const total = useMemo(() => filtered.reduce((s, r) => s + Number(r.amount || 0), 0), [filtered])

  const openAdd = () => { setForm({ ...EMPTY, date: todayJalaliString() }); setEditingId(null); setDirty(false); setModalOpen(true) }
  const openEdit = (rev) => { setForm({ amount: String(rev.amount || ''), date: rev.date || todayJalaliString(), description: rev.description || '', accountId: rev.accountId || '' }); setEditingId(rev.id); setDirty(false); setModalOpen(true) }

  const handleClose = () => { if (dirty) setShowUnsaved(true); else setModalOpen(false) }

  const handleSave = () => {
    if (!form.amount) return
    const data = { amount: Number(form.amount), date: form.date, description: form.description.trim(), accountId: form.accountId || null }
    if (editingId) updateRevenue(editingId, data)
    else addRevenue(data)
    setModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">درآمدها</h1>
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
          <TrendingUp size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">هنوز درآمدی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rev) => {
            const acc = sortedAccounts.find((a) => a.id === rev.accountId)
            return (
              <div key={rev.id} className="card p-3 flex items-center gap-3">
                <BankLogo bank={acc ? { id: acc.bankId, name: acc.name, svg: acc.logo ? acc.logo.replace('banks/', '') : null } : { id: null, name: '' }} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100 amount-text">{formatAmount(rev.amount, settings.currency)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {acc ? acc.name : 'نامشخص'} • {getJalaliWeekdayName(rev.date)} {toPersianDigits(rev.date.split('/')[2])}
                  </p>
                  {rev.description && <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{rev.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(rev)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-90">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(rev.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90">
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
        title={editingId ? 'ویرایش درآمد' : 'افزودن درآمد'}
        footer={
          <button onClick={handleSave} disabled={!form.amount} className="btn-primary w-full disabled:opacity-50">
            {editingId ? 'ذخیره تغییرات' : 'افزودن درآمد'}
          </button>
        }
      >
        <div className="space-y-4">
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
        title="حذف درآمد"
        message="آیا از حذف این تراکنش مطمئن هستید؟"
        danger
        confirmText="حذف"
        onConfirm={() => { deleteRevenue(deleteId); setDeleteId(null) }}
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
