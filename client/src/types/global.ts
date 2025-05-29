export enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  // STRIKE = 'strike',
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
