import { toPersianDigits, toEnglishDigits } from '../lib/jalali'

export function AmountInput({ value, onChange, placeholder = 'مبلغ' }) {
  const format = (val) => {
    const num = toEnglishDigits(val).replace(/[^0-9]/g, '')
    if (!num) return ''
    return toPersianDigits(Number(num).toLocaleString('en-US'))
  }

  return (
    <input
      value={value ? format(value) : ''}
      onChange={(e) => {
        const raw = e.target.value
        const num = toEnglishDigits(raw).replace(/[^0-9]/g, '')
        onChange(format(raw), Number(num))
      }}
      className="input"
      inputMode="numeric"
      placeholder={placeholder}
      dir="ltr"
    />
  )
}
