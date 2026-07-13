// Bank definitions and SVG logo mapping
export const DEFAULT_BANKS = [
  { id: 'melli', name: 'بانک ملی ایران', svg: 'melli.svg' },
  { id: 'mellat', name: 'بانک ملت', svg: 'mellat.svg' },
  { id: 'saderat', name: 'بانک صادرات ایران', svg: 'saderat.svg' },
  { id: 'tejarat', name: 'بانک تجارت', svg: 'tejarat.svg' },
  { id: 'sepah', name: 'بانک سپه', svg: 'sepah.svg' },
  { id: 'keshavarzi', name: 'بانک کشاورزی', svg: 'keshavarzi.svg' },
  { id: 'maskan', name: 'بانک مسکن', svg: 'maskan.svg' },
  { id: 'post', name: 'پست بانک ایران', svg: 'post.svg' },
  { id: 'refah', name: 'بانک رفاه کارگران', svg: 'refah.svg' },
  { id: 'pasargad', name: 'بانک پاسارگاد', svg: 'pasargad.svg' },
  { id: 'saman', name: 'بانک سامان', svg: 'saman.svg' },
  { id: 'parsian', name: 'بانک پارسیان', svg: 'parsian.svg' },
  { id: 'eghtesad-novin', name: 'بانک اقتصاد نوین', svg: 'eghtesad-novin.svg' },
  { id: 'karafarin', name: 'بانک کارآفرین', svg: 'karafarin.svg' },
  { id: 'sarmayeh', name: 'بانک سرمایه', svg: 'sarmayeh.svg' },
  { id: 'sina', name: 'بانک سینا', svg: 'sina.svg' },
  { id: 'shahr', name: 'بانک شهر', svg: 'shahr.svg' },
  { id: 'dey', name: 'بانک دی', svg: 'dey.svg' },
  { id: 'ayandeh', name: 'بانک آینده', svg: 'ayandeh.svg' },
  { id: 'ansar', name: 'بانک انصار', svg: 'ansar.svg' },
  { id: 'gardeshgari', name: 'بانک گردشگری', svg: 'gardeshgari.svg' },
  { id: 'bank-hekmat', name: 'بانک حکمت ایرانیان', svg: 'bank-hekmat.svg' },
  { id: 'iran-zamin', name: 'بانک ایران زمین', svg: 'iran-zamin.svg' },
  { id: 'ghavamin', name: 'بانک قوامین', svg: 'ghavamin.svg' },
  { id: 'mehr-eghtesad', name: 'بانک مهر اقتصاد', svg: 'mehr-eghtesad.svg' },
  { id: 'sanat-madan', name: 'بانک صنعت و معدن', svg: 'sanat-madan.svg' },
  { id: 'tosee-saderat', name: 'بانک توسعه صادرات', svg: 'tosee-saderat.svg' },
  { id: 'tosee-taavon', name: 'بانک توسعه تعاون', svg: 'tosee-taavon.svg' },
  { id: 'khavar-mianeh', name: 'بانک خاورمیانه', svg: 'khavar-mianeh.svg' },
  { id: 'blu', name: 'بلو بانک', svg: 'blu.svg' },
  { id: 'kosar', name: 'موسسه اعتباری کوثر', svg: 'kosar.svg' },
  { id: 'mehr-iran', name: 'قرض الحسنه مهر ایران', svg: 'mehr-iran.svg' },
  { id: 'resalat', name: 'قرض الحسنه رسالت', svg: 'resalat.svg' },
  { id: 'other', name: 'سایر', svg: null }
]

export const DEFAULT_BILLS = [
  { id: 'water', name: 'قبض آب' },
  { id: 'electricity', name: 'قبض برق' },
  { id: 'gas', name: 'قبض گاز' },
  { id: 'phone', name: 'قبض تلفن' }
]

export const EXPENSE_CATEGORIES = [
  { id: 'payment', name: 'پرداختی' },
  { id: 'bills', name: 'قبوض' }
]

export function getBankSvgUrl(svg) {
  if (!svg) return null
  const base = import.meta.env.BASE_URL || './'
  const prefix = base.endsWith('/') ? base : base + '/'
  return `${prefix}banks/${svg}`
}

export function findBankById(banks, id) { return banks.find((b) => b.id === id) }
export function findBankName(banks, id, customBankName) { if (id === 'other' || !id) return customBankName || 'سایر'; const bank = findBankById(banks, id); return bank ? bank.name : customBankName || 'سایر' }
export function getBankInitial(name) { return name ? name.charAt(0) : '؟' }

const FALLBACK_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#4f46e5', '#be123c', '#0369a1', '#9333ea']
export function getBankColor(id) { if (!id) return FALLBACK_COLORS[0]; const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0); return FALLBACK_COLORS[hash % FALLBACK_COLORS.length] }
