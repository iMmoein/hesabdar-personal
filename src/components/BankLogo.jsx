import { Landmark } from 'lucide-react'

function shade(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + percent))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent))
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent))
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

export function BankLogo({ bank, size = 36, className = '' }) {
  const color = bank?.color || '#64748b'
  const isCustom = bank?.id === 'other'
  const label = bank?.short || bank?.name?.slice(0, 2) || '؟'
  return (
    <div
      className={`flex items-center justify-center rounded-xl font-bold text-white shadow-sm shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${shade(color, -20)})`,
        fontSize: size * 0.34,
      }}
      title={bank?.name}
    >
      {isCustom ? <Landmark size={size * 0.5} /> : label.slice(0, 2)}
    </div>
  )
}
