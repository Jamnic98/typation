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
import { getCursorStyle, randomRotation } from 'utils/helpers'
import { type FontSettings, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  isActive: boolean
  typedStatus: TypedStatus
  fontSettings?: FontSettings
}

export const typedStatusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: STYLE_MISS,
  [TypedStatus.CORRECTED]: STYLE_CORRECTED,
  [TypedStatus.NON_FIX_DELETE]: STYLE_NON_FIX_DELETE,
  [TypedStatus.PENDING]: STYLE_PENDING,
  [TypedStatus.HIT]: STYLE_HIT,
  [TypedStatus.NONE]: STYLE_NONE,
}

export const CharacterComponent = ({
  char,
  isActive = false,
  typedStatus = TypedStatus.NONE,
  fontSettings = defaultFontSettings,
}: CharacterProps) => {
  const [wasTyped, setWasTyped] = useState(false)

  useEffect(() => {
    // Animate when status becomes HIT or CORRECTED
    if ((typedStatus === TypedStatus.HIT || typedStatus === TypedStatus.CORRECTED) && !wasTyped) {
      setWasTyped(true)
    }
    // Reset wasTyped if typedStatus moves away, so animation can trigger again
    if (typedStatus !== TypedStatus.HIT && typedStatus !== TypedStatus.CORRECTED && wasTyped) {
      setWasTyped(false)
    }
  }, [typedStatus, wasTyped])

  const fontSettingsClass = useMemo(() => {
    return Object.entries(fontSettings)
      .map(([key, value]) => {
        // if (key === 'textColor') return `text-${value}`
        if (key === 'fontSize') return `text-${value}`
        // if (key === 'fontFamily') return `font-${value}`
        // if (key === 'textAlign') return `text-${value}`
        // if (key === 'textDecoration') return `decoration-${value}`
        // if (key === 'textTransform') return `uppercase`
        // if (key === 'textShadow') return `shadow-${value}`
        // if (key === 'textOverflow') return `overflow-${value}`
        // if (key === 'textIndent') return `indent-${value}`
        // if (key === 'textJustify') return `justify-${value}`
        // if (key === 'textLineHeight') return `leading-${value}`
        // if (key === 'textLetterSpacing') return `tracking-${value}`
        // if (key === 'textWordSpacing') return `word-spacing-${value}`
        return
      })
      .join(' ')
  }, [fontSettings])

  const typedStatusClass = typedStatusStyles[typedStatus]
  const cursorClass = isActive ? getCursorStyle(fontSettings?.cursorStyle) : ''
  const spaceSymbol = spaceSymbolMap[fontSettings?.spaceSymbol || SpaceSymbols.UNDERSCORE]

  return (
    <span data-testid="character-cursor" className={`${cursorClass}`}>
      <span className={`w-[1ch] inline-block relative h-4`}>
        <span
          data-testid="background-character"
          aria-hidden="true"
          className={`${typedStatusClass} ${fontSettingsClass} absolute top-0 left-0 w-full h-full select-none`}
        >
          {char === ' ' && spaceSymbol ? spaceSymbol : char}
        </span>

        {/* Foreground animated letter */}
        <AnimatePresence mode="popLayout">
          {!wasTyped && (
            <motion.span
              key={typedStatus}
              className={`${typedStatusClass} ${fontSettingsClass} z-10`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: Math.floor(Math.random() * 10) + 50,
                rotate: randomRotation,
              }}
              transition={{ duration: 0.3 }}
              data-testid="foreground-character"
            >
              {char === ' ' && spaceSymbol ? spaceSymbol : char}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}

export const Character = memo(CharacterComponent)
