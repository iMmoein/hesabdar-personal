import React, { useState } from 'react'
import { getBankById, getBankLogoUrl, getBankInitial } from '../utils/banks'

export const BankLogo = React.memo(function BankLogo({ bankId, name, size = 44, isDark = false }) {
  const [imgError, setImgError] = useState(false)

  const bank = getBankById(bankId)
  const logoUrl = bank.logo ? getBankLogoUrl(bank.logo) : null
  const displayName = name || bank.name || 'سایر'

  if (logoUrl && !imgError) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl overflow-hidden flex-shrink-0 shadow-sm"
        style={{
          width: size,
          height: size,
          background: isDark ? '#ffffff' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        }}
      >
        <img
          src={logoUrl}
          alt={displayName}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center rounded-2xl flex-shrink-0 text-white font-bold shadow-sm"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bank.color || '#64748b'}, ${bank.color || '#64748b'}dd)`,
        fontSize: size * 0.38,
      }}
    >
      {getBankInitial(displayName)}
    </div>
  )
})
