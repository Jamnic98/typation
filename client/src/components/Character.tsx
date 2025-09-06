import { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import {
  defaultFontSettings,
  STYLE_FIXED,
  STYLE_HIT,
  STYLE_MISS,
  STYLE_UNFIXED,
  STYLE_NONE,
  STYLE_PENDING,
} from 'utils/constants'
import { getCursorStyle } from 'utils/helpers'
import { type TypingWidgetSettings, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  typedChar?: string
  isActive: boolean
  typedStatus: TypedStatus
  typingWidgetSettings?: TypingWidgetSettings
}

export const typedStatusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: STYLE_MISS,
  [TypedStatus.FIXED]: STYLE_FIXED,
  [TypedStatus.UNFIXED]: STYLE_UNFIXED,
  [TypedStatus.PENDING]: STYLE_PENDING,
  [TypedStatus.HIT]: STYLE_HIT,
  [TypedStatus.NONE]: STYLE_NONE,
}

export const CharacterComponent = ({
  char,
  typedChar,
  isActive = false,
  typedStatus = TypedStatus.NONE,
  typingWidgetSettings = defaultFontSettings,
}: CharacterProps) => {
  const [wasTyped, setWasTyped] = useState(false)

  useEffect(() => {
    if ((typedStatus === TypedStatus.HIT || typedStatus === TypedStatus.FIXED) && !wasTyped) {
      setWasTyped(true)
    }
    if (typedStatus !== TypedStatus.HIT && typedStatus !== TypedStatus.FIXED && wasTyped) {
      setWasTyped(false)
    }
  }, [typedStatus, wasTyped])

  const fontSettingsClass = useMemo(() => {
    return Object.entries(typingWidgetSettings)
      .map(([key, value]) => {
        if (key === 'fontSize') return `text-${value}`
      })
      .join(' ')
  }, [typingWidgetSettings])

  const typedStatusClass = typedStatusStyles[typedStatus]
  const spaceSymbol = spaceSymbolMap[typingWidgetSettings?.spaceSymbol || SpaceSymbols.UNDERSCORE]

  // Decide what to display
  let displayChar: string
  if ((typedStatus === TypedStatus.MISS || typedStatus === TypedStatus.UNFIXED) && typedChar) {
    if (typedChar === ' ' && char !== ' ') {
      // user typed a space instead of a letter → show dot + strikethrough
      displayChar = spaceSymbol
    } else {
      displayChar = typedChar
    }
  } else {
    // default: original char (replace space with spaceSymbol)
    displayChar = char === ' ' && spaceSymbol ? spaceSymbol : char
  }

  return (
    <span className="inline-block relative w-[1ch] align-baseline">
      {/* Character background */}
      <span
        aria-hidden="true"
        data-testid="background-character"
        className={`${typedStatusClass} ${fontSettingsClass} absolute inset-0 select-none`}
      >
        {displayChar}
      </span>

      {/* Foreground animation */}
      <AnimatePresence mode="popLayout">
        {!wasTyped && (
          <motion.span
            data-testid="foreground-character"
            key={`${displayChar}-${typedStatus}`}
            className={`${typedStatusClass} ${fontSettingsClass} relative z-10 inline-block ${
              typedStatus === TypedStatus.MISS && typedChar === ' ' && char !== ' '
                ? 'line-through'
                : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              x: Math.random() * -20 - 0.5,
              y: Math.floor(Math.random()) + 25,
              rotate: (Math.random() - 0.5) * 360,
              scale: 0.9 + Math.random() * 0.1,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {displayChar}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Blinking cursor overlay */}
      {isActive && (
        <span
          className={`absolute inset-0 ${getCursorStyle(typingWidgetSettings?.cursorStyle)}`}
          data-testid="character-cursor"
        />
      )}
    </span>
  )
}

export const Character = memo(CharacterComponent)
