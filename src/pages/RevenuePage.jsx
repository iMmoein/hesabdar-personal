import { useState } from 'react'
import { Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import { useStore, DEFAULT_BANKS } from '../lib/store'
import { formatAmount, formatJalaliLong, todayISO, filterByDate, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'

export default function RevenuePage() {
  const { revenues, accounts, currency, addRevenue, deleteRevenue, addAccount } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [filter, setFilter] = useState('all')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(todayISO())

  const filtered = filterByDate(revenues, filter)
  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0)

  const resetForm = () => { setAmount(''); setAccountId(''); setDate(todayISO()) }

  const handleSubmit = () => {
    if (!amount || !accountId) return
    addRevenue({ amount: Number(amount), accountId, date })
    resetForm()
    setShowForm(false)
  }

  const handleAddAccount = (bankId) => {
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)
    const acc = addAccount({ bankId, name: bank.name })
    setAccountId(acc.id)
    setShowBankPicker(false)
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">درآمد</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={20} /> ثبت درآمد
        </button>
      </div>

      <FilterBar filter={filter} onChange={setFilter} />

      <div className="card p-4 bg-gradient-to-l from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800/80">
        <p className="text-sm text-slate-500 dark:text-slate-400">مجموع درآمد ({filter === 'all' ? 'همه' : filter === 'monthly' ? 'ماهیانه' : 'سالانه'})</p>
        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{formatAmount(total, currency)}</p>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <TrendingUp size={40} className="mx-auto mb-2 opacity-40" />
            <p>هنوز درآمدی ثبت نشده است</p>
          </div>
        )}
        {filtered.map((rev) => {
          const acc = accounts.find((a) => a.id === rev.accountId)
          const bank = DEFAULT_BANKS.find((b) => b.id === acc?.bankId)
          return (
            <div key={rev.id} className="card p-3 flex items-center gap-3">
              <BankLogo bank={bank} size={44} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{acc?.name || 'نامشخص'}</p>
                <p className="text-xs text-slate-400">{formatJalaliLong(rev.date)}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-green-600 dark:text-green-400">+{formatAmount(rev.amount, currency)}</p>
              </div>
              <button onClick={() => deleteRevenue(rev.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="ثبت درآمد" footer={
        <button onClick={handleSubmit} className="btn-primary w-full">ثبت</button>
      }>
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
            <button
              key={bank.id}
              onClick={() => handleAddAccount(bank.id)}
              className="card p-3 flex flex-col items-center gap-2 hover:border-brand-400 transition"
            >
              <BankLogo bank={bank} size={44} />
              <span className="text-xs text-slate-600 dark:text-slate-300 text-center">{bank.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
