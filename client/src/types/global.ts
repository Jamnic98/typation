export enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  NONE = 'none',
}

export enum SpaceSymbols {
  UNDERSCORE = 'underscore',
  MIDDLE_DOT = 'middle_dot',
}

export const spaceSymbolMap: Record<SpaceSymbols, string> = {
  [SpaceSymbols.UNDERSCORE]: '_',
  [SpaceSymbols.MIDDLE_DOT]: '·',
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
  '2XL' = '2xl',
  '3XL' = '3xl',
  '4XL' = '4xl',
}

export enum CursorStyles {
  UNDERSCORE = 'underscore',
  BLOCK = 'block',
}
