import { memo, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import {
  defaultFontSettings,
  STYLE_CORRECTED,
  STYLE_HIT,
  STYLE_MISS,
  STYLE_NON_FIX_DELETE,
  STYLE_NONE,
  STYLE_PENDING,
} from 'utils/constants'
import { getCursorStyle } from 'utils/helpers'
import { type FontSettings, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  typedChar?: string
  isActive: boolean
  typedStatus: TypedStatus
  fontSettings?: FontSettings
}

export const typedStatusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: STYLE_MISS,
  [TypedStatus.FIXED]: STYLE_CORRECTED,
  [TypedStatus.UNFIXED]: STYLE_NON_FIX_DELETE,
  [TypedStatus.PENDING]: STYLE_PENDING,
  [TypedStatus.HIT]: STYLE_HIT,
  [TypedStatus.NONE]: STYLE_NONE,
}

export const CharacterComponent = ({
  char,
  typedChar,
  isActive = false,
  typedStatus = TypedStatus.NONE,
  fontSettings = defaultFontSettings,
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
    return Object.entries(fontSettings)
      .map(([key, value]) => {
        if (key === 'fontSize') return `text-${value}`
        return
      })
      .join(' ')
  }, [fontSettings])

  const typedStatusClass = typedStatusStyles[typedStatus]
  const cursorClass = isActive ? getCursorStyle(fontSettings?.cursorStyle) : ''
  const spaceSymbol = spaceSymbolMap[fontSettings?.spaceSymbol || SpaceSymbols.UNDERSCORE]

  // Decide what to display
  let displayChar: string

  if (typedStatus === TypedStatus.MISS && typedChar) {
    if (typedChar === ' ' && char !== ' ') {
      // user typed a space instead of a letter → mark with dot + strikethrough
      displayChar = '·'
    } else {
      displayChar = typedChar
    }
  } else {
    // default: original char (replace space with spaceSymbol)
    displayChar = char === ' ' && spaceSymbol ? spaceSymbol : char
  }

  return (
    <span data-testid="character-cursor" className={cursorClass}>
      <span className="w-[1ch] inline-block relative h-4">
        <span
          data-testid="background-character"
          aria-hidden="true"
          className={`${typedStatusClass} ${fontSettingsClass} absolute top-0 left-0 select-none`}
        >
          {displayChar}
        </span>

        <AnimatePresence mode="popLayout">
          {!wasTyped && (
            <motion.span
              key={`${displayChar}-${typedStatus}`}
              className={`${typedStatusClass} ${fontSettingsClass} z-10 inline-block ${
                typedStatus === TypedStatus.MISS && typedChar === ' ' && char !== ' '
                  ? 'line-through'
                  : ''
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                x: -Math.random() * 10,
                y: Math.floor(Math.random() * 5) + 50,
                rotate: (Math.random() - 0.5) * 360,
                scale: 0.9 + Math.random() * 0.1,
              }}
              transition={{ duration: 0.5 }}
              data-testid="foreground-character"
            >
              {displayChar}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}

export const Character = memo(CharacterComponent)
