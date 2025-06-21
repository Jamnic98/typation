import { CursorStyles, FontSizes, SpaceSymbols, type FontSettings } from 'types'

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

export const AVERAGE_WORD_LENGTH = 5

// typable characters used in the typing test
const SPACE = ' '
const NUMBERS = '0123456789'
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const ALPHABET_UPPERCASE = ALPHABET.toUpperCase()
const SPECIAL_CHARS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'

const TYPABLE_CHARS_ARRAY =
  `${SPACE}${NUMBERS}${ALPHABET}${ALPHABET_UPPERCASE}${SPECIAL_CHARS}`.split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
export const CHAR_ARRAY_PAIRS = TYPABLE_CHARS_ARRAY.map((char1) =>
  TYPABLE_CHARS_ARRAY.map((char2) => ({ charPair: char1 + char2, hit: 0, miss: 0 }))
)

// localStorage keys
export const LOCAL_STORAGE_TEXT_KEY = 'typingText'
export const LOCAL_STORAGE_COMPLETED_KEY = 'typingCompleted'

export const MIN_ELAPSED_TIME_MS = 1000
