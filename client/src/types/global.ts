export enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  NONE = 'none',
}

export enum SpaceSymbols {
  UNDERSCORE = 'underscore',
  DOT = 'DOT',
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

export type Action =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'TICK' }
  | { type: 'SET_WPM'; payload: number }
  | { type: 'SET_ACCURACY'; payload: number }
  | { type: 'SET_STOPWATCH_TIME'; payload: number }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'RESET_SESSION' }
  | { type: 'RESET_ALL' }

export type TypingStats = {
  wpm: number
  accuracy: number
  startTime: number
}

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
