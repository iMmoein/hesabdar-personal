import { getBankSvgUrl, getBankInitial, getBankColor } from '../lib/banks'

export default function BankLogo({ bank, size = 40, className = '' }) {
  const svgUrl = bank?.svg ? getBankSvgUrl(bank.svg) : null
  const color = getBankColor(bank?.id)
  if (svgUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-slate-100 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={svgUrl} alt={bank?.name || ''} className="w-full h-full object-contain p-1" />
      </div>
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-xl text-white font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {getBankInitial(bank?.name)}
    </div>
  )
}
