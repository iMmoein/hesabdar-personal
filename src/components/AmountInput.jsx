import { useState, useEffect, useRef } from 'react'
import { toPersianDigits, toEnglishDigits } from '../lib/jalali'

export default function AmountInput({ value, onChange, placeholder = 'مبلغ' }) {
  const [display, setDisplay] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (value !== undefined && value !== '') setDisplay(toPersianDigits(Number(value).toLocaleString('en-US')))
    else setDisplay('')
  }, [value])

  const handleChange = (e) => {
    const raw = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '')
    if (raw === '') { setDisplay(''); onChange(''); return }
    const num = Number(raw)
    setDisplay(toPersianDigits(num.toLocaleString('en-US')))
    onChange(num)
  }

  return <input ref={inputRef} type="text" inputMode="numeric" value={display} onChange={handleChange} placeholder={placeholder} className="input text-lg font-semibold" />
}
