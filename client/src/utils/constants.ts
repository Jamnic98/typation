import { CursorStyles, FontSettings, FontSizes, SpaceSymbols } from 'types'

export const defaultFontSettings: FontSettings = {
  textColor: 'black',
  fontSize: FontSizes.FOUR_XL,
  spaceSymbol: SpaceSymbols.DOT,
  cursorStyle: CursorStyles.UNDERSCORE,

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

// create an array of all possible char pair combinations from CHAR_ARRAY
export const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) =>
  CHAR_ARRAY.map((char2) => ({ charPair: char1 + char2, hit: 0, miss: 0 }))
)
