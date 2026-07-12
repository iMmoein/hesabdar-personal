import { useState, useMemo } from 'react'
import { Plus, Trash2, Receipt, Wallet, Clock, Pencil } from 'lucide-react'
import { useStore, DEFAULT_BANKS } from '../lib/store'
import { formatAmount, formatJalaliLong, todayISO, filterByDate, sortByDate, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import SortButton from '../components/SortButton'
import AmountInput from '../components/AmountInput'
import JalaliDatePicker from '../components/JalaliDatePicker'
import ConfirmActionDialog from '../components/ConfirmActionDialog'

export default function ExpensesPage() {
  const {
    expenses, accounts, categories, billNames, customers, currency,
    addExpense, updateExpense, deleteExpense, addAccount, addCategory,
    addBillName, deleteBillName, addCustomer
  } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showBillManager, setShowBillManager] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editConfirm, setEditConfirm] = useState(false)

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [billNameId, setBillNameId] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newBillName, setNewBillName] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')

  const filtered = filterByDate(expenses, filter, 'date', selectedMonth)
  const sorted = sortByDate(filtered, sortDir)
  const total = filtered.reduce((s, e) => s + Number(e.amount || 0), 0)

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const isPayment = selectedCategory?.id === 'payment' || selectedCategory?.name === 'پرداختی'
  const isBills = selectedCategory?.id === 'bills' || selectedCategory?.name === 'قبوض'

  const formDirty = useMemo(
    () => Boolean(amount) || Boolean(categoryId) || Boolean(accountId) ||
       date !== todayISO() || Boolean(time) || Boolean(description) ||
       Boolean(customerId) || Boolean(billNameId),
    [amount, categoryId, accountId, date, time, description, customerId, billNameId]
  )

  const categoryDirty = useMemo(() => Boolean(newCategoryName.trim()), [newCategoryName])
  const billDirty = useMemo(() => Boolean(newBillName.trim()), [newBillName])
  const customerDirty = useMemo(() => Boolean(newCustomerName.trim()), [newCustomerName])

  const resetForm = () => {
    setAmount(''); setCategoryId(''); setAccountId(''); setDate(todayISO())
    setTime(''); setDescription(''); setCustomerId(''); setBillNameId(''); setEditingId(null)
  }

  const openAddForm = () => { resetForm(); setShowForm(true) }

  const openEditForm = (exp) => {
    setEditingId(exp.id)
    setAmount(exp.amount)
    setCategoryId(exp.categoryId || '')
    setAccountId(exp.accountId)
    setDate(exp.date)
    setTime(exp.time || '')
    setDescription(exp.description || '')
    setCustomerId(exp.customerId || '')
    setBillNameId(exp.billNameId || '')
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!amount || !categoryId || !accountId) return
    if (editingId) {
      setEditConfirm(true)
    } else {
      addExpense({
        amount: Number(amount), categoryId, accountId, date, time,
        description, customerId: isPayment ? customerId : '',
        billNameId: isBills ? billNameId : ''
      })
      resetForm()
      setShowForm(false)
    }
  }

  const confirmEdit = () => {
    updateExpense(editingId, {
      amount: Number(amount), categoryId, accountId, date, time,
      description, customerId: isPayment ? customerId : '',
      billNameId: isBills ? billNameId : ''
    })
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

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    const cat = addCategory({ name: newCategoryName.trim() })
    setCategoryId(cat.id)
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const handleAddBill = () => {
    if (!newBillName.trim()) return
    const bill = addBillName(newBillName.trim())
    setBillNameId(bill.id)
    setNewBillName('')
  }

  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) return
    const cust = addCustomer({ name: newCustomerName.trim() })
    setCustomerId(cust.id)
    setNewCustomerName('')
    setShowAddCustomer(false)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteExpense(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">هزینه‌ها</h1>
        <button onClick={openAddForm} className="btn-primary">
          <Plus size={20} /> ثبت هزینه
        </button>
      </div>

      <FilterBar filter={filter} onChange={setFilter} selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />

      <div className="flex items-center justify-between">
        <div className="card p-3 flex-1 mr-2 bg-gradient-to-l from-red-50 to-white dark:from-red-900/20 dark:to-slate-800/80">
          <p className="text-sm text-slate-500 dark:text-slate-400">مجموع هزینه‌ها</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{formatAmount(total, currency)}</p>
        </div>
        <SortButton sortDir={sortDir} onChange={setSortDir} />
      </div>

      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="card p-8 text-center text-slate-400">
            <Receipt size={40} className="mx-auto mb-2 opacity-40" />
            <p>هنوز هزینه‌ای ثبت نشده است</p>
          </div>
        )}
        {sorted.map((exp) => {
          const acc = accounts.find((a) => a.id === exp.accountId)
          const bank = DEFAULT_BANKS.find((b) => b.id === acc?.bankId)
          const cat = categories.find((c) => c.id === exp.categoryId)
          const cust = customers.find((c) => c.id === exp.customerId)
          const bill = billNames.find((b) => b.id === exp.billNameId)
          return (
            <div key={exp.id} className="card p-3 flex items-center gap-3">
              <button onClick={() => openEditForm(exp)} className="flex items-center gap-3 flex-1 min-w-0 text-right">
                <BankLogo bank={bank} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{cat?.name || 'نامشخص'}</span>
                    {cust && <span className="text-xs text-slate-400">• {cust.name}</span>}
                    {bill && <span className="text-xs text-slate-400">• {bill.name}</span>}
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatJalaliLong(exp.date)}
                    {exp.time && ` • ${toPersianDigits(exp.time)}`}
                  </p>
                </div>
                <p className="font-bold text-red-600 dark:text-red-400 whitespace-nowrap">-{formatAmount(exp.amount, currency)}</p>
              </button>
              <button onClick={() => openEditForm(exp)} className="p-2 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 shrink-0">
                <Pencil size={16} />
              </button>
              <button onClick={() => setDeleteTarget(exp)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); resetForm() }}
        title={editingId ? 'ویرایش هزینه' : 'ثبت هزینه'}
        size="lg"
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
            <label className="label">دسته‌بندی</label>
            <div className="flex gap-2">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input flex-1">
                <option value="">انتخاب دسته</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => setShowAddCategory(true)} className="btn-ghost px-3"><Plus size={18} /></button>
            </div>
          </div>

          {isPayment && (
            <div>
              <label className="label">مشتری</label>
              <div className="flex gap-2">
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input flex-1">
                  <option value="">انتخاب مشتری</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowAddCustomer(true)} className="btn-ghost px-3"><Plus size={18} /></button>
              </div>
            </div>
          )}

          {isBills && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">نام قبض</label>
                <button onClick={() => setShowBillManager(true)} className="text-xs text-brand-600 dark:text-brand-400">مدیریت قبوض</button>
              </div>
              <select value={billNameId} onChange={(e) => setBillNameId(e.target.value)} className="input">
                <option value="">انتخاب قبض</option>
                {billNames.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="label">حساب مبدأ</label>
            <div className="flex gap-2">
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input flex-1">
                <option value="">انتخاب حساب</option>
                {accounts.map((a) => {
                  const bank = DEFAULT_BANKS.find((b) => b.id === a.bankId)
                  return <option key={a.id} value={a.id}>{bank?.name || a.name}</option>
                })}
              </select>
              <button onClick={() => setShowBankPicker(true)} className="btn-ghost px-3"><Wallet size={18} /></button>
            </div>
          </div>
          <div>
            <label className="label">تاریخ</label>
            <JalaliDatePicker value={date} onChange={setDate} />
          </div>
          <div>
            <label className="label">ساعت</label>
            <div className="relative">
              <Clock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input pr-10" />
            </div>
          </div>
          <div>
            <label className="label">توضیحات</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px] resize-none" placeholder="توضیحات اختیاری..." />
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

      <Modal
        open={showAddCategory}
        onClose={() => { setShowAddCategory(false); setNewCategoryName('') }}
        title="افزودن دسته‌بندی"
        dirty={categoryDirty}
        onSave={handleAddCategory}
        onDiscard={() => { setShowAddCategory(false); setNewCategoryName('') }}
        footer={({ attemptClose }) => (
          <div className="flex gap-2">
            <button onClick={attemptClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleAddCategory} className="btn-primary flex-1">افزودن</button>
          </div>
        )}
      >
        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="input" placeholder="نام دسته‌بندی" autoFocus />
      </Modal>

      <Modal
        open={showBillManager}
        onClose={() => { setShowBillManager(false); setNewBillName('') }}
        title="مدیریت قبوض"
        size="lg"
        dirty={billDirty}
        onDiscard={() => { setShowBillManager(false); setNewBillName('') }}
        footer={({ attemptClose }) => (
          <button onClick={attemptClose} className="btn-ghost w-full">بستن</button>
        )}
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newBillName} onChange={(e) => setNewBillName(e.target.value)} className="input" placeholder="نام قبض (مثلاً برق، آب، گاز)" />
            <button onClick={handleAddBill} className="btn-primary px-3"><Plus size={18} /></button>
          </div>
          <div className="space-y-2">
            {billNames.length === 0 && <p className="text-sm text-slate-400 text-center py-4">هنوز قبضی اضافه نشده</p>}
            {billNames.map((b) => (
              <div key={b.id} className="card p-3 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200">{b.name}</span>
                <button onClick={() => deleteBillName(b.id)} className="p-2 text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={showAddCustomer}
        onClose={() => { setShowAddCustomer(false); setNewCustomerName('') }}
        title="افزودن مشتری"
        dirty={customerDirty}
        onSave={handleAddCustomer}
        onDiscard={() => { setShowAddCustomer(false); setNewCustomerName('') }}
        footer={({ attemptClose }) => (
          <div className="flex gap-2">
            <button onClick={attemptClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleAddCustomer} className="btn-primary flex-1">افزودن</button>
          </div>
        )}
      >
        <input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} className="input" placeholder="نام مشتری" autoFocus />
      </Modal>

      <ConfirmActionDialog
        open={editConfirm}
        onConfirm={confirmEdit}
        onCancel={() => setEditConfirm(false)}
        title="ویرایش هزینه"
        message="آیا از ویرایش این مورد اطمینان دارید؟"
        confirmLabel="ذخیره تغییرات"
      />

      <ConfirmActionDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="حذف هزینه"
        message="آیا از حذف این مورد اطمینان دارید؟"
        confirmLabel="حذف"
        confirmClass="btn-danger"
      />
    </div>
  )
}
