import React, { useState, useEffect, useCallback } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { db } from '../db/database'
import { Plus, Check, Search } from 'lucide-react'

export function CustomerPickerSheet({ selectedCustomerId, onSelect, onClose }) {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const loadCustomers = useCallback(async () => {
    try {
      const list = await db.customers.orderBy('transactionCount').reverse().toArray()
      setCustomers(list)
    } catch (e) {
      console.error('Failed to load customers:', e)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const filtered = search.trim()
    ? customers.filter((c) => c.name && c.name.includes(search.trim()))
    : customers

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const normalized = name.replace(/\s+/g, ' ').trim()
      const existing = await db.customers.where('name').equals(normalized).first()
      if (existing) {
        setError('این نام مشتری قبلاً ثبت شده است')
        return
      }
      const id = await db.customers.add({
        name: normalized,
        createdAt: Date.now(),
        transactionCount: 0,
      })
      await loadCustomers()
      setShowAdd(false)
      setNewName('')
      setError('')
      const newCust = await db.customers.get(id)
      if (newCust) onSelect(newCust)
    } catch (e) {
      console.error('Failed to add customer:', e)
      setError('افزودن مشتری ناموفق بود')
    }
  }

  return (
    <FullScreenSheet
      title="انتخاب مشتری"
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
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی مشتری..."
            className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
          />
        </div>
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">
              {search ? 'مشتری یافت نشد' : 'هیچ مشتری ثبت نشده است'}
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all btn-press ${
                  selectedCustomerId === c.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-card dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 tabular-nums">{c.transactionCount || 0}</span>
                  {selectedCustomerId === c.id && <Check className="w-5 h-5 text-brand-600" />}
                </div>
              </button>
            ))
          )}
        </div>
        {showAdd ? (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-scale-in">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="نام مشتری"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setError('') }}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm"
              >
                انصراف
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium disabled:opacity-50 btn-press"
              >
                تایید
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            افزودن مشتری
          </button>
        )}
      </div>
    </FullScreenSheet>
  )
}
