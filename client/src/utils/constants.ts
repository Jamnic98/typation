import { CursorStyles, FontSettings, FontSizes, SpaceSymbols } from 'types'

export const defaultFontSettings: FontSettings = {
  textColor: 'black',
  fontSize: FontSizes.FOUR_XL,
  spaceSymbol: SpaceSymbols.DOT,
  cursorStyle: CursorStyles.OUTLINE,
  // fontFamily: 'monospace',
  // fontWeight: 'bold',
  // textAlign: 'left',
  // textDecoration: 'none',
  // textTransform: 'none',
  // textShadow: 'none',
  // textOverflow: 'clip',
  // textIndent: '0px',
  // textJustify: 'auto',
  // textLineHeight: 'normal',
  // textLetterSpacing: 'normal',
  // textWordSpacing: 'normal',
}

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
export const CHAR_ARRAY = (' ' + ALPHABET).split('')
