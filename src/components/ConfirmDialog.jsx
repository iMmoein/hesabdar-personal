import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmText = 'تایید', cancelText = 'انصراف', onConfirm, onCancel, danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost flex-1">{cancelText}</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}>{confirmText}</button>
      </div>
    </Modal>
  )
}
