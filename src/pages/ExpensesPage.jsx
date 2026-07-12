import { useState, useMemo } from 'react'
import { Plus, Trash2, TrendingDown, Receipt } from 'lucide-react'
import { useStore } from '../lib/store'
import { Modal } from '../components/Modal'
import { JalaliDatePicker } from '../components/JalaliDatePicker'
import { AmountInput } from '../components/AmountInput'
import { FilterBar, filterByDate, formatFilterRange } from '../components/FilterBar'
import { formatAmount, formatJalaliLong, isoToJalali, todayJalali, jalaliToISO, toPersianDigits, currencyLabel } from '../lib/jalali'

export function ExpensesPage() {
  const { data, addExpense, deleteExpense, addCategory, currency } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showCat, setShowCat] = useState(false)
  const [filter, setFilter] = useState('all')

  const [amount, setAmount] = useState('')
  const [amountNum, setAmountNum] = useState(0)
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(todayJalali())
  const [time, setTime] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [billName, setBillName] = useState('')

  const [newCat, setNewCat] = useState('')

  const resetForm = () => {
    setAmount(''); setAmountNum(0); setAccountId(''); setCategoryId('')
    setDesc(''); setDate(todayJalali()); setTime(''); setCustomerId(''); setBillName('')
  }

  const submit = () => {
    if (!amountNum) return
    addExpense({
      amount: amountNum,
      accountId: accountId || null,
      categoryId: categoryId || null,
      description: desc,
      date: jalaliToISO(date),
      time: time || null,
      customerId: customerId || null,
      billName: billName || null,
    })
    resetForm()
    setShowForm(false)
  }

  const submitCategory = () => {
    if (!newCat.trim()) return
    addCategory(newCat.trim())
    setNewCat('')
    setShowCat(false)
  }

  const getAccount = (id) => data.accounts.find((a) => a.id === id)
  const getBank = (id) => data.banks.find((b) => b.id === id)
  const getCategory = (id) => data.categories.find((c) => c.id === id)
  const getCustomer = (id) => data.customers.find((c) => c.id === id)

  const filtered = useMemo(
    () => data.expenses.filter((e) => filterByDate(e, filter)).sort((a, b) => b.date.localeCompare(a.date)),
    [data.expenses, filter]
  )
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-4 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">هزینه ها</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">مدیریت هزینه های شما</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> هزینه جدید
        </button>
      </div>

      <div className="card p-4 bg-gradient-to-l from-rose-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-600">
            <TrendingDown size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-500 dark:text-slate-400">جمع هزینه ({formatFilterRange(filter)})</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatAmount(total, currency)} {currencyLabel(currency)}
            </div>
          </div>
        </div>
      </div>

      <FilterBar value={filter} onChange={setFilter} />

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-slate-400">
            <Receipt size={40} className="mx-auto mb-3 opacity-50" />
            <p>هنوز هزینه ای ثبت نشده است.</p>
          </div>
        )}
        {filtered.map((e) => {
          const acc = getAccount(e.accountId)
          const cat = getCategory(e.categoryId)
          const cus = getCustomer(e.customerId)
          return (
            <div key={e.id} className="card p-3 flex items-center gap-2.5 animate-fade">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                <Receipt size={18} />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {cat?.name || cus?.name || e.billName || 'هزینه'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                  <span className="whitespace-nowrap">{formatJalaliLong(isoToJalali(e.date))}</span>
                  {e.time && <span className="whitespace-nowrap">- {toPersianDigits(e.time)}</span>}
                  {acc && <span className="truncate">- {acc.name}</span>}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  -{formatAmount(e.amount, currency)}
                </div>
              </div>
              <button
                onClick={() => deleteExpense(e.id)}
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
          <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {formatAmount(total, currency)} {currencyLabel(currency)}
          </span>
        </div>
      )}

      {/* Expense form modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="هزینه جدید"
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
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input">
              <option value="">بدون حساب</option>
              {data.accounts.map((a) => {
                const b = data.banks.find((b) => b.id === a.bankId)
                const label = (a.bankId === 'other' && a.customBankName) ? a.customBankName : b?.name
                return <option key={a.id} value={a.id}>{a.name} - {label}</option>
              })}
            </select>
          </div>
          <div>
            <label className="label">دسته بندی</label>
            <div className="flex gap-2">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input flex-1">
                <option value="">بدون دسته</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowCat(true)} className="btn-ghost whitespace-nowrap">
                <Plus size={16} /> دسته جدید
              </button>
            </div>
          </div>
          <div>
            <label className="label">مشتری</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input">
              <option value="">بدون مشتری</option>
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">توضیحات</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} className="input" placeholder="توضیحات (اختیاری)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">تاریخ</label>
              <JalaliDatePicker value={date} onChange={setDate} />
            </div>
            <div>
              <label className="label">ساعت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Category form */}
      <Modal
        open={showCat}
        onClose={() => setShowCat(false)}
        title="دسته بندی جدید"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowCat(false)} className="btn-ghost">انصراف</button>
            <button onClick={submitCategory} className="btn-primary">تایید</button>
          </>
        }
      >
        <div>
          <label className="label">نام دسته</label>
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="input"
            placeholder="نام دسته بندی"
            onKeyDown={(e) => e.key === 'Enter' && submitCategory()}
          />
        </div>
      </Modal>
    </div>
  )
}
