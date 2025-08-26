interface ModalProps {
  isOpen: boolean
  title?: string
  children: React.ReactNode
  onClose: () => void
  onOk?: () => void
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, onOk, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div
        className="relative w-full max-w-lg rounded-md bg-white shadow-lg p-6 flex flex-col z-10 -mt-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {title && (
            <h2 className="mx-auto text-2xl font-semibold text-gray-800 tracking-wide">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-md hover:cursor-pointer p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="flex-1">{children}</div>

        {/* OK Button (optional) */}
        {onOk && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onOk}
              className="rounded-md bg-blue-500 px-8 py-2 text-white hover:bg-blue-600 transition hover:cursor-pointer"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
