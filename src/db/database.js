import Dexie from 'dexie'

export const db = new Dexie('hesabdar-personal')

db.version(3).stores({
  transactions: '++id, type, dateKey, dateJalali, createdAt, accountId, customerId, category, amount',
  accounts: '++id, bankId, name, isCustom, createdAt, usageCount',
  customers: '++id, name, createdAt, transactionCount',
  customBills: '++id, name, createdAt',
  customCategories: '++id, name, createdAt',
  settings: 'key',
  metadata: 'key',
})

export const DEFAULT_SETTINGS = {
  currency: 'rial',
  theme: 'light',
}

export async function getSetting(key) {
  try {
    const row = await db.settings.get(key)
    return row ? row.value : DEFAULT_SETTINGS[key]
  } catch {
    return DEFAULT_SETTINGS[key]
  }
}

export async function setSetting(key, value) {
  try {
    await db.settings.put({ key, value })
  } catch (e) {
    console.error('Failed to save setting:', key, e)
  }
}

export async function ensureDefaultSettings() {
  try {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await db.settings.get(key)
      if (!existing) {
        await db.settings.put({ key, value })
      }
    }
  } catch (e) {
    console.error('Failed to ensure default settings:', e)
  }
}

export const DEFAULT_BILLS = [
  { name: 'قبض آب' },
  { name: 'قبض برق' },
  { name: 'قبض گاز' },
  { name: 'قبض تلفن' },
]

export async function ensureDefaultBills() {
  try {
    const count = await db.customBills.count()
    if (count === 0) {
      const now = Date.now()
      await db.customBills.bulkAdd(
        DEFAULT_BILLS.map((b, i) => ({ ...b, id: undefined, createdAt: now + i }))
      )
    }
  } catch (e) {
    console.error('Failed to ensure default bills:', e)
  }
}

export async function migrateLegacyData() {
  try {
    const migrated = await db.metadata.get('legacyMigrated')
    if (migrated && migrated.value) return

    const oldData = localStorage.getItem('hesabdar-transactions')
    if (oldData) {
      const parsed = JSON.parse(oldData)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now()
        const txs = parsed.map((t, i) => ({
          type: t.type || 'revenue',
          dateKey: t.dateKey || now,
          dateJalali: t.dateJalali || '',
          createdAt: t.createdAt || now + i,
          accountId: t.accountId || null,
          customerId: t.customerId || null,
          category: t.category || '',
          amount: Number(t.amount) || 0,
          description: t.description || '',
          time: t.time || '',
        }))
        await db.transactions.bulkAdd(txs)
      }
    }

    const oldAccounts = localStorage.getItem('hesabdar-accounts')
    if (oldAccounts) {
      const parsed = JSON.parse(oldAccounts)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now()
        await db.accounts.bulkAdd(
          parsed.map((a, i) => ({
            bankId: a.bankId || 'other',
            name: a.name || 'سایر',
            isCustom: a.isCustom || false,
            createdAt: a.createdAt || now + i,
            usageCount: a.usageCount || 0,
          }))
        )
      }
    }

    const oldCustomers = localStorage.getItem('hesabdar-customers')
    if (oldCustomers) {
      const parsed = JSON.parse(oldCustomers)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now()
        await db.customers.bulkAdd(
          parsed.map((c, i) => ({
            name: c.name || '',
            createdAt: c.createdAt || now + i,
            transactionCount: c.transactionCount || 0,
          }))
        )
      }
    }

    await db.metadata.put({ key: 'legacyMigrated', value: true })
  } catch (e) {
    console.error('Legacy migration failed:', e)
  }
}

export async function initDatabase() {
  await ensureDefaultSettings()
  await ensureDefaultBills()
  await migrateLegacyData()
}

