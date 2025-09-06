import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { TypingWidgetSettings } from 'components'
import { LuSettings } from 'react-icons/lu'

/**
 * ToolbarWithOverlay (minimal + layout-safe)
 * - Transparent toolbar; only a big bold caret is visible.
 * - Clicking opens a full-page overlay (no layout shift) directly above the typing UI.
 * - The overlay is a blank surface (full width/height) for settings you can add later.
 * - ESC/click-outside closes. Caret flips with animation (flipped when closed by default).
 */
export default function ToolbarWithOverlay({
  onToggle,
  initialOpen = false,
  title = 'Settings',
  containerMaxWidthClass = 'max-w-5xl', // align with your page container
}: {
  onToggle?: (open: boolean) => void
  initialOpen?: boolean
  title?: string
  /** Tailwind class that matches your page/container width (e.g., max-w-4xl/5xl/6xl). */
  containerMaxWidthClass?: string
}) {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus management
  useEffect(() => {
    if (isOpen) panelRef.current?.focus()
    else buttonRef.current?.focus()
  }, [isOpen])

  // const handleClickSave: any = () => {}

  return (
    <>
      {/* Toolbar (transparent, only shows caret); place above TypingWidgetText */}
      <div className="relative z-30 h-8 w-full bg-transparent pointer-events-none">
        <div className="flex h-full items-center justify-end px-2 pointer-events-auto">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="toolbar-dropdown"
            className="select-none bg-transparent p-1 outline-none"
            title={isOpen ? 'Close text settings' : 'Open text settings'}
          >
            {/* Large bold caret; flipped by default when closed */}
            <span
              className={[
                'cursor-pointer text-3xl font-extrabold leading-none transition-transform duration-300 will-change-transform select-none',
                isOpen ? 'rotate-0' : '-rotate-180',
              ].join(' ')}
              aria-hidden
            >
              <LuSettings className="text-[1.5rem] text-gray-200 hover:text-gray-500 transition-transform duration-300 hover:rotate-90" />
            </span>
          </button>
        </div>
      </div>

      {/* Scrim covers page to catch outside clicks; dropdown is constrained to your page width */}
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
            {/* translucent background */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Constrained container that matches your page width */}
            <div
              className={['relative mx-auto', containerMaxWidthClass].join(' ')}
              aria-label={`${title} container`}
            >
              {/* Dropdown panel positioned near the top, underneath the toolbar area */}
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
                {/* Close X button */}
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setIsOpen(false)}
                  className="text-lg cursor-pointer absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
                >
                  x
                </button>

                {/* Blank interior; stretch full width of container; height auto so it's a dropdown */}
                <div className="w-full p-4">
                  <h1 className="text-xl font-semibold">Typing Interface Settings</h1>
                  <TypingWidgetSettings />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
