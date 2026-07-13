import { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-multi-date-picker'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import { parseJalaliString, todayJalaliString } from '../lib/jalali'

// CRITICAL: This date picker uses react-multi-date-picker with Persian calendar.
// The selected date is saved as a canonical Jalali string "YYYY/MM/DD".
// We NEVER use new Date("1405-04-15") which JS interprets as Gregorian.
// The picker's DateObject handles the Persian calendar internally.

export default function JalaliDatePicker({ value, onChange }) {
  const pickerRef = useRef(null)
  const [pickerValue, setPickerValue] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Build the picker value from our stored Jalali string "YYYY/MM/DD"
    if (value) {
      const [jy, jm, jd] = parseJalaliString(value)
      const dateObj = new DateObject({
        year: jy,
        month: jm,
        day: jd,
        calendar: persian,
        locale: persian_fa
      })
      setPickerValue(dateObj)
    } else {
      // Default to today
      const [jy, jm, jd] = parseJalaliString(todayJalaliString())
      const dateObj = new DateObject({
        year: jy,
        month: jm,
        day: jd,
        calendar: persian,
        locale: persian_fa
      })
      setPickerValue(dateObj)
    }
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (selectedDate) => {
    if (!selectedDate) {
      onChange('')
      return
    }
    // Format as "YYYY/MM/DD" — the picker formats in the Persian calendar
    const formatted = selectedDate.format('YYYY/MM/DD')
    onChange(formatted)
  }

  if (!mounted) return null

  return (
    <div className="card p-2">
      <DatePicker
        ref={pickerRef}
        calendar={persian}
        locale={persian_fa}
        value={pickerValue}
        onChange={handleChange}
        format="YYYY/MM/DD"
        calendarPosition="bottom-center"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: 'transparent',
          fontFamily: 'Vazirmatn',
          fontSize: '16px',
          fontWeight: 600,
          color: 'inherit'
        }}
        className="rmdp-mobile"
        containerStyle={{ width: '100%' }}
      />
    </div>
  )
}
