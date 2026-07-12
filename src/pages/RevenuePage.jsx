import { useState, useMemo } from 'react'
import { Plus, Trash2, TrendingUp, Wallet, Pencil } from 'lucide-react'
import { useStore, DEFAULT_BANKS } from '../lib/store'
import { formatAmount, formatJalaliLong, todayISO, filterByDate, sortByDate, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import SortButton from '../components/SortButton'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'
import ConfirmActionDialog from '../components/ConfirmActionDialog'

export default function RevenuePage() {
  const { revenues, accounts, currency, addRevenue, updateRevenue, deleteRevenue, addAccount } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editConfirm, setEditConfirm] = useState(false)

  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(todayISO())

  const filtered = filterByDate(revenues, filter, 'date', selectedMonth)
  const sorted = sortByDate(filtered, sortDir)
  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0)

  const formDirty = useMemo(
    () => Boolean(amount) || Boolean(accountId) || date !== todayISO(),
    [amount, accountId, date]
  )

  const resetForm = () => { setAmount(''); setAccountId(''); setDate(todayISO()); setEditingId(null) }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (rev) => {
    setEditingId(rev.id)
    setAmount(rev.amount)
    setAccountId(rev.accountId)
    setDate(rev.date)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!amount || !accountId) return
    if (editingId) {
      setEditConfirm(true)
    } else {
      addRevenue({ amount: Number(amount), accountId, date })
      resetForm()
      setShowForm(false)
    }
  }

  const confirmEdit = () => {
    updateRevenue(editingId, { amount: Number(amount), accountId, date })
    setEditConfirm(false)
    resetForm()
    setShowForm(false)
  }

  const handleAddAccount = (bankId) => {
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)
    const acc = addAccount({ bankId, name: bank.name })
    setAccountId(acc.id)
    setShowBankPicker(false)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteRevenue(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">درآمد</h1>
        <button onClick={openAddForm} className="btn-primary">
          <Plus size={20} /> ثبت درآمد
        </button>
      </div>

      <FilterBar filter={filter} onChange={setFilter} selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />

      <div className="flex items-center justify-between">
        <div className="card p-3 flex-1 mr-2 bg-gradient-to-l from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800/80">
          <p className="text-sm text-slate-500 dark:text-slate-400">مجموع درآمد</p>
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-0.5">{formatAmount(total, currency)}</p>
        </div>
        <SortButton sortDir={sortDir} onChange={setSortDir} />
      </div>

      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <TrendingUp size={40} className="mx-auto mb-2 opacity-40" />
            <p>هنوز درآمدی ثبت نشده است</p>
          </div>
        )}
        {sorted.map((rev) => {
          const acc = accounts.find((a) => a.id === rev.accountId)
          const bank = DEFAULT_BANKS.find((b) => b.id === acc?.bankId)
          return (
            <div key={rev.id} className="card p-3 flex items-center gap-3">
              <button onClick={() => openEditForm(rev)} className="flex items-center gap-3 flex-1 min-w-0 text-right">
                <BankLogo bank={bank} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{acc?.name || 'نامشخص'}</p>
                  <p className="text-xs text-slate-400">{formatJalaliLong(rev.date)}</p>
                </div>
                <p className="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">+{formatAmount(rev.amount, currency)}</p>
              </button>
              <button onClick={() => openEditForm(rev)} className="p-2 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 shrink-0">
                <Pencil size={16} />
              </button>
              <button onClick={() => setDeleteTarget(rev)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); resetForm() }}
        title={editingId ? 'ویرایش درآمد' : 'ثبت درآمد'}
        dirty={formDirty}
        onSave={handleSubmit}
        onDiscard={() => { setShowForm(false); resetForm() }}
        footer={({ attemptClose }) => (
          <div className="flex gap-2">
            <button onClick={attemptClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">{editingId ? 'ذخیره تغییرات' : 'ثبت'}</button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="label">مبلغ</label>
            <AmountInput value={amount} onChange={setAmount} />
          </div>
          <div>
            <label className="label">حساب</label>
            <div className="flex gap-2">
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input flex-1">
                <option value="">انتخاب حساب</option>
                {accounts.map((a) => {
                  const bank = DEFAULT_BANKS.find((b) => b.id === a.bankId)
                  return <option key={a.id} value={a.id}>{bank?.name || a.name}</option>
                })}
              </select>
              <button onClick={() => setShowBankPicker(true)} className="btn-ghost px-3">
                <Wallet size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className="label">تاریخ</label>
            <JalaliDatePicker value={date} onChange={setDate} />
          </div>
        </div>
      </Modal>

      <Modal open={showBankPicker} onClose={() => setShowBankPicker(false)} title="انتخاب بانک" size="xl">
        <div className="grid grid-cols-3 gap-2">
          {DEFAULT_BANKS.map((bank) => (
            <button key={bank.id} onClick={() => handleAddAccount(bank.id)} className="card p-3 flex flex-col items-center gap-2 hover:border-brand-400 transition">
              <BankLogo bank={bank} size={48} />
              <span className="text-xs text-slate-600 dark:text-slate-300 text-center">{bank.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmActionDialog
        open={editConfirm}
        onConfirm={confirmEdit}
        onCancel={() => setEditConfirm(false)}
        title="ویرایش درآمد"
        message="آیا از ویرایش این مورد اطمینان دارید؟"
        confirmLabel="ذخیره تغییرات"
      />

      <ConfirmActionDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="حذف درآمد"
        message="آیا از حذف این مورد اطمینان دارید؟"
        confirmLabel="حذف"
        confirmClass="btn-danger"
      />
    </div>
  )
}