export async function getBackupData() {
  const [transactions, accounts, customers, customBills, customCategories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.accounts.toArray(),
    db.customers.toArray(),
    db.customBills.toArray(),
    db.customCategories.toArray(),
    db.settings.toArray(),
  ])

  return {
    appName: 'حسابدار شخصی',
    backupVersion: 3,
    createdAt: new Date().toISOString(),
    data: {
      transactions,
      accounts,
      customers,
      customBills,
      customCategories,
      settings,
    },
  }
}

export function validateBackup(data) {
  if (!data || typeof data !== 'object') return false
  if (data.appName !== 'حسابدار شخصی') return false
  if (![1, 2, 3].includes(data.backupVersion)) return false
  if (!data.data || typeof data.data !== 'object') return false
  return true
}

export async function restoreBackup(data) {
  const d = data.data

  await db.transaction('rw', db.transactions, db.accounts, db.customers, db.customBills, db.customCategories, db.settings, async () => {
    await db.transactions.clear()
    await db.accounts.clear()
    await db.customers.clear()
    await db.customBills.clear()
    await db.customCategories.clear()
    await db.settings.clear()

    if (d.transactions && d.transactions.length > 0) {
      const cleaned = d.transactions.map(t => ({
        type: t.type || 'revenue',
        dateKey: t.dateKey || 0,
        dateJalali: t.dateJalali || '',
        createdAt: t.createdAt || Date.now(),
        accountId: t.accountId || null,
        customerId: t.customerId || null,
        category: t.category || '',
        amount: Number(t.amount) || 0,
        description: t.description || '',
        time: t.time || '',
      }))
      await db.transactions.bulkAdd(cleaned)
    }

    if (d.accounts && d.accounts.length > 0) {
      const cleaned = d.accounts.map(a => ({
        bankId: a.bankId || 'other',
        name: a.name || 'سایر',
        isCustom: a.isCustom || false,
        createdAt: a.createdAt || Date.now(),
        usageCount: a.usageCount || 0,
      }))
      await db.accounts.bulkAdd(cleaned)
    }

    if (d.customers && d.customers.length > 0) {
      const cleaned = d.customers.map(c => ({
        name: c.name || '',
        createdAt: c.createdAt || Date.now(),
        transactionCount: c.transactionCount || 0,
      }))
      await db.customers.bulkAdd(cleaned)
    }

    if (d.customBills && d.customBills.length > 0) {
      const cleaned = d.customBills.map(b => ({
        name: b.name || '',
        createdAt: b.createdAt || Date.now(),
      }))
      await db.customBills.bulkAdd(cleaned)
    }

    if (d.customCategories && d.customCategories.length > 0) {
      const cleaned = d.customCategories.map(c => ({
        name: c.name || '',
        createdAt: c.createdAt || Date.now(),
      }))
      await db.customCategories.bulkAdd(cleaned)
    }

    if (d.settings && d.settings.length > 0) {
      await db.settings.bulkAdd(d.settings)
    }
  })
}

export async function getStats() {
  try {
    const [totalRevenue, totalExpense] = await Promise.all([
      db.transactions.where('type').equals('revenue').sum('amount'),
      db.transactions.where('type').equals('expense').sum('amount'),
    ])
    return { totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense }
  } catch (e) {
    console.error('Failed to get stats:', e)
    return { totalRevenue: 0, totalExpense: 0, netProfit: 0 }
  }
}

export async function updateUsageCounts() {
  try {
    const accounts = await db.accounts.toArray()
    const customers = await db.customers.toArray()

    await db.transaction('rw', db.accounts, db.customers, async () => {
      for (const acc of accounts) {
        const count = await db.transactions.where('accountId').equals(acc.id || 0).count()
        await db.accounts.update(acc.id, { usageCount: count })
      }
      for (const cust of customers) {
        const count = await db.transactions
          .where('customerId')
          .equals(cust.id || 0)
          .filter((t) => t.type === 'expense' && t.categoryType === 'payment')
          .count()
        await db.customers.update(cust.id, { transactionCount: count })
      }
    })
  } catch (e) {
    console.error('Failed to update usage counts:', e)
  }
}
