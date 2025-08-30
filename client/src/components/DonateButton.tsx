import { useState } from 'react'
import { Modal } from 'components/Modal'

export const DonateButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-red-400 text-red-500 hover:bg-red-50 rounded-lg font-medium transition cursor-pointer"
      >
        ❤️ Support Typation
      </button>

      {/* Reuse your Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Support Typation">
        <div className="w-full h-[600px]">
          <iframe
            src="https://ko-fi.com/typation/?hidefeed=true&widget=true&embed=true&preview=true"
            className="w-full h-full rounded-b-lg"
            style={{ border: 'none', background: '#f9f9f9' }}
            title="Support Typation on Ko-fi"
          />
        </div>
      </Modal>
    </>
  )
}
