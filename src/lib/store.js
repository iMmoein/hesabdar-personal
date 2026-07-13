// Global data store using localStorage
// Safe defaults so missing/old fields never crash the app.

import { useState, useEffect, useCallback } from 'react'
import { migrateOldDates } from './jalali'
import { DEFAULT_BANKS, DEFAULT_BILLS } from './banks'

const STORAGE_KEYS = {
  revenues: 'hesabdar_revenues',
  expenses: 'hesabdar_expenses',
  customers: 'hesabdar_customers',
  customBills: 'hesabdar_custom_bills',
  customBanks: 'hesabdar_custom_banks',
  settings: 'hesabdar_settings'
}

const DEFAULT_SETTINGS = {
  theme: 'light',
  currency: 'rial' // 'rial' | 'toman'
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) && typeof fallback === 'object' && Array.isArray(fallback)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to save', key, e)
  }
}

export function useStore() {
  const [revenues, setRevenuesRaw] = useState(() => migrateOldDates(safeParse(STORAGE_KEYS.revenues, []), 'date'))
  const [expenses, setExpensesRaw] = useState(() => migrateOldDates(safeParse(STORAGE_KEYS.expenses, []), 'date'))
  const [customers, setCustomers] = useState(() => safeParse(STORAGE_KEYS.customers, []))
  const [customBills, setCustomBills] = useState(() => safeParse(STORAGE_KEYS.customBills, []))
  const [customBanks, setCustomBanks] = useState(() => safeParse(STORAGE_KEYS.customBanks, []))
  const [settings, setSettings] = useState(() => {
    const s = safeParse(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
    return { ...DEFAULT_SETTINGS, ...s }
  })

  // Persist on change
  useEffect(() => { safeSave(STORAGE_KEYS.revenues, revenues) }, [revenues])
  useEffect(() => { safeSave(STORAGE_KEYS.expenses, expenses) }, [expenses])
  useEffect(() => { safeSave(STORAGE_KEYS.customers, customers) }, [customers])
  useEffect(() => { safeSave(STORAGE_KEYS.customBills, customBills) }, [customBills])
  useEffect(() => { safeSave(STORAGE_KEYS.customBanks, customBanks) }, [customBanks])
  useEffect(() => { safeSave(STORAGE_KEYS.settings, settings) }, [settings])

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  const setRevenues = useCallback((updater) => {
    setRevenuesRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return migrateOldDates(next, 'date')
    })
  }, [])

  const setExpenses = useCallback((updater) => {
    setExpensesRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return migrateOldDates(next, 'date')
    })
  }, [])

  // --- Banks (default + custom) ---
  const allBanks = [...DEFAULT_BANKS, ...customBanks]

  // --- Bills (default + custom) ---
  const allBills = [...DEFAULT_BILLS, ...customBills]

  // --- Revenue CRUD ---
  const addRevenue = useCallback((data) => {
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const item = { id, createdAt: new Date().toISOString(), ...data }
    setRevenues((prev) => [item, ...prev])
    return id
  }, [setRevenues])

  const updateRevenue = useCallback((id, data) => {
    setRevenues((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r))
  }, [setRevenues])

  const deleteRevenue = useCallback((id) => {
    setRevenues((prev) => prev.filter((r) => r.id !== id))
  }, [setRevenues])

  // --- Expense CRUD ---
  const addExpense = useCallback((data) => {
    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const item = { id, createdAt: new Date().toISOString(), ...data }
    setExpenses((prev) => [item, ...prev])
    return id
  }, [setExpenses])

  const updateExpense = useCallback((id, data) => {
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, ...data } : e))
  }, [setExpenses])

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [setExpenses])

  // --- Customer CRUD ---
  const addCustomer = useCallback((name) => {
    const id = `cus_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const item = { id, name: name.trim(), createdAt: new Date().toISOString() }
    setCustomers((prev) => [item, ...prev])
    return id
  }, [])

  const updateCustomer = useCallback((id, name) => {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, name: name.trim() } : c))
  }, [])

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // --- Custom Bill CRUD ---
  const addCustomBill = useCallback((name) => {
    const id = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    setCustomBills((prev) => [...prev, { id, name: name.trim() }])
    return id
  }, [])

  const deleteCustomBill = useCallback((id) => {
    setCustomBills((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // --- Custom Bank CRUD ---
  const addCustomBank = useCallback((name) => {
    const id = `bank_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    setCustomBanks((prev) => [...prev, { id, name: name.trim(), svg: null }])
    return id
  }, [])

  // --- Settings ---
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  // --- Backup / Restore ---
  const exportBackup = useCallback(() => {
    const data = {
      revenues, expenses, customers, customBills, customBanks, settings,
      exportedAt: new Date().toISOString(),
      version: 1
    }
    return JSON.stringify(data, null, 2)
  }, [revenues, expenses, customers, customBills, customBanks, settings])

  const importBackup = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      if (data.revenues) setRevenuesRaw(migrateOldDates(data.revenues, 'date'))
      if (data.expenses) setExpensesRaw(migrateOldDates(data.expenses, 'date'))
      if (data.customers) setCustomers(data.customers)
      if (data.customBills) setCustomBills(data.customBills)
      if (data.customBanks) setCustomBanks(data.customBanks)
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      return true
    } catch (e) {
      console.error('Import failed', e)
      return false
    }
  }, [])

  return {
    revenues, expenses, customers, customBills, customBanks, settings,
    allBanks, allBills,
    addRevenue, updateRevenue, deleteRevenue,
    addExpense, updateExpense, deleteExpense,
    addCustomer, updateCustomer, deleteCustomer,
    addCustomBill, deleteCustomBill,
    addCustomBank,
    updateSettings,
    exportBackup, importBackup
  }
}
