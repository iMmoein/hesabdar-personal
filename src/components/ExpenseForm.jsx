import React, { useState, useCallback, useMemo } from 'react'
import { FullScreenSheet, Toast } from './FullScreenSheet'
import { AccountPickerSheet } from './AccountPickerSheet'
import { BankSelectorSheet } from './BankSelectorSheet'
import { CustomerPickerSheet } from './CustomerPickerSheet'
import { BillPickerSheet } from './BillPickerSheet'
import { BankLogo } from './BankLogo'
import { db } from '../db/database'
import { formatInputAmount, parseAmountInput, getTodayJalali, jalaliToString, formatJalaliDateShort, getCurrentTime } from '../utils/jalali'
import { ChevronLeft, Calendar, Wallet, User, FileText, Plus } from 'lucide-react'

const CATEGORIES = [
  { key: 'payment', label: 'پرداختی' },
  { key: 'bills', label: 'قبوض' },
  { key: 'other', label: 'سایر' },
]

export function ExpenseForm({ editData, onConfirm, onClose, isDark }) {
  const today = useMemo(() => getTodayJalali(), [])

  const [amount, setAmount] = useState(editData ? formatInputAmount(editData.amount) : '')
  const [category, setCategory] = useState(editData?.categoryType || 'payment')
  const [account, setAccount] = useState(editData?.account || null)
  const [date, setDate] = useState(editData?.dateJalali || jalaliToString(today.year, today.month, today.day))
  const [description, setDescription] = useState(editData?.description || '')
  const [customer, setCustomer] = useState(editData?.customer || null)
  const [bill, setBill] = useState(editData?.bill || '')
  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [showBankSelector, setShowBankSelector] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)
  const [showBillPicker, setShowBillPicker] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleBankSelect = useCallback(async (bank) => {
    try {
      const existing = await db.accounts.where('bankId').equals(bank.bankId).first()
      if (existing && !bank.isCustom) {
        showToast('این حساب قبلاً اضافه شده است', 'error')
        setShowBankSelector(false)
        return
      }
      const id = await db.accounts.add({
        bankId: bank.bankId,
        name: bank.name,
        isCustom: bank.isCustom,
        createdAt: Date.now(),
        usageCount: 0,
      })
      const newAcc = await db.accounts.get(id)
      setShowBankSelector(false)
      if (newAcc) {
        setAccount(newAcc)
        showToast('حساب افزوده شد')
      }
    } catch (e) {
      console.error('Failed to add account:', e)
      showToast('افزودن حساب ناموفق بود', 'error')
    }
  }, [showToast])

  const handleConfirm = useCallback(() => {
    const parsedAmount = parseAmountInput(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('لطفاً مبلغ معتبر وارد کنید')
      return
    }
    if (!account) {
      setError('لطفاً حساب را انتخاب کنید')
      return
    }
    if (category === 'payment' && !customer) {
      setError('لطفاً مشتری را انتخاب کنید')
      return
    }
    if (category === 'bills' && !bill) {
      setError('لطفاً قبض را انتخاب کنید')
      return
    }

    const categoryLabel = category === 'payment' ? 'پرداختی' : category === 'bills' ? bill : 'سایر'

    onConfirm({
      amount: parsedAmount,
      categoryType: category,
      category: categoryLabel,
      accountId: account.id,
      dateJalali: date,
      description: description.trim(),
      customerId: customer?.id || null,
      customerName: customer?.name || '',
      bill: bill || '',
      time: editData?.time || getCurrentTime(),
    })
  }, [amount, category, account, date, description, customer, bill, onConfirm, editData])

  return (
    <>
      {showAccountPicker && (
        <AccountPickerSheet
          selectedAccountId={account?.id}
          onSelect={(acc) => { setAccount(acc); setShowAccountPicker(false) }}
          onClose={() => setShowAccountPicker(false)}
          isDark={isDark}
        />
      )}
      {showBankSelector && (
        <BankSelectorSheet onSelect={handleBankSelect} onClose={() => setShowBankSelector(false)} />
      )}
      {showDatePicker && (
        <DatePickerSheet
          initialDate={date}
          onConfirm={(d) => { setDate(d); setShowDatePicker(false) }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      {showCustomerPicker && (
        <CustomerPickerSheet
          selectedCustomerId={customer?.id}
          onSelect={(c) => { setCustomer(c); setShowCustomerPicker(false) }}
          onClose={() => setShowCustomerPicker(false)}
        />
      )}
      {showBillPicker && (
        <BillPickerSheet
          selectedBill={bill}
          onSelect={(b) => { setBill(b); setShowBillPicker(false) }}
          onClose={() => setShowBillPicker(false)}
        />
      )}
      <FullScreenSheet
        title={editData ? 'ویرایش هزینه' : 'ثبت هزینه جدید'}
        onClose={onClose}
        footer={
          <>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 btn-press transition-all"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-medium shadow-glow-red btn-press transition-all"
            >
              تایید
            </button>
          </>
        }
      >
        <div className="p-4 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">مبلغ</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const parsed = parseAmountInput(e.target.value)
                setAmount(parsed ? formatInputAmount(parsed) : '')
              }}
              placeholder="۰"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xl font-bold tabular-nums focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">دسته‌بندی</label>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all btn-press ${
                    category === c.key
                      ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-glow-red'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {category === 'payment' && (
            <div className="animate-fade-in">
              <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">مشتری</label>
              <button
                onClick={() => setShowCustomerPicker(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium text-right">
                  {customer?.name || 'انتخاب مشتری'}
                </span>
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          )}

          {category === 'bills' && (
            <div className="animate-fade-in">
              <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">قبض</label>
              <button
                onClick={() => setShowBillPicker(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium text-right">
                  {bill || 'انتخاب قبض'}
                </span>
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">حساب</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAccountPicker(true)}
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400 transition-all"
              >
                {account ? (
                  <>
                    <BankLogo bankId={account.bankId} name={account.name} size={36} isDark={isDark} />
                    <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium">{account.name}</span>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="flex-1 text-sm text-slate-400 text-right">انتخاب حساب</span>
                  </>
                )}
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={() => setShowBankSelector(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-medium shadow-glow-red btn-press transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                افزودن حساب
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">تاریخ</label>
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-medium text-right">
                {date ? formatJalaliDateShort(date) : 'انتخاب تاریخ'}
              </span>
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">توضیحات (اختیاری)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
            />
          </div>
        </div>
      </FullScreenSheet>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  )
}
