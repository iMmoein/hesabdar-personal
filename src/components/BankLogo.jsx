import { useState } from 'react'
import { Landmark } from 'lucide-react'

function resolveLogo(logo) {
  if (!logo) return ''
  if (/^(https?:|file:|data:)/.test(logo)) return logo
  const clean = logo.replace(/^\/+/, '')
  return import.meta.env.BASE_URL + clean
}

export default function BankLogo({ bank, size = 40 }) {
  const [imgError, setImgError] = useState(false)

  if (!bank || !bank.logo || bank.id === 'other' || imgError) {
    if (bank && bank.id === 'other') {
      return (
        <div className="flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 shrink-0" style={{ width: size, height: size }}>
          <Landmark size={size * 0.5} />
        </div>
      )
    }
    if (bank) {
      const color = bank.color || '#607d8b'
      const darker = shadeColor(color, -30)
      return (
        <div className="flex items-center justify-center rounded-full font-bold text-white shadow-sm shrink-0" style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(135deg, ${color}, ${darker})` }}>
          {bank.short || bank.name?.charAt(0) || '؟'}
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 shrink-0" style={{ width: size, height: size }}>
        <Landmark size={size * 0.5} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-full dark:bg-white dark:p-1 shrink-0" style={{ width: size, height: size }}>
      <img src={resolveLogo(bank.logo)} alt={bank.name} className="w-full h-full object-contain" onError={() => setImgError(true)} />
    </div>
  )
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
}
