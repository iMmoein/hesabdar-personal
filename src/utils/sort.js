export function sortTransactions(transactions, sortBy, sortDir, accountsMap = {}) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...transactions].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') {
      cmp = ((a.dateKey || 0) - (b.dateKey || 0)) * dir
      if (cmp === 0) cmp = ((a.createdAt || 0) - (b.createdAt || 0)) * dir
    } else if (sortBy === 'amount') {
      cmp = ((a.amount || 0) - (b.amount || 0)) * dir
      if (cmp === 0) cmp = ((a.dateKey || 0) - (b.dateKey || 0)) * dir
    } else if (sortBy === 'bank') {
      const aName = (accountsMap[a.accountId] || {}).name || ''
      const bName = (accountsMap[b.accountId] || {}).name || ''
      cmp = aName.localeCompare(bName, 'fa') * dir
      if (cmp === 0) cmp = ((a.dateKey || 0) - (b.dateKey || 0)) * dir
    }
    return cmp
  })
}
