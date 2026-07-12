import React, { createContext, useContext, useEffect, useState } from 'react'
import { todayISO, todayJalali } from './jalali'

const STORAGE_KEY = 'hesabdar_data_v1'
const THEME_KEY = 'hesabdar_theme'
const CURRENCY_KEY = 'hesabdar_currency'

export const DEFAULT_BANKS = [
  { id: 'mellat', name: 'بانک ملت', color: '#d4af37', short: 'م' },
  { id: 'melli', name: 'بانک ملی', color: '#1976d2', short: 'م' },
  { id: 'saderat', name: 'بانک صادرات', color: '#e6b800', short: 'ص' },
  { id: 'tejarat', name: 'بانک تجارت', color: '#2e7d32', short: 'ت' },
  { id: 'sepah', name: 'بانک سپه', color: '#0d47a1', short: 'س' },
  { id: 'keshavarzi', name: 'بانک کشاورزی', color: '#388e3c', short: 'ک' },
  { id: 'sanatmadan', name: 'بانک صنعت و معدن', color: '#455a64', short: 'ص' },
  { id: 'maskan', name: 'بانک مسکن', color: '#5d4037', short: 'م' },
  { id: 'postbank', name: 'پست بانک', color: '#7b1fa2', short: 'پ' },
  { id: 'tosee', name: 'بانک توسعه تعاون', color: '#00897b', short: 'ت' },
  { id: 'refah', name: 'بانک رفاه', color: '#c62828', short: 'ر' },
  { id: 'ansar', name: 'بانک انصار', color: '#1565c0', short: 'ا' },
  { id: 'mehr', name: 'بانک مهر ایران', color: '#ef6c00', short: 'م' },
  { id: 'shahr', name: 'بانک شهر', color: '#00838f', short: 'ش' },
  { id: 'ayandeh', name: 'بانک آینده', color: '#00acc1', short: 'آ' },
  { id: 'parsian', name: 'بانک پارسیان', color: '#1e88e5', short: 'پ' },
  { id: 'pasargad', name: 'بانک پاسارگاد', color: '#ffb300', short: 'پ' },
  { id: 'saman', name: 'بانک سامان', color: '#00695c', short: 'س' },
  { id: 'sarmaye', name: 'بانک سرمایه', color: '#8d6e63', short: 'س' },
  { id: 'sina', name: 'بانک سینا', color: '#3949ab', short: 'س' },
  { id: 'taavon', name: 'بانک تعاون', color: '#558b2f', short: 'ت' },
  { id: 'tosee-taavon', name: 'بانک توسعه تعاون', color: '#2e7d32', short: 'ت' },
  { id: 'gardeshgari', name: 'بانک گردشگری', color: '#009688', short: 'گ' },
  { id: 'hekmat-iranian', name: 'بانک حکمت ایرانی', color: '#43a047', short: 'ح' },
  { id: 'day', name: 'بانک دی', color: '#1976d2', short: 'د' },
  { id: 'resalat', name: 'بانک رسالت', color: '#6a1b9a', short: 'ر' },
  { id: 'iranzamin', name: 'بانک ایران زمین', color: '#00897b', short: 'ا' },
  { id: 'khavarmiane', name: 'بانک خاورمیانه', color: '#c0ca33', short: 'خ' },
  { id: 'noor', name: 'بانک نور', color: '#fbc02d', short: 'ن' },
  { id: 'kosar', name: 'بانک کوثر', color: '#5c6bc0', short: 'ک' },
  { id: 'tose-saderat', name: 'بانک توسعه صادرات', color: '#e57373', short: 'ت' },
  { id: 'karafarin', name: 'بانک کارآفرین', color: '#0288d1', short: 'ک' },
  { id: 'tose-taavon-credit', name: 'موسسه اعتباری توسعه', color: '#7e57c2', short: 'ت' },
  { id: 'other', name: 'سایر', color: '#607d8b', short: 'س' }
]

export const DEFAULT_CATEGORIES = [
  { id: 'payment', name: 'پرداختی', type: 'expense' },
  { id: 'bills', name: 'قبوض', type: 'expense' }
]

function defaultData() {
  return {
    accounts: [],
    revenues: [],
    expenses: [],
    categories: [...DEFAULT_CATEGORIES],
    billNames: [],
    customers: []
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw)
    return { ...defaultData(), ...parsed }
  } catch {
    return defaultData()
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [currency, setCurrency] = useState(() => localStorage.getItem(CURRENCY_KEY) || 'rial')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  // Accounts
  const addAccount = (account) => {
    const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newAcc = { id, createdAt: todayISO(), ...account }
    setData((d) => ({ ...d, accounts: [...d.accounts, newAcc] }))
    return newAcc
  }
  const deleteAccount = (id) => setData((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) }))

  // Revenues
  const addRevenue = (rev) => {
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newRev = { id, createdAt: todayISO(), ...rev }
    setData((d) => ({ ...d, revenues: [...d.revenues, newRev] }))
    return newRev
  }
  const deleteRevenue = (id) => setData((d) => ({ ...d, revenues: d.revenues.filter((r) => r.id !== id) }))

  // Expenses
  const addExpense = (exp) => {
    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newExp = { id, createdAt: todayISO(), ...exp }
    setData((d) => ({ ...d, expenses: [...d.expenses, newExp] }))
    return newExp
  }
  const deleteExpense = (id) => setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }))

  // Categories
  const addCategory = (cat) => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newCat = { id, type: 'expense', ...cat }
    setData((d) => ({ ...d, categories: [...d.categories, newCat] }))
    return newCat
  }
  const deleteCategory = (id) => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))

  // Bill names
  const addBillName = (name) => {
    const id = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newBill = { id, name }
    setData((d) => ({ ...d, billNames: [...d.billNames, newBill] }))
    return newBill
  }
  const deleteBillName = (id) => setData((d) => ({ ...d, billNames: d.billNames.filter((b) => b.id !== id) }))

  // Customers
  const addCustomer = (cust) => {
    const id = `cus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newCust = { id, createdAt: todayISO(), ...cust }
    setData((d) => ({ ...d, customers: [...d.customers, newCust] }))
    return newCust
  }
  const deleteCustomer = (id) => setData((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }))

  // Export / Import / Reset
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const [jy, jm, jd] = todayJalali()
    a.download = `hesabdar-backup-${jy}-${jm}-${jd}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      setData({ ...defaultData(), ...parsed })
      return true
    } catch {
      return false
    }
  }

  const resetData = () => setData(defaultData())

  const value = {
    ...data,
    theme, setTheme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    currency, setCurrency, toggleCurrency: () => setCurrency((c) => (c === 'rial' ? 'toman' : 'rial')),
    addAccount, deleteAccount,
    addRevenue, deleteRevenue,
    addExpense, deleteExpense,
    addCategory, deleteCategory,
    addBillName, deleteBillName,
    addCustomer, deleteCustomer,
    exportData, importData, resetData
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
