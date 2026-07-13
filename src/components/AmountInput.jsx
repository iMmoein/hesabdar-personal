import { toPersianDigits, toEnglishDigits } from '../lib/jalali'

export default function AmountInput({ value, onChange, placeholder = 'مبلغ' }) {
  const handle = (e) => {
    const raw = toEnglishDigits(e.target.value).replace(/[^\d]/g, '')
    onChange(raw)
  }
  const display = value ? toPersianDigits(Number(value).toLocaleString('en-US')) : ''
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handle}
      placeholder={placeholder}
      className="input-field text-lg font-semibold tabular-nums"
    />
  )
}
