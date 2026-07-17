export const BANKS = [
  { id: 'melli', name: 'ملی', logo: 'melli.svg', color: '#22c55e' },
  { id: 'mellat', name: 'ملت', logo: 'mellat.svg', color: '#f59e0b' },
  { id: 'saderat', name: 'صادرات', logo: 'saderat.svg', color: '#3b82f6' },
  { id: 'tejarat', name: 'تجارت', logo: 'tejarat.svg', color: '#06b6d4' },
  { id: 'sepah', name: 'سپه', logo: 'sepah.svg', color: '#84cc16' },
  { id: 'keshavarzi', name: 'کشاورزی', logo: 'keshavarzi.svg', color: '#16a34a' },
  { id: 'maskan', name: 'مسکن', logo: 'maskan.svg', color: '#0891b2' },
  { id: 'post', name: 'پست بانک', logo: 'post.svg', color: '#f97316' },
  { id: 'refah', name: 'رفاه', logo: 'refah.svg', color: '#0ea5e9' },
  { id: 'pasargad', name: 'پاسارگاد', logo: 'pasargad.svg', color: '#6366f1' },
  { id: 'saman', name: 'سامان', logo: 'saman.svg', color: '#0d9488' },
  { id: 'parsian', name: 'پارسیان', logo: 'parsian.svg', color: '#3b82f6' },
  { id: 'eghtesad-novin', name: 'اقتصاد نوین', logo: 'eghtesad-novin.svg', color: '#10b981' },
  { id: 'karafarin', name: 'کارآفرین', logo: 'karafarin.svg', color: '#ec4899' },
  { id: 'sarmayeh', name: 'سرمایه', logo: 'sarmayeh.svg', color: '#8b5cf6' },
  { id: 'sina', name: 'سینا', logo: 'sina.svg', color: '#14b8a6' },
  { id: 'shahr', name: 'شهر', logo: 'shahr.svg', color: '#f43f5e' },
  { id: 'dey', name: 'دی', logo: 'dey.svg', color: '#a855f7' },
  { id: 'ayandeh', name: 'آینده', logo: 'ayandeh.svg', color: '#6366f1' },
  { id: 'ansar', name: 'انصار', logo: 'ansar.svg', color: '#22c55e' },
  { id: 'gardeshgari', name: 'گردشگری', logo: 'gardeshgari.svg', color: '#0ea5e9' },
  { id: 'bank-hekmat', name: 'حکمت ایرانیان', logo: 'bank-hekmat.svg', color: '#f59e0b' },
  { id: 'iran-zamin', name: 'ایران زمین', logo: 'iran-zamin.svg', color: '#dc2626' },
  { id: 'ghavamin', name: 'قوامین', logo: 'ghavamin.svg', color: '#0891b2' },
  { id: 'mehr-eghtesad', name: 'مهر اقتصاد', logo: 'mehr-eghtesad.svg', color: '#eab308' },
  { id: 'sanat-madan', name: 'صنعت و معدن', logo: 'sanat-madan.svg', color: '#64748b' },
  { id: 'tosee-saderat', name: 'توسعه صادرات', logo: 'tosee-saderat.svg', color: '#3b82f6' },
  { id: 'tosee-taavon', name: 'توسعه تعاون', logo: 'tosee-taavon.svg', color: '#16a34a' },
  { id: 'khavar-mianeh', name: 'خاورمیانه', logo: 'khavar-mianeh.svg', color: '#0d9488' },
  { id: 'blu', name: 'بلو بانک', logo: 'blu.svg', color: '#3b82f6' },
  { id: 'kosar', name: 'کوثر', logo: 'kosar.svg', color: '#e11d48' },
  { id: 'mehr-iran', name: 'مهر ایران', logo: 'mehr-iran.svg', color: '#f97316' },
  { id: 'resalat', name: 'رسالت', logo: 'resalat.svg', color: '#84cc16' },
]

export const BANK_MAP = {}
BANKS.forEach((b) => {
  BANK_MAP[b.id] = b
})

export function getBankById(id) {
  return BANK_MAP[id] || { id: 'other', name: 'سایر', logo: null, color: '#64748b' }
}

export function getBankLogoUrl(filename) {
  if (!filename) return null
  return `${import.meta.env.BASE_URL}banks/${filename}`
}

export function getBankInitial(name) {
  if (!name) return '؟'
  return name.charAt(0)
}
