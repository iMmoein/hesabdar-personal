import React, { useState, useCallback, useEffect } from 'react'
import { TransactionCard } from './TransactionCard'
import { db } from '../db/database'

const PAGE_SIZE = 30

export function TransactionList({ transactions, currency, isDark, onEdit, onDelete }) {
  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, transactions.length))
  const [accountsMap, setAccountsMap] = useState({})

  useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, transactions.length))
  }, [transactions])

  useEffect(() => {
    let mounted = true
    const accountIds = [...new Set(transactions.map((t) => t.accountId).filter(Boolean))]
    if (accountIds.length === 0) return
    db.accounts.bulkGet(accountIds).then((accs) => {
      if (!mounted) return
      const map = {}
      accs.forEach((a) => { if (a) map[a.id] = a })
      setAccountsMap(map)
    }).catch(() => {})
    return () => { mounted = false }
  }, [transactions])

  const visible = transactions.slice(0, visibleCount)

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, transactions.length))
  }, [transactions.length])

  if (visible.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600">
            <path d="M3 3h18v18H3z" opacity="0.3" />
            <path d="M3 9h18M9 3v18" />
          </svg>
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-sm">تراکنشی یافت نشد</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {visible.map((tx) => (
        <TransactionCard
          key={tx.id}
          tx={tx}
          account={accountsMap[tx.accountId]}
          currency={currency}
          isDark={isDark}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {visibleCount < transactions.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          نمایش بیشتر
        </button>
      )}
    </div>
  )
}
