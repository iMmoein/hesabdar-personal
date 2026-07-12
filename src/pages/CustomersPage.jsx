import { useState, useMemo } from 'react'
import { Plus, Trash2, User, Users, ArrowLeft, Receipt, TrendingUp, TrendingDown, Clock, Tag, Wallet } from 'lucide-react'
import { useStore } from '../lib/store'
import { Modal } from '../components/Modal'
import { JalaliDatePicker } from '../components/JalaliDatePicker'
import { AmountInput } from '../components/AmountInput'
import { FilterBar, filterByDate, formatFilterRange } from '../components/FilterBar'
import { formatAmount, formatJalaliLong, isoToJalali, todayJalali, jalaliToISO, toPersianDigits, currencyLabel } from '../lib/jalali'

export function CustomersPage() {
  const { data, addCustomer, deleteCustomer, addExpense, addRevenue, currency } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Transaction form
  const [showTx, setShowTx] = useState(false)
  const [txType, setTxType] = useState('expense') // 'expense' or 'revenue'
  const [txAmount, setTxAmount] = useState('')
  const [txAmountNum, setTxAmountNum] = useState(0)
  const [txDate, setTxDate] = useState(todayJalali())
  const [txTime, setTxTime] = useState('')
  const [txAccountId, setTxAccountId] = useState('')
  const [txCategory, setTxCategory] = useState('')

  // Transaction detail modal
  const [detailTx, setDetailTx] = useState(null)

  const submitCustomer = () => {
    if (!name.trim()) return
    addCustomer(name.trim())
    setName('')
    setShowForm(false)
  }

  const submitTx = () => {
    if (!txAmountNum || !selectedCustomer) return
    const payload = {
      amount: txAmountNum,
      customerId: selectedCustomer.id,
      accountId: txAccountId || null,
      date: jalaliToISO(txDate),
      time: txTime || null,
      categoryId: txType === 'expense' ? (txCategory || null) : null,
    }
    if (txType === 'expense') {
      addExpense(payload)
    } else {
      addRevenue(payload)
    }
    setTxAmount(''); setTxAmountNum(0); setTxDate(todayJalali()); setTxTime(''); setTxAccountId(''); setTxCategory('')
    setShowTx(false)
  }

  const getAccount = (id) => data.accounts.find((a) => a.id === id)
  const getBank = (id) => data.banks.find((b) => b.id === id)
  const getCategory = (id) => data.categories.find((c) => c.id === id)

  // Customer detail transactions
  const [detailFilter, setDetailFilter] = useState('all')

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return []
    const revs = data.revenues
      .filter((r) => r.customerId === selectedCustomer.id)
      .map((r) => ({ ...r, txType: 'revenue' }))
    const exps = data.expenses
      .filter((e) => e.customerId === selectedCustomer.id)
      .map((e) => ({ ...e, txType: 'expense' }))
    return [...revs, ...exps]
      .filter((t) => filterByDate(t, detailFilter))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [selectedCustomer, data.revenues, data.expenses, detailFilter])

  const customerBalance = useMemo(() => {
    if (!selectedCustomer) return 0
    const revs = data.revenues.filter((r) => r.customerId === selectedCustomer.id).reduce((s, r) => s + Number(r.amount), 0)
    const exps = data.expenses.filter((e) => e.customerId === selectedCustomer.id).reduce((s, e) => s + Number(e.amount), 0)
    return revs - exps
  }, [selectedCustomer, data.revenues, data.expenses])

  // Customer detail view
  if (selectedCustomer) {
    return (
      <div className="space-y-4 animate-fade">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">مشخصات مشتری</p>
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-l from-brand-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-600">
              <Wallet size={24} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">مانده حساب</div>
              <div className={`text-xl font-extrabold ${customerBalance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatAmount(Math.abs(customerBalance), currency)} {currencyLabel(currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <FilterBar value={detailFilter} onChange={setDetailFilter} />
          <button
            onClick={() => { setTxType('expense'); setShowTx(true) }}
            className="btn-primary whitespace-nowrap"
          >
            <Plus size={16} /> تراکنش
          </button>
        </div>

        <div className="space-y-2.5">
          {customerTransactions.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-50" />
              <p>تراکنشی ثبت نشده است.</p>
            </div>
          )}
          {customerTransactions.map((t) => {
            const acc = getAccount(t.accountId)
            const cat = getCategory(t.categoryId)
            const isRev = t.txType === 'revenue'
            return (
              <button
                key={t.id}
                onClick={() => setDetailTx(t)}
                className="card p-3 flex items-center gap-2.5 w-full text-right hover:shadow-md transition animate-fade"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isRev ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {isRev ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {isRev ? 'دریافتی' : 'پرداختی'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                    <span className="whitespace-nowrap">{formatJalaliLong(isoToJalali(t.date))}</span>
                    {t.time && <span className="whitespace-nowrap">- {toPersianDigits(t.time)}</span>}
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <div className={`font-bold whitespace-nowrap ${isRev ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isRev ? '+' : '-'}{formatAmount(t.amount, currency)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Transaction form modal */}
        <Modal
          open={showTx}
          onClose={() => setShowTx(false)}
          title="تراکنش جدید"
          footer={
            <>
              <button onClick={() => setShowTx(false)} className="btn-ghost">انصراف</button>
              <button onClick={submitTx} className="btn-primary">تایید</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTxType('expense')}
                className={`flex-1 chip ${txType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                پرداختی
              </button>
              <button
                onClick={() => setTxType('revenue')}
                className={`flex-1 chip ${txType === 'revenue' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                دریافتی
              </button>
            </div>
            <div>
              <label className="label">مبلغ ({currencyLabel(currency)})</label>
              <AmountInput value={txAmount} onChange={(fmt, num) => { setTxAmount(fmt); setTxAmountNum(num) }} />
            </div>
            <div>
              <label className="label">حساب</label>
              <select value={txAccountId} onChange={(e) => setTxAccountId(e.target.value)} className="input">
                <option value="">بدون حساب</option>
                {data.accounts.map((a) => {
                  const b = data.banks.find((b) => b.id === a.bankId)
                  const label = (a.bankId === 'other' && a.customBankName) ? a.customBankName : b?.name
                  return <option key={a.id} value={a.id}>{a.name} - {label}</option>
                })}
              </select>
            </div>
            {txType === 'expense' && (
              <div>
                <label className="label">دسته بندی</label>
                <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="input">
                  <option value="">بدون دسته</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">تاریخ</label>
                <JalaliDatePicker value={txDate} onChange={setTxDate} />
              </div>
              <div>
                <label className="label">ساعت</label>
                <input type="time" value={txTime} onChange={(e) => setTxTime(e.target.value)} className="input" dir="ltr" />
              </div>
            </div>
          </div>
        </Modal>

        {/* Transaction detail modal */}
        <Modal
          open={!!detailTx}
          onClose={() => setDetailTx(null)}
          title="جزئیات تراکنش"
          size="sm"
          footer={
            <button onClick={() => setDetailTx(null)} className="btn-primary w-full">بستن</button>
          }
        >
          {detailTx && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${detailTx.txType === 'revenue' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {detailTx.txType === 'revenue' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                <div>
                  <div className="text-sm text-slate-500">{detailTx.txType === 'revenue' ? 'دریافتی' : 'پرداختی'}</div>
                  <div className={`text-xl font-extrabold ${detailTx.txType === 'revenue' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {detailTx.txType === 'revenue' ? '+' : '-'}{formatAmount(detailTx.amount, currency)} {currencyLabel(currency)}
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <DetailRow icon={<Wallet size={16} />} label="حساب" value={getAccount(detailTx.accountId)?.name || 'بدون حساب'} />
                <DetailRow icon={<Tag size={16} />} label="دسته بندی" value={getCategory(detailTx.categoryId)?.name || 'بدون دسته'} />
                <DetailRow icon={<Receipt size={16} />} label="تاریخ" value={formatJalaliLong(isoToJalali(detailTx.date))} />
                {detailTx.time && (
                  <DetailRow icon={<Clock size={16} />} label="ساعت" value={toPersianDigits(detailTx.time)} />
                )}
                {detailTx.description && (
                  <DetailRow icon={<Receipt size={16} />} label="توضیحات" value={detailTx.description} />
                )}
                {detailTx.billName && (
                  <DetailRow icon={<Receipt size={16} />} label="نام قبض" value={detailTx.billName} />
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    )
  }

  // Customer list view
  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">مشتریان</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">مدیریت مشتریان</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> مشتری جدید
        </button>
      </div>

      <div className="space-y-2.5">
        {data.customers.length === 0 && (
          <div className="card p-10 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-50" />
            <p>هنوز مشتری ای ثبت نشده است.</p>
          </div>
        )}
        {data.customers.map((c) => {
          const revs = data.revenues.filter((r) => r.customerId === c.id).reduce((s, r) => s + Number(r.amount), 0)
          const exps = data.expenses.filter((e) => e.customerId === c.id).reduce((s, e) => s + Number(e.amount), 0)
          const balance = revs - exps
          return (
            <div key={c.id} className="card p-3.5 flex items-center gap-3 animate-fade">
              <button
                onClick={() => setSelectedCustomer(c)}
                className="flex items-center gap-3 flex-1 min-w-0 text-right"
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 shrink-0">
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate">{c.name}</div>
                  <div className={`text-sm font-medium ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatAmount(Math.abs(balance), currency)} {currencyLabel(currency)}
                  </div>
                </div>
              </button>
              <button
                onClick={() => deleteCustomer(c.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Customer form - first name only */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="افزودن مشتری"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="btn-ghost">انصراف</button>
            <button onClick={submitCustomer} className="btn-primary">تایید</button>
          </>
        }
      >
        <div>
          <label className="label">نام</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="نام مشتری"
            onKeyDown={(e) => e.key === 'Enter' && submitCustomer()}
          />
        </div>
      </Modal>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{value}</div>
      </div>
    </div>
  )
}
