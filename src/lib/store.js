// Global data store using localStorage with safe defaults.
// Includes saved accounts system, migration, and backup v2.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { migrateOldDates, todayJalaliString, jalaliDateForFilename } from './jalali'
import { DEFAULT_BANKS, DEFAULT_BILLS } from './banks'

const STORAGE_KEYS = {
  revenues: 'hesabdar_revenues',
  expenses: 'hesabdar_expenses',
  customers: 'hesabdar_customers',
  accounts: 'hesabdar_accounts',
  customBills: 'hesabdar_custom_bills',
  customBanks: 'hesabdar_custom_banks',
  settings: 'hesabdar_settings'
}

const DEFAULT_SETTINGS = { theme: 'light', currency: 'rial' }

function safeParse(key, fallback) {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw) } catch { return fallback }
}
function safeSave(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { console.error('Save failed', key, e) } }

function migrateAccounts(revenues, expenses, existingAccounts) {
  const accounts = [...existingAccounts]
  const findOrCreate = (bankId, bankName, customBankName) => {
    const name = bankId === 'other' ? (customBankName || bankName || 'سایر') : (bankName || '')
    let acc = accounts.find((a) => a.bankId === bankId && (bankId === 'other' ? a.name === name : true))
    if (acc) return acc
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)
    acc = {
      id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      bankId: bankId || 'other',
      name: name || bank?.name || 'سایر',
      logo: bank?.svg ? `banks/${bank.svg}` : null,
      isCustom: bankId === 'other' || !bank,
      createdAt: new Date().toISOString()
    }
    accounts.push(acc)
    return acc
  }

  const migrateItem = (item) => {
    if (item.accountId) {
      const acc = accounts.find((a) => a.id === item.accountId)
      if (acc) return item
    }
    if (item.bankId || item.bankName || item.sourceBankId || item.sourceBankName) {
      const bid = item.bankId || item.sourceBankId || 'other'
      const bname = item.bankName || item.sourceBankName || ''
      const cname = item.customBankName || ''
      const acc = findOrCreate(bid, bname, cname)
      return { ...item, accountId: acc.id }
    }
    return item
  }

  const newRevenues = revenues.map(migrateItem)
  const newExpenses = expenses.map(migrateItem)
  return { newRevenues, newExpenses, newAccounts: accounts }
}

