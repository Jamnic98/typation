import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

interface ModalProps {
  isOpen: boolean
  title?: string
  children: React.ReactNode
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          {/* Backdrop: blur is immediate; only the tint fades */}
          <motion.div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.2, ease: 'linear' }}
            onClick={onClose}
            style={{ willChange: 'backdrop-filter, background-color' }}
          />

          {/* Modal layer (no wrapper opacity animation) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="relative w-full max-w-lg rounded-lg bg-white shadow-lg p-6 flex flex-col"
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                {title && (
                  <h2 className="mx-auto text-xl font-semibold text-gray-800 tracking-wide">
                    {title}
                  </h2>
                )}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
