export enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  CORRECTED = 'corrected',
  PENDING = 'pending',
  NONE = 'none',
  NON_FIX_DELETE = 'nonFixDelete',
}

export enum SpaceSymbols {
  UNDERSCORE = 'underscore',
  DOT = 'dot',
  NONE = 'none',
}

export const spaceSymbolMap: Record<SpaceSymbols, string> = {
  [SpaceSymbols.UNDERSCORE]: '_',
  [SpaceSymbols.DOT]: '·',
  [SpaceSymbols.NONE]: ' ',
}

export type FontSettings = {
  cursorStyle?: CursorStyles
  spaceSymbol?: SpaceSymbols
  textColor?: string
  fontSize?: FontSizes
  fontFamily?: string
  fontWeight?: string
  textAlign?: string
  textDecoration?: string
  textTransform?: string
  textShadow?: string
  textOverflow?: string
  textIndent?: string
  textJustify?: string
  textLineHeight?: string
  textLetterSpacing?: string
  textWordSpacing?: string
}

export enum FontSizes {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  TWO_XL = '2xl',
  THREE_XL = '3xl',
  FOUR_XL = '4xl',
}

export enum CursorStyles {
  UNDERSCORE = 'underscore',
  BLOCK = 'block',
  OUTLINE = 'outline',
  PIPE = 'pipe',
}

export enum StopWatchState {
  RUNNING = 'running',
  STOPPED = 'stopped',
}

export type State = {
  wpm: number
  accuracy: number
  stopWatchTime: number
  runStopWatch: boolean
  text: string
}

type UpdateStatsPayload = {
  wpm?: number
  accuracy?: number
  errorCount?: number
  startTime?: number // Unix timestamp in ms
  endTime?: number // Unix timestamp in ms
  practiceDuration?: number // Duration of session in seconds
  correctedCharCount?: number // Times user fixed an error (e.g., backspace presses)
  deletedCharCount?: number // Total characters deleted
  correctCharsTyped?: number // Characters typed correctly as per the target text
  totalCharsTyped?: number // All characters typed by the user, including errors and corrections
  errorCharCount?: number // Incorrect characters typed
  unigraphStats?: Record<string, UnigraphStatistic> // e.g., { "a": { count: 12, accuracy: 91 } }
  digraphStats?: Record<string, DigraphStatistic> // e.g., { "th": { count: 5, accuracy: 80 } }
}

export type Action =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'TICK' }
  | { type: 'UPDATE_STATS'; payload: UpdateStatsPayload }
  | { type: 'SET_STOPWATCH_TIME'; payload: number }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'RESET_SESSION' }
  | { type: 'RESET_ALL' }

export type BaseTypingStats = {
  wpm: number
  accuracy: number

  correctedCharCount: number // Times user fixed an error (e.g., backspace presses)
  correctCharsTyped: number // Typed characters that matched target text
  deletedCharCount: number // Total characters deleted
  totalCharsTyped: number // All typed characters including errors
  errorCharCount: number // Incorrect characters typed

  // - For digraphs: digraph string (e.g., "th") → array of intervals in ms between keys
  aveDigraphTimings: DigraphTiming[]

  // Frequency + accuracy stats per key/digraph
  unigraphStats: UnigraphStatistic[]
  digraphStats: DigraphStatistic[]
}

export type DigraphStatistic = {
  key: string
  count: number
  accuracy: number // float (0–1)
  meanInterval: number
}

export type UnigraphStatistic = {
  key: string
  count: number
  accuracy: number // float (0–1)
}

export type TypingSessionStats = {
  startTime: number
  endTime: number
  practiceDuration: number
  wpm: number
  accuracy: number

  correctedCharCount: number
  deletedCharCount: number
  correctCharsTyped: number
  totalCharsTyped: number
  errorCharCount: number

  digraphs: DigraphStatistic[]
  unigraphs: UnigraphStatistic[]
}
export interface TypingStatsSummary extends BaseTypingStats {
  sessionCount: number

  averageWpm: number
  averageAccuracy: number
}

export type DigraphTiming = { key: string; intervals: number[] }

// User types
export type User = {
  email: string
  user_name: string
}

export type UserLogin = {
  email: string
  password: string
}

export type UserContextType = {
  user: User | null
  login: (userLogin: UserLogin) => Promise<void>
  logout: () => void
  token: string | null
  authError: string | null
}

export type GraphQLResponse<T> = {
  data: T
  errors?: { message: string }[]
}

export type UpdateUserResponse = {
  updateUser: {
    id: string
    user_name: string
    name: string
    email: string
  }
}

export type DeleteUserResponse = {
  deleteUser: boolean
}

export type KeyEvent = {
  timestamp: number
  key: string
  typedStatus: TypedStatus
  cursorIndex: number
}

export type DigraphTimingAverage = {
  key: string
  meanInterval: number
}

export enum TypingAction {
  BackspaceSingle = 'backspace-single',
  ClearMissRange = 'clear-miss-range',
  AddKey = 'add-key', // default action for normal keys
}

export interface OnTypeParams {
  key: string
  typedStatus: TypedStatus
  cursorIndex: number
  timestamp: number
  action: TypingAction
  deleteCount?: number // optional, only for ClearMissRange
}

// Define enum
export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

// Use the enum in the types
export type AlertData = {
  id: string
  type: AlertType
  title?: string
  message?: string
}

export type AlertContextType = {
  alerts: AlertData[]
  showAlert: (alert: Omit<AlertData, 'id'>) => void
  removeAlert: (id: string) => void
}