export function useStore() {
  const [revenues, setRevenuesRaw] = useState(() => migrateOldDates(safeParse(STORAGE_KEYS.revenues, []), 'date'))
  const [expenses, setExpensesRaw] = useState(() => migrateOldDates(safeParse(STORAGE_KEYS.expenses, []), 'date'))
  const [customers, setCustomers] = useState(() => safeParse(STORAGE_KEYS.customers, []))
  const [accounts, setAccounts] = useState(() => safeParse(STORAGE_KEYS.accounts, []))
  const [customBills, setCustomBills] = useState(() => safeParse(STORAGE_KEYS.customBills, []))
  const [customBanks, setCustomBanks] = useState(() => safeParse(STORAGE_KEYS.customBanks, []))
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...safeParse(STORAGE_KEYS.settings, {}) }))

  useEffect(() => {
    setRevenuesRaw((prevRev) => {
      setExpensesRaw((prevExp) => {
        const { newRevenues, newExpenses, newAccounts } = migrateAccounts(prevRev, prevExp, accounts)
        if (newAccounts.length !== accounts.length) setAccounts(newAccounts)
        if (JSON.stringify(newRevenues) !== JSON.stringify(prevRev)) setRevenuesRaw(newRevenues)
        if (JSON.stringify(newExpenses) !== JSON.stringify(prevExp)) setExpensesRaw(newExpenses)
        return newExpenses
      })
      return prevRev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { safeSave(STORAGE_KEYS.revenues, revenues) }, [revenues])
  useEffect(() => { safeSave(STORAGE_KEYS.expenses, expenses) }, [expenses])
  useEffect(() => { safeSave(STORAGE_KEYS.customers, customers) }, [customers])
  useEffect(() => { safeSave(STORAGE_KEYS.accounts, accounts) }, [accounts])
  useEffect(() => { safeSave(STORAGE_KEYS.customBills, customBills) }, [customBills])
  useEffect(() => { safeSave(STORAGE_KEYS.customBanks, customBanks) }, [customBanks])
  useEffect(() => { safeSave(STORAGE_KEYS.settings, settings) }, [settings])
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [settings.theme])

  const setRevenues = useCallback((updater) => { setRevenuesRaw((prev) => migrateOldDates(typeof updater === 'function' ? updater(prev) : updater, 'date')) }, [])
  const setExpenses = useCallback((updater) => { setExpensesRaw((prev) => migrateOldDates(typeof updater === 'function' ? updater(prev) : updater, 'date')) }, [])

  const allBanks = useMemo(() => [...DEFAULT_BANKS, ...customBanks], [customBanks])
  const allBills = useMemo(() => [...DEFAULT_BILLS, ...customBills], [customBills])

  const accountUsage = useMemo(() => {
    const counts = {}
    revenues.forEach((r) => { if (r.accountId) counts[r.accountId] = (counts[r.accountId] || 0) + 1 })
    expenses.forEach((e) => { if (e.accountId) counts[e.accountId] = (counts[e.accountId] || 0) + 1 })
    return counts
  }, [revenues, expenses])

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      const ca = accountUsage[a.id] || 0
      const cb = accountUsage[b.id] || 0
      if (ca !== cb) return cb - ca
      return a.name.localeCompare(b.name, 'fa')
    })
  }, [accounts, accountUsage])

  const addAccount = useCallback((bankId, customName) => {
    const bank = DEFAULT_BANKS.find((b) => b.id === bankId)
    const name = bankId === 'other' ? (customName || 'سایر') : (bank?.name || customName || 'سایر')
    const existing = accounts.find((a) => a.bankId === bankId && (bankId === 'other' ? a.name === name : true))
    if (existing) return { account: existing, isDuplicate: true }
    const acc = {
      id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      bankId,
      name,
      logo: bank?.svg ? `banks/${bank.svg}` : null,
      isCustom: bankId === 'other' || !bank,
      createdAt: new Date().toISOString()
    }
    setAccounts((prev) => [...prev, acc])
    return { account: acc, isDuplicate: false }
  }, [accounts])

  const deleteAccount = useCallback((id) => { setAccounts((prev) => prev.filter((a) => a.id !== id)) }, [])

  const addRevenue = useCallback((data) => { const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; setRevenues((prev) => [{ id, createdAt: new Date().toISOString(), ...data }, ...prev]); return id }, [setRevenues])
  const updateRevenue = useCallback((id, data) => { setRevenues((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r)) }, [setRevenues])
  const deleteRevenue = useCallback((id) => { setRevenues((prev) => prev.filter((r) => r.id !== id)) }, [setRevenues])

  const addExpense = useCallback((data) => { const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; setExpenses((prev) => [{ id, createdAt: new Date().toISOString(), ...data }, ...prev]); return id }, [setExpenses])
  const updateExpense = useCallback((id, data) => { setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, ...data } : e)) }, [setExpenses])
  const deleteExpense = useCallback((id) => { setExpenses((prev) => prev.filter((e) => e.id !== id)) }, [setExpenses])

  const addCustomer = useCallback((name) => { const id = `cus_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; setCustomers((prev) => [{ id, name: name.trim(), createdAt: new Date().toISOString() }, ...prev]); return id }, [])
  const updateCustomer = useCallback((id, name) => { setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, name: name.trim() } : c)) }, [])
  const deleteCustomer = useCallback((id) => { setCustomers((prev) => prev.filter((c) => c.id !== id)) }, [])

  const addCustomBill = useCallback((name) => { const id = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; setCustomBills((prev) => [...prev, { id, name: name.trim() }]); return id }, [])
  const deleteCustomBill = useCallback((id) => { setCustomBills((prev) => prev.filter((b) => b.id !== id)) }, [])

  const addCustomBank = useCallback((name) => { const id = `bank_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; setCustomBanks((prev) => [...prev, { id, name: name.trim(), svg: null }]); return id }, [])

  const updateSettings = useCallback((patch) => { setSettings((prev) => ({ ...prev, ...patch })) }, [])

  const exportBackup = useCallback(() => {
    const data = { revenues, expenses, customers, accounts, customBills, customBanks, settings }
    return JSON.stringify({ appName: 'حسابدار شخصی', backupVersion: 2, createdAt: new Date().toISOString(), data }, null, 2)
  }, [revenues, expenses, customers, accounts, customBills, customBanks, settings])

  const getBackupFileName = useCallback(() => `hesabdar-backup-${jalaliDateForFilename(todayJalaliString())}.json`, [])

  const importBackup = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr)
      const data = parsed.data || parsed
      if (!data || typeof data !== 'object') return { success: false, error: 'invalid' }
      const knownKeys = ['revenues', 'expenses', 'customers', 'accounts', 'customBills', 'customBanks', 'settings']
      if (!knownKeys.some((k) => k in data)) return { success: false, error: 'invalid' }

      if (data.revenues) setRevenuesRaw(migrateOldDates(data.revenues, 'date'))
      if (data.expenses) setExpensesRaw(migrateOldDates(data.expenses, 'date'))
      if (data.customers) setCustomers(data.customers)
      if (data.accounts) setAccounts(data.accounts)
      else if (data.revenues || data.expenses) {
        const { newAccounts } = migrateAccounts(data.revenues || [], data.expenses || [], [])
        setAccounts(newAccounts)
      }
      if (data.customBills) setCustomBills(data.customBills)
      if (data.customBanks) setCustomBanks(data.customBanks)
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      return { success: true }
    } catch (e) { console.error('Import failed', e); return { success: false, error: 'invalid' } }
  }, [])

  return {
    revenues, expenses, customers, accounts, sortedAccounts, accountUsage,
    customBills, customBanks, settings, allBanks, allBills,
    addRevenue, updateRevenue, deleteRevenue,
    addExpense, updateExpense, deleteExpense,
    addCustomer, updateCustomer, deleteCustomer,
    addAccount, deleteAccount,
    addCustomBill, deleteCustomBill, addCustomBank,
    updateSettings,
    exportBackup, getBackupFileName, importBackup
  }
}
