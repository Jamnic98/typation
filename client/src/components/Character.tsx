import { useMemo } from 'react'

import { defaultFontSettings } from 'utils/constants'
import { CursorStyles, FontSettings, SpaceSymbol, spaceSymbolMap, TypedStatus } from 'types'

export interface CharacterProps {
  char: string
  highlighted: boolean
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
  highlighted,
  typedStatus,
  fontSettings = defaultFontSettings,
}: CharacterProps) => {
  const parseFontSettings = (settings: FontSettings) =>
    useMemo(() => {
      Object.entries(settings)
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
    }, [])

  const setHighlightedStyle = (cursorStyle: CursorStyles | undefined): string => {
    // return 'animate-flash-block'
    switch (cursorStyle) {
      // case CursorStyles.UNDERSCORE:
      //   return 'animate-flash-underscore'
      case CursorStyles.BLOCK:
        return 'animate-flash-block'
      default:
        return 'animate-flash-block'
    }
  }

  const fontSettingsClass = fontSettings ? parseFontSettings(fontSettings) : ''

  const highlightedClass = highlighted ? setHighlightedStyle(fontSettings?.cursorStyle) : ''
  const typedStatusClass = typedStatusStyles[typedStatus]

  const spaceSymbol = spaceSymbolMap[fontSettings?.spaceSymbol || SpaceSymbol.UNDERSCORE]

  return (
    <span data-testid="character-cursor" className={`${highlightedClass}`}>
      <span
        className={`${typedStatusClass} ${fontSettingsClass} inline-flex w-[0.1em] h-[0.5em] justify-center items-center leading-none px-[0.4em]`}
        data-testid="character"
      >
        {char === ' ' && spaceSymbol ? spaceSymbol : char}
      </span>
    </span>
  )
}
