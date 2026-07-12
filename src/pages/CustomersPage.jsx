import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Users, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore, DEFAULT_BANKS } from '../lib/store'
import { formatAmount, formatJalaliLong, todayISO, filterByDate, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import BankLogo from '../components/BankLogo'
import FilterBar from '../components/FilterBar'
import { pushBackHandler, popBackHandler } from '../lib/backButtonRegistry'

export default function CustomersPage() {
  const { customers, revenues, expenses, accounts, categories, currency, addCustomer, deleteCustomer } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [filter, setFilter] = useState('all')
  const [detailTx, setDetailTx] = useState(null)

  const formDirty = useMemo(() => Boolean(newName.trim()), [newName])

  const handleAdd = () => {
    if (!newName.trim()) return
    addCustomer({ name: newName.trim() })
    setNewName('')
    setShowForm(false)
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
    const txs = filterByDate(allTxs, filter)
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

        <FilterBar filter={filter} onChange={setFilter} />

        <div className="space-y-2">
          {txs.length === 0 && (
            <div className="card p-8 text-center text-slate-400">
              <p>تراکنشی برای این مشتری ثبت نشده</p>
            </div>
          )}
          {txs.map((tx) => {
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
                <div className={`p-2 rounded-full ${isRev ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
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
                <p className={`font-bold ${isRev ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
        <button onClick={() => setShowForm(true)} className="btn-primary">
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
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                {c.name.charAt(0)}
              </div>
              <button onClick={() => setSelectedCustomer(c)} className="flex-1 text-right min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                <p className="text-xs text-slate-400">{toPersianDigits(txCount)} تراکنش</p>
              </button>
              <div className="text-left">
                <p className={`text-sm font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatAmount(Math.abs(balance), currency)}
                </p>
              </div>
              <button onClick={() => deleteCustomer(c.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setNewName('') }}
        title="افزودن مشتری"
        dirty={formDirty}
        onSave={handleAdd}
        onDiscard={() => { setShowForm(false); setNewName('') }}
        footer={({ attemptClose }) => (
          <div className="flex gap-2">
            <button onClick={attemptClose} className="btn-ghost flex-1">انصراف</button>
            <button onClick={handleAdd} className="btn-primary flex-1">افزودن</button>
          </div>
        )}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="نام مشتری" autoFocus />
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  )
}
