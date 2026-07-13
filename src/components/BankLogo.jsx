import { useState, useEffect } from 'react'
import { getBankSvgUrl, getBankInitial, getBankColor } from '../lib/banks'

// BankLogo: renders SVG from public/banks/ with fallback colored circle
// Uses import.meta.env.BASE_URL for Capacitor-safe paths
export default function BankLogo({ bank, size = 40 }) {
  const [svgError, setSvgError] = useState(false)
  const svgUrl = bank?.svg ? getBankSvgUrl(bank.svg) : null

  useEffect(() => {
    setSvgError(false)
  }, [bank?.id, bank?.svg])

  const fallback = (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: getBankColor(bank?.id), fontSize: size * 0.4 }}
    >
      {getBankInitial(bank?.name)}
    </div>
  )

  if (!svgUrl || svgError || bank?.id === 'other' || !bank?.svg) {
    return fallback
  }

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-white dark:bg-slate-100 p-1"
      style={{ width: size, height: size }}
    >
      <img
        src={svgUrl}
        alt={bank?.name || 'bank'}
        width={size - 8}
        height={size - 8}
        onError={() => setSvgError(true)}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}
