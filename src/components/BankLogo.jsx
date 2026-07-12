import { Landmark } from 'lucide-react'

export default function BankLogo({ bank, size = 40 }) {
  if (!bank || bank.id === 'other') {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
        style={{ width: size, height: size }}
      >
        <Landmark size={size * 0.5} />
      </div>
    )
  }

  const color = bank.color || '#607d8b'
  const darker = shadeColor(color, -30)

  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${color}, ${darker})`
      }}
    >
      {bank.short || bank.name?.charAt(0) || '؟'}
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
