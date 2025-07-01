import { CursorStyles, FontSizes, SpaceSymbols, type State, type FontSettings } from 'types'

export const defaultFontSettings: FontSettings = {
  textColor: 'black',
  fontSize: FontSizes.MD,
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

export const TYPABLE_CHARS_ARRAY =
  `${SPACE}${NUMBERS}${ALPHABET}${ALPHABET_UPPERCASE}${SPECIAL_CHARS}`.split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
export const CHAR_ARRAY_PAIRS = TYPABLE_CHARS_ARRAY.map((char1) =>
  TYPABLE_CHARS_ARRAY.map((char2) => ({ charPair: char1 + char2, hit: 0, miss: 0 }))
)

// localStorage keys
export const LOCAL_STORAGE_TEXT_KEY = 'typingText'
export const LOCAL_STORAGE_COMPLETED_KEY = 'typingCompleted'

export const TYPING_WIDGET_INITIAL_STATE: State = {
  wpm: 0,
  accuracy: 0,
  stopWatchTime: 0,
  runStopWatch: false,
  text: '',
}

// endpoints
export const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
export const authEndpoint = `${baseUrl}/auth`

// Character styles
export const STYLE_MISS = 'text-red-600 line-through'
export const STYLE_CORRECTED = 'text-green-400 italic'
export const STYLE_PENDING = 'text-yellow-600 italic'
export const STYLE_HIT = 'text-green-600 font-bold'
export const STYLE_NONE = 'text-black'
