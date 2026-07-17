import React from 'react'
import { BankLogo } from './BankLogo'
import { formatJalaliDate, formatAmount, toPersianDigits } from '../utils/jalali'
import { Pencil, Trash2 } from 'lucide-react'

export const TransactionCard = React.memo(function TransactionCard({ tx, account, currency, isDark, onEdit, onDelete }) {
  const isRevenue = tx.type === 'revenue'
  const amountColor = isRevenue ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 card-press border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center gap-3">
        <BankLogo bankId={account?.bankId} name={account?.name} size={44} isDark={isDark} />
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {account?.name || 'نامشخص'}
          </span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {formatJalaliDate(tx.dateJalali)}
            {tx.time && ` • ${toPersianDigits(tx.time)}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(tx)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
              aria-label="ویرایش"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(tx)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
              aria-label="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
        {tx.category && (
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg">
            {tx.category}
          </span>
        )}
        {!tx.category && <span />}
        <span className={`text-base font-bold tabular-nums ${amountColor}`}>
          {isRevenue ? '+' : '-'} {formatAmount(tx.amount, currency)}
        </span>
      </div>
      {tx.description && (
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
          {tx.description}
        </div>
      )}
    </div>
  )
})
