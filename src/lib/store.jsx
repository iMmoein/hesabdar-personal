import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'hesabdar_data_v1'
const THEME_KEY = 'hesabdar_theme'
const CURRENCY_KEY = 'hesabdar_currency'

const DEFAULT_BANKS = [
  { id: 'melli', name: 'بانک ملی', color: '#16a34a', short: 'ملی' },
  { id: 'mellat', name: 'بانک ملت', color: '#f59e0b', short: 'ملت' },
  { id: 'saderat', name: 'بانک صادرات', color: '#1e7a3c', short: 'صادرات' },
  { id: 'tejarat', name: 'بانک تجارت', color: '#0d9488', short: 'تجارت' },
  { id: 'sepah', name: 'بانک سپه', color: '#2563eb', short: 'سپه' },
  { id: 'keshavarzi', name: 'بانک کشاورزی', color: '#65a30d', short: 'کشاورزی' },
  { id: 'maskan', name: 'بانک مسکن', color: '#ca8a04', short: 'مسکن' },
  { id: 'post', name: 'پست بانک', color: '#0891b2', short: 'پست' },
  { id: 'refah', name: 'بانک رفاه کارگران', color: '#dc2626', short: 'رفاه' },
  { id: 'pasargad', name: 'بانک پاسارگاد', color: '#d4af37', short: 'پاسارگاد' },
  { id: 'saman', name: 'بانک سامان', color: '#0ea5e9', short: 'سامان' },
  { id: 'parsian', name: 'بانک پارسیان', color: '#7c3aed', short: 'پارسیان' },
  { id: 'eghtesad', name: 'بانک اقتصاد نوین', color: '#059669', short: 'اقتصاد' },
  { id: 'karafarin', name: 'بانک کارآفرین', color: '#b45309', short: 'کارآفرین' },
  { id: 'sarmayeh', name: 'بانک سرمایه', color: '#be123c', short: 'سرمایه' },
  { id: 'sina', name: 'بانک سینا', color: '#0f766e', short: 'سینا' },
  { id: 'shahr', name: 'بانک شهر', color: '#6d28d9', short: 'شهر' },
  { id: 'dey', name: 'بانک دی', color: '#2563eb', short: 'دی' },
  { id: 'ayande', name: 'بانک آینده', color: '#1d4ed8', short: 'آینده' },
  { id: 'ansar', name: 'بانک انصار', color: '#16a34a', short: 'انصار' },
  { id: 'tourism', name: 'بانک گردشگری', color: '#0ea5e9', short: 'گردشگری' },
  { id: 'hekmat', name: 'بانک حکمت ایرانیان', color: '#0284c7', short: 'حکمت' },
  { id: 'iranzamin', name: 'بانک ایران زمین', color: '#b91c1c', short: 'ایران زمین' },
  { id: 'ghavamin', name: 'بانک قوامین', color: '#1e7a3c', short: 'قوامین' },
  { id: 'mehr', name: 'بانک مهر اقتصاد', color: '#dc2626', short: 'مهر' },
  { id: 'sanat', name: 'بانک صنعت و معدن', color: '#334155', short: 'صنعت' },
  { id: 'tosesaderat', name: 'بانک توسعه صادرات', color: '#1e7a3c', short: 'توسعه صادرات' },
  { id: 'tosetaavon', name: 'بانک توسعه تعاون', color: '#0d9488', short: 'توسعه تعاون' },
  { id: 'middleeast', name: 'بانک خاورمیانه', color: '#ca8a04', short: 'خاورمیانه' },
  { id: 'markazi', name: 'بانک مرکزی', color: '#15803d', short: 'مرکزی' },
  { id: 'blu', name: 'بلو بانک', color: '#2563eb', short: 'بلو' },
  { id: 'kosar', name: 'موسسه اعتباری کوثر', color: '#0ea5e9', short: 'کوثر' },
  { id: 'mehriran', name: 'قرض الحسنه مهر ایران', color: '#dc2626', short: 'مهر ایران' },
  { id: 'resalat', name: 'قرض الحسنه رسالت', color: '#16a34a', short: 'رسالت' },
  { id: 'other', name: 'سایر', color: '#64748b', short: 'سایر' },
]

