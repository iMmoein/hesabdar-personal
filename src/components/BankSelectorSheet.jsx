import React, { useState } from 'react'
import { FullScreenSheet } from './FullScreenSheet'
import { BANKS, getBankLogoUrl } from '../utils/banks'
import { Search, Check, Plus } from 'lucide-react'

export function BankSelectorSheet({ onSelect, onClose }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? BANKS.filter((b) => b.name.includes(search.trim()))
    : BANKS

  const handleSelect = (bank) => {
    onSelect({ bankId: bank.id, name: bank.name, isCustom: false })
  }

  const handleCustomConfirm = () => {
    if (!customName.trim()) return
    onSelect({ bankId: 'other', name: customName.trim(), isCustom: true })
  }

  return (
    <FullScreenSheet
      title="انتخاب بانک"
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
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی بانک..."
            className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {filtered.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleSelect(bank)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-400 hover:shadow-card dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src={getBankLogoUrl(bank.logo)}
                  alt={bank.name}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className="w-full h-full rounded-2xl items-center justify-center text-white font-bold"
                  style={{ backgroundColor: bank.color, fontSize: 18, display: 'none' }}
                >
                  {bank.name.charAt(0)}
                </div>
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-200 text-center leading-tight font-medium">{bank.name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-200 text-center font-medium">سایر</span>
          </button>
        </div>

        {showCustom && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-scale-in">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">نام حساب دلخواه</h3>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="نام حساب را وارد کنید"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 outline-none transition-all"
              autoFocus
            />
            <button
              onClick={handleCustomConfirm}
              disabled={!customName.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white text-sm font-medium disabled:opacity-50 btn-press transition-all"
            >
              تایید
            </button>
          </div>
        )}
      </div>
    </FullScreenSheet>
  )
}
