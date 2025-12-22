import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuSettings } from 'react-icons/lu'

import { type ComponentSettings, TypingWidgetSettings } from 'components'

export const Toolbar = ({
  title = 'Settings',
  containerMaxWidthClass = 'max-w-5xl',
  initialOpen = false,
  settings,
  onSaveSettings,
  onOpenChange,
}: {
  title?: string
  containerMaxWidthClass?: string
  initialOpen?: boolean
  settings: ComponentSettings
  onSaveSettings: (next: ComponentSettings) => void
  onOpenChange: (isSettinsOpen: boolean) => void
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const [isAnimating, setIsAnimating] = useState(false)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleToggle = () => {
    // prevent flicker during animation
    if (isAnimating) return
    setIsAnimating(true)
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen])

  useEffect(() => {
    const btn = buttonRef.current
    if (!btn) return

    const handleTransitionEnd = () => {
      setIsAnimating(false) // unlock after animation
    }

    btn.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      btn.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div>
      {/* Transparent toolbar with only the icon visible */}
      <div className="relative h-8 w-full bg-transparent pointer-events-none">
        <div className="flex h-full items-center justify-start px-2 pointer-events-auto">
          <button
            tabIndex={-1}
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
              <LuSettings className="text-[1.2rem] text-gray-300 hover:text-gray-500 transition-transform duration-300" />
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
              className={['relative mx-auto flex justify-center', containerMaxWidthClass].join(' ')}
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
                className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 mt-28 z-50 max-w-sm"
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
                  <h1 className="text-xl font-semibold mb-2">Typing Settings</h1>

                  <TypingWidgetSettings
                    initial={settings}
                    onSave={(next) => {
                      onSaveSettings(next)
                      setIsOpen(false)
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
