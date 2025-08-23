export enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  FIXED = 'fixed',
  UNFIXED = 'unfixed',
  PENDING = 'pending',
  NONE = 'none',
}

export enum SpecialEvent {
  BACKSPACE = 'backspace',
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
  UNDERSCORE,
  BLOCK,
  OUTLINE,
  PIPE,
}

export enum StopWatchState {
  RUNNING,
  STOPPED,
}

export type State = {
  wpm: number
  netWpm: number
  accuracy: number
  rawAccuracy: number
  stopWatchTime: number
  isRunning: boolean
  text: string
}

type UpdateStatsPayload = {
  startTime?: number // Unix timestamp in ms
  endTime?: number // Unix timestamp in ms
  practiceDuration?: number // Duration of session in seconds

  wpm?: number
  netWpm?: number
  accuracy?: number
  rawAccuracy?: number

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
  | { type: 'UPDATE_STATS'; payload: UpdateStatsPayload }
  | { type: 'SET_STOPWATCH_TIME'; payload: number }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'RESET_SESSION' }
  | { type: 'RESET_ALL' }

export type UnigraphStatistic = {
  id?: string
  key: string
  count: number
  accuracy: number // float (0–1)
  // rawAccuracy: number // float (0–1)
  mistyped: { key: string; count: number }[]
}

export type DigraphStatistic = {
  id?: string
  key: string
  count: number
  accuracy: number // float (0–1)
  meanInterval: number
}

export type TypingSessionStats = {
  startTime: number
  endTime: number
  practiceDuration: number

  wpm: number
  netWpm: number

  accuracy: number
  rawAccuracy: number

  correctedCharCount: number
  deletedCharCount: number
  correctCharsTyped: number
  totalCharsTyped: number
  errorCharCount: number

  digraphs?: DigraphStatistic[]
  unigraphs?: UnigraphStatistic[]
}

export interface StatsSummary {
  id: string // UUID as string
  userId: string // UUID as string

  sessionCount: number // maps to totalSessions
  totalPracticeDuration: number

  averageWpm: number
  fastestWpm: number

  averageNetWpm: number
  fastestNetWpm: number

  averageAccuracy: number
  averageRawAccuracy: number

  practiceStreak: number
  longestStreak: number

  totalSessions: number
  totalCorrectedCharCount: number
  totalDeletedCharCount: number
  totalKeystrokes: number
  totalCharCount: number
  errorCharCount: number

  // Relationships would likely be nested types or IDs
  unigraphs: UnigraphStatistic[]
  digraphs: DigraphStatistic[]
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
  token: string | null
  authError: string | null
  login: (userLogin: UserLogin) => Promise<void>
  logout: () => void
  statsSummary: () => Promise<StatsSummary | undefined>
  sessionsByDateRange: (startDate: Date, endDate: Date) => Promise<TypingSessionStats[] | undefined>
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
  key: string
  expectedChar?: string
  cursorIndex: number
  timestamp: number
  typedStatus?: TypedStatus
  deleteCount?: number
}

export enum TypingAction {
  BackspaceSingle = 'backspace-single',
  ClearMissRange = 'clear-miss-range',
  AddKey = 'add-key', // default action for normal keys
}

export interface OnTypeParams {
  key: string
  typedStatus?: TypedStatus
  cursorIndex: number
  timestamp: number
  action: TypingAction
  deleteCount?: number // optional, only for ClearMissRange
}

// Define enum
export enum AlertType {
  SUCCESS,
  ERROR,
  INFO,
  WARNING,
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

export enum ActiveTab {
  Summary = 'summary',
  Trends = 'trends',
}

export interface MetricConfig {
  label: string
  tooltip: string
  current: number
  baseline: number
  format: (v: number) => string | number
}
