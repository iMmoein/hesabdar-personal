import React, { useState, useEffect, useCallback } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { BankSelectorSheet } from './BankSelectorSheet'
import { BankLogo } from './BankLogo'
import { db } from '../db/database'
import ConfirmDialog from './ConfirmDialog'
import { toPersianDigits } from '../utils/jalali'
import { Plus, Check, Wallet, Trash2 } from 'lucide-react'

export function AccountPickerSheet({ selectedAccountId, onSelect, onClose, isDark }) {
  const [accounts, setAccounts] = useState([])
  const [showBankSelector, setShowBankSelector] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteUsageCount, setDeleteUsageCount] = useState(0)

  const loadAccounts = useCallback(async () => {
    try {
      const accs = await db.accounts.orderBy('usageCount').reverse().toArray()
      setAccounts(accs)
    } catch (e) {
      console.error('Failed to load accounts:', e)
      setError('بارگذاری حساب‌ها ناموفق بود')
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleDeleteAccount = async (account) => {
    try {
      const usageCount = await db.transactions.where('accountId').equals(account.id).count()
      setDeleteUsageCount(usageCount)
      setDeleteTarget(account)
    } catch (e) {
      console.error('Failed to check account usage:', e)
    }
  }

  const confirmDeleteAccount = async () => {
    if (!deleteTarget) return
    try {
      await db.accounts.delete(deleteTarget.id)
      await loadAccounts()
      setToast('حساب با موفقیت حذف شد')
      setTimeout(() => setToast(null), 2500)
    } catch (e) {
      console.error('Failed to delete account:', e)
      setError('حذف حساب ناموفق بود')
    } finally {
      setDeleteTarget(null)
      setDeleteUsageCount(0)
    }
  }

  const handleBankSelect = async (bank) => {
    try {
      const existing = await db.accounts.where('bankId').equals(bank.bankId).first()
      if (existing && !bank.isCustom) {
        setError('این حساب قبلاً اضافه شده است')
        return
      }
      const id = await db.accounts.add({
        bankId: bank.bankId,
        name: bank.name,
        isCustom: bank.isCustom,
        createdAt: Date.now(),
        usageCount: 0,
      })
      await loadAccounts()
      setShowBankSelector(false)
      const newAcc = await db.accounts.get(id)
      if (newAcc) onSelect(newAcc)
    } catch (e) {
      console.error('Failed to add account:', e)
      setError('افزودن حساب ناموفق بود')
    }
  }

  return (
    <>
      <FullScreenSheet
        title="انتخاب حساب"
        onClose={onClose}
        footer={
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 btn-press transition-all"
          >
            انصراف
          </button>
        }
      >
        <div className="p-4 space-y-2">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {accounts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-5">
                <Wallet className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">هنوز حسابی اضافه نکرده‌اید</p>
              <button
                onClick={() => setShowBankSelector(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium shadow-glow btn-press transition-all"
              >
                افزودن حساب جدید
              </button>
            </div>
          ) : (
            <>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    selectedAccountId === acc.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-card dark:hover:bg-slate-700'
                  }`}
                >
                  <button
                    onClick={() => onSelect(acc)}
                    className="flex-1 flex items-center gap-3 text-right"
                  >
                    <BankLogo bankId={acc.bankId} name={acc.name} size={44} isDark={isDark} />
                    <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium">{acc.name}</span>
                    {selectedAccountId === acc.id && (
                      <Check className="w-5 h-5 text-brand-600" />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteAccount(acc) }}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors shrink-0"
                    aria-label="حذف حساب"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowBankSelector(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                افزودن حساب
              </button>
            </>
          )}
        </div>
      </FullScreenSheet>
      {showBankSelector && (
        <BankSelectorSheet onSelect={handleBankSelect} onClose={() => setShowBankSelector(false)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white text-sm shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف حساب"
        message={deleteUsageCount > 0
          ? `این حساب دارای ${toPersianDigits(deleteUsageCount)} تراکنش است. با حذف حساب، تراکنش‌ها باقی می‌مانند ولی بدون حساب نمایش داده می‌شوند. آیا مطمئنید؟`
          : 'آیا از حذف این حساب اطمینان دارید؟'}
        confirmText="حذف"
        cancelText="انصراف"
        danger
        onConfirm={confirmDeleteAccount}
        onCancel={() => { setDeleteTarget(null); setDeleteUsageCount(0) }}
      />
    </>
  )
}
