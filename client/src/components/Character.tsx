import { memo, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { defaultFontSettings } from 'utils/constants'
import { getCursorStyle, randomRotation } from 'utils/helpers'
import { FontSettings, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  isActive: boolean
  typedStatus: TypedStatus
  fontSettings?: FontSettings
}

const typedStatusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: 'text-red-500 line-through',
  [TypedStatus.HIT]: 'text-green-500',
  [TypedStatus.NONE]: 'text-black',
}

export const CharacterComponent = ({
  char,
  isActive,
  typedStatus,
  fontSettings = defaultFontSettings,
}: CharacterProps) => {
  const fontSettingsClass = useMemo(() => {
    return Object.entries(fontSettings)
      .map(([key, value]) => {
        // if (key === 'textColor') return `text-${value}`
        // if (key === 'fontSize') return `text-${value}`
        // if (key === 'fontFamily') return `font-${value}`
        if (key === 'fontWeight') return `font-${value}`
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

  // Decide if the letter should be visible or falling (typed)
  const isVisible = typedStatus !== TypedStatus.HIT

  return (
    <span data-testid="character-cursor" className={`${cursorClass}`}>
      <span className={`w-[1ch] inline-block relative h-4`}>
        {/* Background "ghost" letter to avoid layout shift */}
        <span
          data-testid="background-character"
          aria-hidden="true"
          className={`${typedStatusClass} ${fontSettingsClass} absolute top-0 left-0 w-full h-full select-none`}
        >
          {char === ' ' && spaceSymbol ? spaceSymbol : char}
        </span>

        {/* Foreground animated letter */}
        <AnimatePresence mode="popLayout">
          {isVisible && (
            <motion.span
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
