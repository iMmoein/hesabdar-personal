import { useState, useMemo } from 'react'
import { Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import { useStore } from '../lib/store'
import { Modal } from '../components/Modal'
import { JalaliDatePicker } from '../components/JalaliDatePicker'
import { AmountInput } from '../components/AmountInput'
import { BankLogo } from '../components/BankLogo'
import { FilterBar, filterByDate, formatFilterRange } from '../components/FilterBar'
import { formatAmount, formatJalaliLong, isoToJalali, todayJalali, jalaliToISO, currencyLabel } from '../lib/jalali'

export function RevenuePage() {
  const { data, addRevenue, deleteRevenue, addAccount, currency } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [filter, setFilter] = useState('all')

  const [amount, setAmount] = useState('')
  const [amountNum, setAmountNum] = useState(0)
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(todayJalali())

  const [accBank, setAccBank] = useState(data.banks[0]?.id || 'melli')
  const [accCustomBank, setAccCustomBank] = useState('')

  const resetForm = () => {
    setAmount(''); setAmountNum(0); setAccountId(''); setDate(todayJalali())
  }

  const submit = () => {
    if (!amountNum || !accountId) return
    addRevenue({
      amount: amountNum,
      accountId,
      date: jalaliToISO(date),
    })
    resetForm()
    setShowForm(false)
  }

  const submitAccount = () => {
    const bank = data.banks.find((b) => b.id === accBank)
    const customName = accBank === 'other' ? accCustomBank.trim() : ''
    const accountName = customName || bank?.name || 'حساب'
    const id = addAccount({
      name: accountName,
      number: '',
      balance: 0,
      bankId: accBank,
      customBankName: customName,
    })
    setAccountId(id)
    setAccBank(data.banks[0]?.id || 'melli')
    setAccCustomBank('')
    setShowAccount(false)
  }

  const getAccount = (id) => data.accounts.find((a) => a.id === id)
  const getBank = (id) => data.banks.find((b) => b.id === id)
  const getEffectiveBank = (acc) => {
    if (!acc) return null
    const base = getBank(acc.bankId)
    if (!base) return null
    if (acc.bankId === 'other' && acc.customBankName) {
      return { ...base, name: acc.customBankName, short: acc.customBankName.slice(0, 6) }
    }
    return base
  }

  const filtered = useMemo(
    () => data.revenues.filter((r) => filterByDate(r, filter)).sort((a, b) => b.date.localeCompare(a.date)),
    [data.revenues, filter]
  )
  const total = filtered.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">درآمد</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">مدیریت درآمدهای شما</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> درآمد جدید
        </button>
      </div>

      <div className="card p-4 bg-gradient-to-l from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-500 dark:text-slate-400">جمع درآمد ({formatFilterRange(filter)})</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatAmount(total, currency)} {currencyLabel(currency)}
            </div>
          </div>
        </div>
      </div>

      <FilterBar value={filter} onChange={setFilter} />

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-slate-400">
            <Wallet size={40} className="mx-auto mb-3 opacity-50" />
            <p>هنوز درآمدی ثبت نشده است.</p>
          </div>
        )}
        {filtered.map((r) => {
          const acc = getAccount(r.accountId)
          const bank = acc ? getEffectiveBank(acc) : null
          return (
            <div key={r.id} className="card p-3.5 flex items-center gap-3 animate-fade">
              {bank ? <BankLogo bank={bank} /> : <div className="w-9 h-9 rounded-xl bg-slate-200" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                  {acc?.name || 'نامشخص'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatJalaliLong(isoToJalali(r.date))}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  +{formatAmount(r.amount, currency)}
                </div>
                <div className="text-xs text-slate-400">{currencyLabel(currency)}</div>
              </div>
              <button
                onClick={() => deleteRevenue(r.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div className="card p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <span className="text-sm text-slate-600 dark:text-slate-300">مجموع کل</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatAmount(total, currency)} {currencyLabel(currency)}
          </span>
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="درآمد جدید"
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="btn-ghost">انصراف</button>
            <button onClick={submit} className="btn-primary">تایید</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">مبلغ ({currencyLabel(currency)})</label>
            <AmountInput value={amount} onChange={(fmt, num) => { setAmount(fmt); setAmountNum(num) }} />
          </div>
          <div>
            <label className="label">حساب</label>
            <div className="flex gap-2">
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="input flex-1"
              >
                <option value="">انتخاب حساب...</option>
                {data.accounts.map((a) => {
                  const b = data.banks.find((b) => b.id === a.bankId)
                  const label = (a.bankId === 'other' && a.customBankName) ? a.customBankName : b?.name
                  return <option key={a.id} value={a.id}>{a.name} - {label}</option>
                })}
              </select>
              <button type="button" onClick={() => setShowAccount(true)} className="btn-ghost whitespace-nowrap">
                <Plus size={16} /> حساب جدید
              </button>
            </div>
          </div>
          <div>
            <label className="label">تاریخ</label>
            <JalaliDatePicker value={date} onChange={setDate} />
          </div>
        </div>
      </Modal>

      <Modal
        open={showAccount}
        onClose={() => setShowAccount(false)}
        title="افزودن حساب جدید"
        size="lg"
        footer={
          <>
            <button onClick={() => setShowAccount(false)} className="btn-ghost">انصراف</button>
            <button onClick={submitAccount} className="btn-primary">تایید</button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="label">انتخاب بانک</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {data.banks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setAccBank(b.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition
                  ${accBank === b.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
              >
                <BankLogo bank={b} size={32} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center truncate w-full">{b.short}</span>
              </button>
            ))}
          </div>
          {accBank === 'other' && (
            <div className="mt-3 animate-fade">
              <label className="label">نام بانک (دلخواه)</label>
              <input
                value={accCustomBank}
                onChange={(e) => setAccCustomBank(e.target.value)}
                className="input"
                placeholder="نام بانک را وارد کنید"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
