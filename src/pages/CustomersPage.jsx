import { useState, useMemo } from 'react'
import { Plus, CreditCard as Edit2, Trash2, Users } from 'lucide-react'
import { formatAmount, formatJalaliLong, getJalaliWeekdayName, toPersianDigits } from '../lib/jalali'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function CustomersPage({ store }) {
  const { customers, revenues, expenses, addCustomer, updateCustomer, deleteCustomer, settings } = store
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [detailCustomer, setDetailCustomer] = useState(null)

  const customerBalances = useMemo(() => {
    const map = {}
    customers.forEach((c) => { map[c.id] = { rev: 0, exp: 0, count: 0 } })
    revenues.forEach((r) => { if (r.customerId && map[r.customerId]) { map[r.customerId].rev += Number(r.amount || 0); map[r.customerId].count++ } })
    expenses.forEach((e) => { if (e.customerId && map[e.customerId]) { map[e.customerId].exp += Number(e.amount || 0); map[e.customerId].count++ } })
    return map
  }, [customers, revenues, expenses])

  const openAdd = () => { setName(''); setEditingId(null); setModalOpen(true) }
  const openEdit = (c) => { setName(c.name); setEditingId(c.id); setModalOpen(true) }

  const handleSave = () => {
    if (!name.trim()) return
    if (editingId) updateCustomer(editingId, name)
    else addCustomer(name)
    setModalOpen(false)
  }

  const detailTransactions = useMemo(() => {
    if (!detailCustomer) return []
    const revs = revenues.filter((r) => r.customerId === detailCustomer.id).map((r) => ({ ...r, type: 'income' }))
    const exps = expenses.filter((e) => e.customerId === detailCustomer.id).map((e) => ({ ...e, type: 'expense' }))
    return [...revs, ...exps].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [detailCustomer, revenues, expenses])

  const cur = settings.currency

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">اشخاص</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1">
          <Plus size={20} /> افزودن
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="card p-8 text-center">
          <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-slate-500 dark:text-slate-400">هنوز شخصی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const bal = customerBalances[c.id] || { rev: 0, exp: 0, count: 0 }
            const net = bal.rev - bal.exp
            return (
              <div key={c.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-800/40 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
                <button onClick={() => setDetailCustomer(c)} className="flex-1 text-right min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {toPersianDigits(bal.count)} تراکنش • مانده: <span className={net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatAmount(net, cur)}</span>
                  </p>
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-90">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90">
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
        onClose={() => setModalOpen(false)}
        title={editingId ? 'ویرایش شخص' : 'افزودن شخص'}
        footer={<button onClick={handleSave} disabled={!name.trim()} className="btn-primary w-full disabled:opacity-50">{editingId ? 'ذخیره' : 'افزودن'}</button>}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نام شخص</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="نام..." autoFocus />
        </div>
      </Modal>

      <Modal
        open={!!detailCustomer}
        onClose={() => setDetailCustomer(null)}
        title={detailCustomer?.name || ''}
        size="lg"
        footer={
          <button onClick={() => setDetailCustomer(null)} className="btn-primary w-full">بستن</button>
        }
      >
        {detailTransactions.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">تراکنشی برای این شخص ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {detailTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="min-w-0">
                  <p className={`font-bold amount-text ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount, cur)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatJalaliLong(t.date)} • {getJalaliWeekdayName(t.date)}</p>
                  {t.description && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{t.description}</p>}
                </div>
                <span className={`chip text-xs ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {t.type === 'income' ? 'درآمد' : 'هزینه'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="حذف شخص"
        message="آیا از حذف این شخص مطمئن هستید؟ تراکنش‌های مرتبط حذف نمی‌شوند."
        danger
        confirmText="حذف"
        onConfirm={() => { deleteCustomer(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
