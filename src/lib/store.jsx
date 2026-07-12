import React, { createContext, useContext, useEffect, useState } from 'react'
import { todayISO, todayJalali } from './jalali'

const STORAGE_KEY = 'hesabdar_data_v1'
const THEME_KEY = 'hesabdar_theme'
const CURRENCY_KEY = 'hesabdar_currency'

// Bank logo paths use RELATIVE paths (no leading slash) so they work in
// Capacitor's file:// WebView. Vite's base: './' makes all asset URLs relative.
export const DEFAULT_BANKS = [
  { id: 'melli', name: 'بانک ملی ایران', color: '#1976d2', short: 'م', logo: 'banks/melli.svg' },
  { id: 'mellat', name: 'بانک ملت', color: '#d4af37', short: 'م', logo: 'banks/mellat.svg' },
  { id: 'saderat', name: 'بانک صادرات ایران', color: '#e6b800', short: 'ص', logo: 'banks/saderat.svg' },
  { id: 'tejarat', name: 'بانک تجارت', color: '#2e7d32', short: 'ت', logo: 'banks/tejarat.svg' },
  { id: 'sepah', name: 'بانک سپه', color: '#0d47a1', short: 'س', logo: 'banks/sepah.svg' },
  { id: 'keshavarzi', name: 'بانک کشاورزی', color: '#388e3c', short: 'ک', logo: 'banks/keshavarzi.svg' },
  { id: 'maskan', name: 'بانک مسکن', color: '#5d4037', short: 'م', logo: 'banks/maskan.svg' },
  { id: 'post', name: 'پست بانک ایران', color: '#7b1fa2', short: 'پ', logo: 'banks/post.svg' },
  { id: 'refah', name: 'بانک رفاه کارگران', color: '#c62828', short: 'ر', logo: 'banks/refah.svg' },
  { id: 'pasargad', name: 'بانک پاسارگاد', color: '#ffb300', short: 'پ', logo: 'banks/pasargad.svg' },
  { id: 'saman', name: 'بانک سامان', color: '#00695c', short: 'س', logo: 'banks/saman.svg' },
  { id: 'parsian', name: 'بانک پارسیان', color: '#1e88e5', short: 'پ', logo: 'banks/parsian.svg' },
  { id: 'eghtesad-novin', name: 'بانک اقتصاد نوین', color: '#43a047', short: 'ا', logo: 'banks/eghtesad-novin.svg' },
  { id: 'karafarin', name: 'بانک کارآفرین', color: '#0288d1', short: 'ک', logo: 'banks/karafarin.svg' },
  { id: 'sarmayeh', name: 'بانک سرمایه', color: '#8d6e63', short: 'س', logo: 'banks/sarmayeh.svg' },
  { id: 'sina', name: 'بانک سینا', color: '#3949ab', short: 'س', logo: 'banks/sina.svg' },
  { id: 'shahr', name: 'بانک شهر', color: '#00838f', short: 'ش', logo: 'banks/shahr.svg' },
  { id: 'dey', name: 'بانک دی', color: '#1976d2', short: 'د', logo: 'banks/dey.svg' },
  { id: 'ayandeh', name: 'بانک آینده', color: '#00acc1', short: 'آ', logo: 'banks/ayandeh.svg' },
  { id: 'ansar', name: 'بانک انصار', color: '#1565c0', short: 'ا', logo: 'banks/ansar.svg' },
  { id: 'gardeshgari', name: 'بانک گردشگری', color: '#009688', short: 'گ', logo: 'banks/gardeshgari.svg' },
  { id: 'bank-hekmat', name: 'بانک حکمت ایرانیان', color: '#43a047', short: 'ح', logo: 'banks/bank-hekmat.svg' },
  { id: 'iran-zamin', name: 'بانک ایران زمین', color: '#00897b', short: 'ا', logo: 'banks/iran-zamin.svg' },
  { id: 'ghavamin', name: 'بانک قوامین', color: '#5c6bc0', short: 'ق', logo: 'banks/ghavamin.svg' },
  { id: 'mehr-eghtesad', name: 'بانک مهر اقتصاد', color: '#ef6c00', short: 'م', logo: 'banks/mehr-eghtesad.svg' },
  { id: 'sanat-madan', name: 'بانک صنعت و معدن', color: '#455a64', short: 'ص', logo: 'banks/sanat-madan.svg' },
  { id: 'tosee-saderat', name: 'بانک توسعه صادرات', color: '#e57373', short: 'ت', logo: 'banks/tosee-saderat.svg' },
  { id: 'tosee-taavon', name: 'بانک توسعه تعاون', color: '#2e7d32', short: 'ت', logo: 'banks/tosee-taavon.svg' },
  { id: 'khavar-mianeh', name: 'بانک خاورمیانه', color: '#c0ca33', short: 'خ', logo: 'banks/khavar-mianeh.svg' },
  { id: 'blu', name: 'بلو بانک', color: '#0066ff', short: 'ب', logo: 'banks/blu.svg' },
  { id: 'kosar', name: 'موسسه اعتباری کوثر', color: '#5c6bc0', short: 'ک', logo: 'banks/kosar.svg' },
  { id: 'mehr-iran', name: 'قرض الحسنه مهر ایران', color: '#ef6c00', short: 'م', logo: 'banks/mehr-iran.svg' },
  { id: 'resalat', name: 'قرض الحسنه رسالت', color: '#6a1b9a', short: 'ر', logo: 'banks/resalat.svg' },
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

  const addAccount = (account) => {
    const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newAcc = { id, createdAt: todayISO(), ...account }
    setData((d) => ({ ...d, accounts: [...d.accounts, newAcc] }))
    return newAcc
  }
  const deleteAccount = (id) => setData((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) }))

  const addRevenue = (rev) => {
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newRev = { id, createdAt: todayISO(), ...rev }
    setData((d) => ({ ...d, revenues: [...d.revenues, newRev] }))
    return newRev
  }
  const deleteRevenue = (id) => setData((d) => ({ ...d, revenues: d.revenues.filter((r) => r.id !== id) }))

  const addExpense = (exp) => {
    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newExp = { id, createdAt: todayISO(), ...exp }
    setData((d) => ({ ...d, expenses: [...d.expenses, newExp] }))
    return newExp
  }
  const deleteExpense = (id) => setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }))

  const addCategory = (cat) => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newCat = { id, type: 'expense', ...cat }
    setData((d) => ({ ...d, categories: [...d.categories, newCat] }))
    return newCat
  }
  const deleteCategory = (id) => setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))

  const addBillName = (name) => {
    const id = `bill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newBill = { id, name }
    setData((d) => ({ ...d, billNames: [...d.billNames, newBill] }))
    return newBill
  }
  const deleteBillName = (id) => setData((d) => ({ ...d, billNames: d.billNames.filter((b) => b.id !== id) }))

  const addCustomer = (cust) => {
    const id = `cus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newCust = { id, createdAt: todayISO(), ...cust }
    setData((d) => ({ ...d, customers: [...d.customers, newCust] }))
    return newCust
  }
  const deleteCustomer = (id) => setData((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }))

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
