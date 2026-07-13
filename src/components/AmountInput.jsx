import { useState, useEffect, useRef } from 'react'
import { toPersianDigits } from '../lib/jalali'

// AmountInput: manual numeric input with thousands separator
// Stores raw numeric value (Rial), displays formatted with separators
export default function AmountInput({ value, onChange, currency }) {
  const [display, setDisplay] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (value != null && value !== '') {
      setDisplay(toPersianDigits(Number(value).toLocaleString('en-US')))
    } else {
      setDisplay('')
    }
  }, [value])

  const handleChange = (e) => {
    let raw = e.target.value
    // Convert Persian digits to English
    raw = raw.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    // Remove non-digits
    raw = raw.replace(/[^\d]/g, '')
    if (!raw) {
      onChange('')
      setDisplay('')
      return
    }
    const num = Number(raw)
    onChange(num)
    setDisplay(toPersianDigits(num.toLocaleString('en-US')))
  }

  const label = currency === 'toman' ? 'تومان' : 'ریال'

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0"
        className="input-field pl-16 text-left tabular-nums"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500 pointer-events-none">
        {label}
      </span>
    </div>
  )
}
