import React, { useState, useEffect, useCallback } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { BankSelectorSheet } from './BankSelectorSheet'
import { BankLogo } from './BankLogo'
import { db } from '../db/database'
import { Plus, Check } from 'lucide-react'

export function AccountPickerSheet({ selectedAccountId, onSelect, onClose, isDark }) {
  const [accounts, setAccounts] = useState([])
  const [showBankSelector, setShowBankSelector] = useState(false)
  const [error, setError] = useState('')

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
      {showBankSelector && (
        <BankSelectorSheet onSelect={handleBankSelect} onClose={() => setShowBankSelector(false)} />
      )}
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
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">هیچ حسابی ذخیره نشده است</p>
            </div>
          ) : (
            accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onSelect(acc)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all btn-press ${
                  selectedAccountId === acc.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-card dark:hover:bg-slate-700'
                }`}
              >
                <BankLogo bankId={acc.bankId} name={acc.name} size={44} isDark={isDark} />
                <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium">{acc.name}</span>
                {selectedAccountId === acc.id && (
                  <Check className="w-5 h-5 text-brand-600" />
                )}
              </button>
            ))
          )}
          <button
            onClick={() => setShowBankSelector(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95 transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            افزودن حساب
          </button>
        </div>
      </FullScreenSheet>
    </>
  )
}