const DEFAULT_DATA = {
  accounts: [],
  revenues: [],
  expenses: [],
  categories: [
    { id: 'payments', name: 'پرداختی', type: 'expense', system: true },
    { id: 'bills', name: 'قبوض', type: 'expense', system: true },
  ],
  billNames: [],
  customers: [],
  settings: { theme: 'light' },
  banks: DEFAULT_BANKS,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_DATA,
      ...parsed,
      banks: parsed.banks?.length ? parsed.banks : DEFAULT_BANKS,
      settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'dark' || t === 'light') return t
  } catch {}
  return 'light'
}

function loadCurrency() {
  try {
    const c = localStorage.getItem(CURRENCY_KEY)
    if (c === 'toman' || c === 'rial') return c
  } catch {}
  return 'rial'
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(load)
  const [theme, setTheme] = useState(loadTheme)
  const [currency, setCurrency] = useState(loadCurrency)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem(THEME_KEY, theme)
    setData((d) => ({ ...d, settings: { ...d.settings, theme } }))
  }, [theme])

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency)
  }, [currency])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const setCurrencyMode = useCallback((c) => {
    setCurrency(c)
  }, [])

  const update = useCallback((updater) => {
    setData((d) => (typeof updater === 'function' ? updater(d) : { ...d, ...updater }))
  }, [])

  const addAccount = useCallback((acc) => {
    const item = { id: 'acc_' + Date.now(), ...acc }
    setData((d) => ({ ...d, accounts: [...d.accounts, item] }))
    return item.id
  }, [])
  const deleteAccount = useCallback((id) => {
    setData((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) }))
  }, [])

  const addRevenue = useCallback((rev) => {
    const item = { id: 'rev_' + Date.now(), createdAt: Date.now(), ...rev }
    setData((d) => ({ ...d, revenues: [...d.revenues, item] }))
    return item.id
  }, [])
  const deleteRevenue = useCallback((id) => {
    setData((d) => ({ ...d, revenues: d.revenues.filter((r) => r.id !== id) }))
  }, [])

  const addExpense = useCallback((exp) => {
    const item = { id: 'exp_' + Date.now(), createdAt: Date.now(), ...exp }
    setData((d) => ({ ...d, expenses: [...d.expenses, item] }))
    return item.id
  }, [])
  const deleteExpense = useCallback((id) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }))
  }, [])

  const addCategory = useCallback((name) => {
    const item = { id: 'cat_' + Date.now(), name, type: 'expense', system: false }
    setData((d) => ({ ...d, categories: [...d.categories, item] }))
    return item.id
  }, [])
  const deleteCategory = useCallback((id) => {
    setData((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))
  }, [])

  const addBillName = useCallback((name) => {
    setData((d) =>
      d.billNames.some((b) => b.name === name)
        ? d
        : { ...d, billNames: [...d.billNames, { id: 'bill_' + Date.now(), name }] }
    )
  }, [])
  const deleteBillName = useCallback((id) => {
    setData((d) => ({ ...d, billNames: d.billNames.filter((b) => b.id !== id) }))
  }, [])

  const addCustomer = useCallback((name) => {
    const item = { id: 'cus_' + Date.now(), name, createdAt: Date.now() }
    setData((d) => ({ ...d, customers: [...d.customers, item] }))
    return item.id
  }, [])
  const deleteCustomer = useCallback((id) => {
    setData((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }))
  }, [])

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data])
  const importData = useCallback((json) => {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json
    setData({ ...DEFAULT_DATA, ...parsed, banks: parsed.banks?.length ? parsed.banks : DEFAULT_BANKS })
    if (parsed.settings?.theme) setTheme(parsed.settings.theme)
  }, [])
  const resetData = useCallback(() => {
    setData({ ...DEFAULT_DATA })
  }, [])

  const value = {
    data, theme, toggleTheme, currency, setCurrencyMode, update,
    addAccount, deleteAccount,
    addRevenue, deleteRevenue,
    addExpense, deleteExpense,
    addCategory, deleteCategory,
    addBillName, deleteBillName,
    addCustomer, deleteCustomer,
    exportData, importData, resetData,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
