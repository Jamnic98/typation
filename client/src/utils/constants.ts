import { type ComponentSettings } from 'components'
import { type State, CursorStyles, SpaceSymbols } from 'types'

export const DEFAULT_SESSION_DURATION = 60

export const defaultWidgetSettings: ComponentSettings = {
  spaceSymbol: SpaceSymbols.DOT,
  cursorStyle: CursorStyles.UNDERSCORE,

  showBigKeyboard: true,
  showCurrentLetter: true,
  characterAnimationEnabled: true,
  showProgressBar: true,

  testDuration: DEFAULT_SESSION_DURATION,

  minWordLength: 3,
  maxWordLength: 8,

  // fontFamily: 'monospace',
  // fontWeight: 'bold',',

  // textLineHeight: 'normal',
  // textLetterSpacing: 'normal',
  // textWordSpacing: 'normal',
}

export const GRAPHQL_ENDPOINT = '/graphql'

export const AVERAGE_WORD_LENGTH = 5

// typable characters used in the typing test
const SPACE = ' '
// const NUMBERS = '0123456789'
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
// const ALPHABET_UPPERCASE = ALPHABET.toUpperCase()
// const SPECIAL_CHARS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'

export const TYPABLE_CHARS_ARRAY = `${SPACE}${ALPHABET}`.split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
export const CHAR_ARRAY_PAIRS = TYPABLE_CHARS_ARRAY.map((char1) =>
  TYPABLE_CHARS_ARRAY.map((char2) => ({ charPair: char1 + char2, hit: 0, miss: 0 }))
)

// localStorage keys
export const LOCAL_STORAGE_TOKEN_KEY = 'token'
export const LOCAL_STORAGE_USER_KEY = 'user'
export const LOCAL_STORAGE_TEXT_KEY = 'typingText'
export const LOCAL_STORAGE_CORPUS_KEY = 'corpus'
export const LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY = 'firstVisitFlag'

export const TYPING_WIDGET_INITIAL_STATE: State = {
  wpm: 0,
  netWpm: 0,
  accuracy: 0,
  rawAccuracy: 0,
  totalCharsTyped: 0,
  correctedCharCount: 0,
  errorCharCount: 0,
  deletedCharCount: 0,
  stopWatchTime: 0,
  phase: 'idle',
  text: '',
}

export const DEFAULT_CAROUSEL_INTERVAL = 8000 // 8 seconds

// endpoints
export const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
export const authEndpoint = `${baseUrl}/auth`

// Character styles
export const STYLE_HIT = 'text-green-600 font-extrabold'
export const STYLE_MISS = 'text-red-600 line-through'
export const STYLE_FIXED = 'text-green-400 italic'
export const STYLE_UNFIXED = 'text-gray-400 line-through italic opacity-60'
export const STYLE_PENDING = 'text-yellow-600 italic'
export const STYLE_NONE = 'text-black font-extralight'

export const LABEL_MAP: Record<string, string> = {
  wpm: 'WPM',
  netWpm: 'Net WPM',
  accuracy: 'Accuracy',
  rawAccuracy: 'Raw Accuracy',
}

// typing widget text
export const LINE_LENGTH = 80
export const ROW_HEIGHT = 1.5
export const GAP = 0.5
export const LINE_SPACING = ROW_HEIGHT + GAP
export const VISIBLE_LINES = 4
export const CONTAINER_HEIGHT = LINE_SPACING * VISIBLE_LINES
export const INITIAL_OFFSET = 1
