import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuSettings } from 'react-icons/lu'

import { type ComponentSettings, TypingWidgetSettings } from 'components'

export const Toolbar = ({
  title = 'Settings',
  containerMaxWidthClass = 'max-w-5xl',
  initialOpen = false,
  settings, // <- current settings from parent
  onSaveSettings, // <- parent save handler
}: {
  title?: string
  containerMaxWidthClass?: string
  initialOpen?: boolean
  settings: ComponentSettings
  onSaveSettings: (next: ComponentSettings) => void
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleToggle = () => setIsOpen((o) => !o)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (isOpen) panelRef.current?.focus()
    else buttonRef.current?.focus()
  }, [isOpen])

  return (
    <>
      {/* Transparent toolbar with only the icon visible */}
      <div className="relative z-30 h-8 w-full bg-transparent pointer-events-none">
        <div className="flex h-full items-center justify-end px-2 pointer-events-auto">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="toolbar-dropdown"
            className="select-none bg-transparent p-1 outline-none"
            title={isOpen ? 'Close interface settings' : 'Open interface settings'}
          >
            <span
              className={[
                'cursor-pointer text-3xl font-extrabold leading-none transition-transform duration-300 will-change-transform select-none',
                isOpen ? 'rotate-0' : '-rotate-180',
              ].join(' ')}
              aria-hidden
            >
              <LuSettings className="text-[1.2rem] text-gray-200 hover:text-gray-500 transition-transform duration-300 hover:rotate-90" />
            </span>
          </button>
        </div>
      </div>

      {/* Scrim + dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/30" />

            <div
              className={['relative mx-auto', containerMaxWidthClass].join(' ')}
              aria-label={`${title} container`}
            >
              <motion.div
                id="toolbar-dropdown"
                role="dialog"
                aria-modal="true"
                aria-label={`${title} panel`}
                ref={panelRef}
                tabIndex={-1}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 mt-28"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setIsOpen(false)}
                  className="text-lg cursor-pointer absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                >
                  ×
                </button>

                <div className="w-full p-4">
                  <h1 className="text-xl font-semibold mb-2">Typing Interface Settings</h1>

                  <TypingWidgetSettings
                    initial={settings}
                    onSave={(next) => {
                      onSaveSettings(next) // update parent
                      setIsOpen(false) // close on save
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
