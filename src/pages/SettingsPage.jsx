import { useState, useRef } from 'react'
import { Download, Upload, Moon, Sun, Plus, Trash2, Building2, FileText, CircleAlert as AlertCircle } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'

export default function SettingsPage({ store }) {
  const { settings, updateSettings, exportBackup, getBackupFileName, importBackup, customBills, addCustomBill, deleteCustomBill, customBanks, addCustomBank } = store
  const [restoreError, setRestoreError] = useState('')
  const [billModalOpen, setBillModalOpen] = useState(false)
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [newBillName, setNewBillName] = useState('')
  const [newBankName, setNewBankName] = useState('')
  const [deleteBillId, setDeleteBillId] = useState(null)
  const [toast, setToast] = useState('')
  const fileInputRef = useRef(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleExport = async () => {
    const json = exportBackup()
    const fileName = getBackupFileName()

    try {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')

      const result = await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      })

      await Share.share({
        title: 'فایل پشتیبان حسابدار',
        text: 'فایل پشتیبان اپلیکیشن حسابدار شخصی',
        url: result.uri,
        dialogTitle: 'اشتراک‌گذاری فایل پشتیبان'
      })
      showToast('فایل پشتیبان ذخیره و آماده اشتراک‌گذاری شد')
      return
    } catch (e) {
      console.log('Capacitor filesystem not available, using blob download', e)
    }

    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('فایل پشتیبان دانلود شد')
    } catch (e) {
      console.error('Download failed', e)
      showToast('خطا در ذخیره فایل پشتیبان')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const result = importBackup(text)
      if (result.success) {
        showToast('بازیابی اطلاعات با موفقیت انجام شد')
      } else {
        setRestoreError('فایل پشتیبان نامعتبر است')
      }
    }
    reader.onerror = () => setRestoreError('خطا در خواندن فایل')
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleRestoreClick = () => { fileInputRef.current?.click() }

  const handleAddBill = () => {
    if (!newBillName.trim()) return
    addCustomBill(newBillName)
    setNewBillName('')
    setBillModalOpen(false)
  }

  const handleAddBank = () => {
    if (!newBankName.trim()) return
    addCustomBank(newBankName)
    setNewBankName('')
    setBankModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">تنظیمات</h1>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800 px-4 py-2.5 rounded-xl shadow-card text-sm font-medium animate-slideUp">
          {toast}
        </div>
      )}

      {restoreError && (
        <div className="card p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{restoreError}</span>
          <button onClick={() => setRestoreError('')} className="mr-auto text-slate-400">×</button>
        </div>
      )}

      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">ظاهر</h3>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`chip flex-1 justify-center ${settings.theme === 'light' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Sun size={18} /> روشن
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`chip flex-1 justify-center ${settings.theme === 'dark' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <Moon size={18} /> تاریک
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">واحد پول</h3>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ currency: 'rial' })}
            className={`chip flex-1 justify-center ${settings.currency === 'rial' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            ریال
          </button>
          <button
            onClick={() => updateSettings({ currency: 'toman' })}
            className={`chip flex-1 justify-center ${settings.currency === 'toman' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            تومان
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">پشتیبان‌گیری و بازیابی</h3>
        <div className="space-y-2">
          <button onClick={handleExport} className="w-full flex items-center gap-2 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/30 transition active:scale-95">
            <Download size={20} /> ذخیره نسخه پشتیبان
          </button>
          <button onClick={handleRestoreClick} className="w-full flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition active:scale-95">
            <Upload size={20} /> بازیابی از نسخه پشتیبان
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileSelect} className="hidden" />
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1">فایل پشتیبان شامل تمام داده‌ها و حساب‌های ذخیره شده است</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">قبوض سفارشی</h3>
          <button onClick={() => setBillModalOpen(true)} className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition active:scale-90">
            <Plus size={18} />
          </button>
        </div>
        {customBills.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">قبض سفارشی وجود ندارد</p>
        ) : (
          <div className="space-y-1.5">
            {customBills.map((b) => (
              <div key={b.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <FileText size={16} className="text-slate-400" />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{b.name}</span>
                <button onClick={() => setDeleteBillId(b.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">بانک‌های سفارشی</h3>
          <button onClick={() => setBankModalOpen(true)} className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition active:scale-90">
            <Plus size={18} />
          </button>
        </div>
        {customBanks.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">بانک سفارشی وجود ندارد</p>
        ) : (
          <div className="space-y-1.5">
            {customBanks.map((b) => (
              <div key={b.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <Building2 size={16} className="text-slate-400" />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{b.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">حسابدار شخصی نسخه ۱.۰</p>
      </div>

      <Modal
        open={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        title="افزودن قبض سفارشی"
        footer={<button onClick={handleAddBill} disabled={!newBillName.trim()} className="btn-primary w-full disabled:opacity-50">افزودن</button>}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نام قبض</label>
          <input type="text" value={newBillName} onChange={(e) => setNewBillName(e.target.value)} className="input-field" placeholder="مثلاً قبض اینترنت" autoFocus />
        </div>
      </Modal>

      <Modal
        open={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="افزودن بانک سفارشی"
        footer={<button onClick={handleAddBank} disabled={!newBankName.trim()} className="btn-primary w-full disabled:opacity-50">افزودن</button>}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نام بانک</label>
          <input type="text" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="input-field" placeholder="نام بانک..." autoFocus />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteBillId}
        title="حذف قبض"
        message="آیا از حذف این قبض سفارشی مطمئن هستید؟"
        danger
        confirmText="حذف"
        onConfirm={() => { deleteCustomBill(deleteBillId); setDeleteBillId(null) }}
        onCancel={() => setDeleteBillId(null)}
      />
    </div>
  )
}
