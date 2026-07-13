import Modal from './Modal'

export default function UnsavedDialog({ open, onSave, onDiscard, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title="ذخیره تغییرات؟" size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
        تغییراتی که انجام دادید ذخیره نشده. آیا می‌خواهید ذخیره کنید؟
      </p>
      <div className="flex flex-col gap-2">
        <button onClick={onSave} className="btn-primary w-full">ذخیره</button>
        <button onClick={onDiscard} className="btn-ghost w-full">ذخیره نکن</button>
        <button onClick={onCancel} className="btn-ghost w-full">انصراف</button>
      </div>
    </Modal>
  )
}
