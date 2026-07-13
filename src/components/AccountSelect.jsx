import { useState } from 'react'
import { Plus, Check, Trash2, ChevronDown } from 'lucide-react'
import { DEFAULT_BANKS } from '../lib/banks'
import BankLogo from './BankLogo'
import ConfirmDialog from './ConfirmDialog'

export default function AccountSelect({ accounts, sortedAccounts, accountUsage, allBanks, value, onChange, onAddAccount, onDeleteAccount }) {
  const [showAdd, setShowAdd] = useState(false)
  const [selectedBankId, setSelectedBankId] = useState('')
  const [customName, setCustomName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const selectedAccount = accounts.find((a) => a.id === value) || null

  const handleAdd = () => {
    if (!selectedBankId) return
    const { account } = onAddAccount(selectedBankId, customName.trim())
    onChange(account.id)
    setShowAdd(false)
    setSelectedBankId('')
    setCustomName('')
  }

  const handleDelete = (id) => {
    onDeleteAccount(id)
    if (value === id) onChange('')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">حساب بانکی</label>

      {selectedAccount && !showAdd ? (
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-2.5">
          <BankLogo bank={{ id: selectedAccount.bankId, name: selectedAccount.name, svg: selectedAccount.logo ? selectedAccount.logo.replace('banks/', '') : null }} size={36} />
          <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">{selectedAccount.name}</span>
          <button onClick={() => setDeleteTarget(selectedAccount)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90">
            <Trash2 size={16} />
          </button>
          <button onClick={() => { setShowAdd(true); onChange('') }} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition active:scale-90">
            <ChevronDown size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="max-h-48 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
            {sortedAccounts.length === 0 && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">هنوز حسابی اضافه نشده است</p>
            )}
            {sortedAccounts.map((acc) => {
              const usage = accountUsage[acc.id] || 0
              return (
                <button
                  key={acc.id}
                  onClick={() => { onChange(acc.id); setShowAdd(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 transition active:scale-[0.98] border-b border-slate-100 dark:border-slate-700 last:border-0 ${
                    value === acc.id ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <BankLogo bank={{ id: acc.bankId, name: acc.name, svg: acc.logo ? acc.logo.replace('banks/', '') : null }} size={32} />
                  <span className="flex-1 text-right font-medium text-slate-800 dark:text-slate-100">{acc.name}</span>
                  {usage > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">{toFa(usage)} بار</span>
                  )}
                  {value === acc.id && <Check size={18} className="text-brand-600" />}
                </button>
              )
            })}
          </div>

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition active:scale-95">
              <Plus size={18} /> افزودن حساب
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="input-field"
              >
                <option value="">انتخاب بانک...</option>
                {DEFAULT_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {selectedBankId === 'other' && (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="نام حساب (مثلاً کیف پول)"
                  className="input-field"
                />
              )}
              <div className="flex gap-2">
                <button onClick={() => { setShowAdd(false); setSelectedBankId(''); setCustomName('') }} className="btn-ghost flex-1">انصراف</button>
                <button onClick={handleAdd} disabled={!selectedBankId} className="btn-primary flex-1 disabled:opacity-50">افزودن</button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف حساب"
        message={`آیا از حذف حساب «${deleteTarget?.name}» مطمئن هستید؟ تراکنش‌های مرتبط حذف نمی‌شوند.`}
        danger
        confirmText="حذف"
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function toFa(n) { return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]) }
