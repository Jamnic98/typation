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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={onClose}
          />

          {/* Modal box */}
          <motion.div
            className="relative w-full max-w-lg rounded-lg bg-white shadow-lg p-6 flex flex-col z-10"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} // springy ease
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h2 className="mx-auto text-xl font-semibold text-gray-800 tracking-wide">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition hover:cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
