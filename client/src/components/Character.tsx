import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { defaultFontSettings } from 'utils/constants'
import { CursorStyles, FontSettings, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  isActive: boolean
  typedStatus: TypedStatus
  fontSettings?: FontSettings
}

const typedStatusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: 'text-red-500',
  [TypedStatus.HIT]: 'text-green-500',
  [TypedStatus.NONE]: 'text-black',
}

export const Character = ({
  char,
  isActive,
  typedStatus,
  fontSettings = defaultFontSettings,
}: CharacterProps) => {
  const randomRotation = Math.floor(Math.random() * 201) - 100
  const setHighlightedStyle = (cursorStyle: CursorStyles | undefined): string => {
    // return 'animate-flash-block'
    switch (cursorStyle) {
      case CursorStyles.UNDERSCORE:
        return 'animate-flash-underscore'
      case CursorStyles.BLOCK:
        return 'animate-flash-block'
      default:
        return 'animate-flash-block'
    }
  }

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
        return ''
      })
      .join(' ')
  }, [fontSettings])

  const cursorClass = isActive ? setHighlightedStyle(fontSettings?.cursorStyle) : ''
  const typedStatusClass = typedStatusStyles[typedStatus]

  const spaceSymbol = spaceSymbolMap[fontSettings?.spaceSymbol || SpaceSymbols.UNDERSCORE]

  // Decide if the letter should be visible or falling (typed)
  // Let's say TypedStatus.HIT means typed correctly, so letter should fall away and disappear
  const isVisible = typedStatus !== TypedStatus.HIT

  return (
    <span
      data-testid="character-cursor"
      className={`${cursorClass} w-[1ch] inline-block relative h-4`}
    >
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
            // key={`char-${char}-${typedStatus === TypedStatus.NONE ? 'HIT' : 'VISIBLE'}`}
            className={`${typedStatusClass} ${fontSettingsClass} z-10 relative`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: Math.floor(Math.random() * 100) + 50,
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
  )
}
