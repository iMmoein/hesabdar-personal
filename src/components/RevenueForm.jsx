import React, { useState, useCallback, useMemo } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { AccountPickerSheet } from './AccountPickerSheet'
import { DatePickerSheet } from './DatePickerSheet'
import { BankLogo } from './BankLogo'
import { formatInputAmount, parseAmountInput, getTodayJalali, jalaliToString, formatJalaliDateShort } from '../utils/jalali'
import { ChevronLeft, Calendar, Wallet } from 'lucide-react'

export function RevenueForm({ editData, onConfirm, onClose, isDark }) {
  const today = useMemo(() => getTodayJalali(), [])

  const [amount, setAmount] = useState(editData ? formatInputAmount(editData.amount) : '')
  const [account, setAccount] = useState(editData?.account || null)
  const [date, setDate] = useState(editData?.dateJalali || jalaliToString(today.year, today.month, today.day))
  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [error, setError] = useState('')

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
    onConfirm({
      amount: parsedAmount,
      accountId: account.id,
      dateJalali: date,
    })
  }, [amount, account, date, onConfirm])

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
      {showDatePicker && (
        <DatePickerSheet
          initialDate={date}
          onConfirm={(d) => { setDate(d); setShowDatePicker(false) }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      <FullScreenSheet
        title={editData ? 'ویرایش درآمد' : 'ثبت درآمد جدید'}
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium shadow-glow btn-press transition-all"
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

          <div className="float-label">
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
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xl font-bold tabular-nums focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">حساب</label>
            <button
              onClick={() => setShowAccountPicker(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-brand-400 transition-all"
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
        </div>
      </FullScreenSheet>
    </>
  )
}
