import React, { useState, useEffect, useCallback } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { db } from '../db/database'
import { Plus, Check, Trash2 } from 'lucide-react'

export function BillPickerSheet({ selectedBill, onSelect, onClose }) {
  const [bills, setBills] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const loadBills = useCallback(async () => {
    try {
      const list = await db.customBills.toArray()
      setBills(list)
    } catch (e) {
      console.error('Failed to load bills:', e)
    }
  }, [])

  useEffect(() => {
    loadBills()
  }, [loadBills])

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      const existing = await db.customBills.where('name').equals(name).first()
      if (existing) {
        setError('این قبض قبلاً وجود دارد')
        return
      }
      await db.customBills.add({ name, createdAt: Date.now() })
      await loadBills()
      setShowAdd(false)
      setNewName('')
      setError('')
    } catch (e) {
      console.error('Failed to add bill:', e)
      setError('افزودن قبض ناموفق بود')
    }
  }

  const handleDelete = async (id) => {
    try {
      await db.customBills.delete(id)
      await loadBills()
    } catch (e) {
      console.error('Failed to delete bill:', e)
    }
  }

  return (
    <FullScreenSheet
      title="انتخاب قبض"
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
        {bills.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">
            هیچ قبضی ثبت نشده است
          </p>
        ) : (
          bills.map((bill) => (
            <div
              key={bill.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                selectedBill === bill.name
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <button
                onClick={() => onSelect(bill.name)}
                className="flex-1 text-right text-sm text-slate-900 dark:text-slate-100 font-medium"
              >
                {bill.name}
              </button>
              <div className="flex items-center gap-2">
                {selectedBill === bill.name && <Check className="w-5 h-5 text-brand-600" />}
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
        {showAdd ? (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 mt-2 animate-scale-in">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="نام قبض"
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
            افزودن قبض
          </button>
        )}
      </div>
    </FullScreenSheet>
  )
}
