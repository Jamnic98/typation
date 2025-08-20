import {
  type CSSProperties,
  type FC,
  type JSX,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/**
 * UKKeyboardSvg
 *
 * A scalable SVG keyboard for a standard UK (ISO) layout.
 * - Highlights a key passed via props (e.g. next expected character)
 * - Optionally listens to real keyboard events and flashes the pressed key
 * - Can hide/show the number row
 *
 * Usage:
 * <UKKeyboardSvg highlightKey={targetChar} showNumberRow className="w-full h-auto" />
 * <UKKeyboardSvg listenToKeyboard /> // flashes keys on real keydown/keyup
 */

type Letter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type NumSymbol = '-' | '='

type SpecialId =
  | 'Backspace'
  | 'Enter'
  | 'Space'
  | 'Shift'
  | 'ShiftLeft'
  | 'ShiftRight'
  | 'Control'
  | 'ControlLeft'
  | 'ControlRight'
  | 'Alt'
  | 'AltLeft'
  | 'AltRight'
  | 'Meta'
  | 'MetaLeft'
  | 'MetaRight'
  | 'Tab'
  | 'CapsLock'

type ExtraSymbols = ';' | "'" | '#' | '[' | ']' | ',' | '.' | '/' | '\\' | '`'

export type KeyId = Letter | Digit | NumSymbol | ExtraSymbols | SpecialId

export interface KeyboardTheme {
  background?: string
  keyFill?: string
  keyBorder?: string
  label?: string
  highlightFill?: string // for `highlightKey`
  pressedFill?: string // for transient keydown highlight
}

export interface UKKeyboardSvgProps {
  /** Character or key id to highlight (case-insensitive for single letters). */
  highlightKey?: string | null
  /** If true, attach window keydown/keyup listeners and flash pressed key. */
  listenToKeyboard?: boolean
  /** Show the number row (1..0 - =) */
  showNumberRow?: boolean
  /** Optional className to size the SVG (use CSS width/height). */
  className?: string
  /** Optional inline style for the outer container */
  style?: React.CSSProperties
  /** Theme colours */
  theme?: KeyboardTheme
  /** Use vector icons for special keys (Enter, Backspace, Shift, Win). */
  useIconLabels?: boolean
}

// Geometry
const UNIT_W = 52 // base key width
const UNIT_H = 52 // base key height
const GAP = 8 // gap between keys
// const RADIUS = 10 // key corner radius

// Default theme (neutral, easy to override)
const DEFAULT_THEME: Required<KeyboardTheme> = {
  background: 'transparent',
  keyFill: '#f8fafc', // slate-50
  keyBorder: '#cbd5e1', // slate-300
  label: '#0f172a', // slate-900
  highlightFill: '#fde68a', // amber-200
  pressedFill: '#86efac', // green-300
}

// Define the logical layout rows. Width is in UNIT_W multiples. Optional xOffset in units.
// This is a pragmatic UK ISO-like layout covering requested keys.

type KeyDef = { id: KeyId; label: string; width?: number; shape?: string }

type RowDef = { keys: KeyDef[]; xOffsetUnits?: number }

const rowNumbers: RowDef = {
  xOffsetUnits: 0.0,
  keys: [
    { id: '`', label: '`' },
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6' },
    { id: '7', label: '7' },
    { id: '8', label: '8' },
    { id: '9', label: '9' },
    { id: '0', label: '0' },
    { id: '-', label: '-' },
    { id: '=', label: '=' },
    { id: 'Backspace', label: 'Backspace', width: 1.95 },
  ],
}

const rowQWERTY: RowDef = {
  xOffsetUnits: 0, // small indent
  keys: [
    { id: 'Tab', label: 'Tab', width: 1.5 }, // wider than normal
    { id: 'Q', label: 'Q' },
    { id: 'W', label: 'W' },
    { id: 'E', label: 'E' },
    { id: 'R', label: 'R' },
    { id: 'T', label: 'T' },
    { id: 'Y', label: 'Y' },
    { id: 'U', label: 'U' },
    { id: 'I', label: 'I' },
    { id: 'O', label: 'O' },
    { id: 'P', label: 'P' },
    { id: '[', label: '[' },
    { id: ']', label: ']' },
    { id: 'Enter', label: 'Enter', width: 1.45 },
    // UK has an extra key here usually ([ ] on US). Kept simple per request.
  ],
}

const rowASDF: RowDef = {
  xOffsetUnits: 0,
  keys: [
    { id: 'CapsLock', label: 'Caps', width: 1.75 }, // wider
    { id: 'A', label: 'A' },
    { id: 'S', label: 'S' },
    { id: 'D', label: 'D' },
    { id: 'F', label: 'F' },
    { id: 'G', label: 'G' },
    { id: 'H', label: 'H' },
    { id: 'J', label: 'J' },
    { id: 'K', label: 'K' },
    { id: 'L', label: 'L' },
    { id: ';', label: ';' },
    { id: "'", label: "'" },
    { id: '#', label: '#' },
    { id: 'Enter', label: 'Enter', width: 1.2 },
  ],
}

const rowZXCV: RowDef = {
  xOffsetUnits: 0.0,
  keys: [
    { id: 'ShiftLeft', label: 'Shift', width: 1.5 },
    { id: '\\', label: '\\' },
    { id: 'Z', label: 'Z' },
    { id: 'X', label: 'X' },
    { id: 'C', label: 'C' },
    { id: 'V', label: 'V' },
    { id: 'B', label: 'B' },
    { id: 'N', label: 'N' },
    { id: 'M', label: 'M' },
    { id: ',', label: ',' },
    { id: '.', label: '.' },
    { id: '/', label: '/' },
    { id: 'ShiftRight', label: 'Shift', width: 2.5 },
  ],
}
const rowBottom: RowDef = {
  xOffsetUnits: 0.0,
  keys: [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.5 },
    { id: 'MetaLeft', label: 'Win', width: 1.5 },
    { id: 'AltLeft', label: 'Alt', width: 1.5 },
    { id: 'Space', label: 'Space', width: 6 },
    { id: 'AltRight', label: 'AltGr', width: 1.5 },
    { id: 'MetaRight', label: 'Win', width: 1.5 },
    { id: 'ControlRight', label: 'Ctrl', width: 1.5 },
  ],
}

// Utility: map from an arbitrary character / event.key to our KeyId
function mapInputToKeyId(input?: string | null): KeyId | null {
  if (!input) return null
  const k = input.length === 1 ? input : input.toString()
  if (k === ' ') return 'Space'
  if (k === '\n' || k === 'Enter') return 'Enter'
  if (k === '\b' || k === 'Backspace') return 'Backspace'
  // Standardise letters to uppercase ids
  if (/^[a-z]$/i.test(k)) return k.toUpperCase() as KeyId
  // Digits and common symbols on number row
  if (/^[0-9]$/.test(k)) return k as KeyId
  if (['-', '=', ';', "'", '#', '[', ']', ',', '.'].includes(k)) return k as KeyId
  // Modifier names that may arrive from KeyboardEvent.key
  const known = new Set([
    'Shift',
    'ShiftLeft',
    'ShiftRight',
    'Control',
    'ControlLeft',
    'ControlRight',
    'Alt',
    'AltLeft',
    'AltRight',
    'MetaLeft',
    'MetaRight',
  ])
  if (known.has(k)) {
    // Prefer the generic side-agnostic id if that's what we received
    return k as KeyId
  }
  return null
}

// Convert layout definition to positioned rectangles for the SVG
function computeLayoutRows(rows: RowDef[]) {
  let maxWidthUnits = 0
  const prepared = rows.map((row) => {
    const { keys, xOffsetUnits = 0 } = row
    let x = xOffsetUnits * UNIT_W + (xOffsetUnits > 0 ? GAP * xOffsetUnits : 0)
    const positioned = keys.map((k) => {
      const wUnits = k.width ?? 1
      const width = wUnits * UNIT_W + (wUnits - 1) * GAP
      const out = { x, y: 0, width, key: k }
      x += width + GAP // advance x for next key
      return out
    })
    const rowWidth = positioned.length
      ? positioned[positioned.length - 1].x + positioned[positioned.length - 1].width
      : 0
    maxWidthUnits = Math.max(maxWidthUnits, rowWidth)
    return { positioned, rowWidth }
  })

  return { prepared, totalWidth: maxWidthUnits }
}

const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

const KEY_FONT_FAMILY =
  'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif'

// --- Simple vector icons for special keys ---
const ICON_STROKE_W = 2

function IconWindows() {
  return (
    <g>
      {/* four squares */}
      <rect x={-8.5} y={-8.5} width={7} height={7} rx={1.2} ry={1.2} />
      <rect x={1.5} y={-8.5} width={7} height={7} rx={1.2} ry={1.2} />
      <rect x={-8.5} y={1.5} width={7} height={7} rx={1.2} ry={1.2} />
      <rect x={1.5} y={1.5} width={7} height={7} rx={1.2} ry={1.2} />
    </g>
  )
}

function IconEnter() {
  return (
    <g>
      {/* bent arrow (return) */}
      <path
        d="M-8,-4 H6 V4 H0"
        fill="none"
        strokeWidth={ICON_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0,4 l-4,-3 m4,3 l-4,3"
        fill="none"
        strokeWidth={ICON_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

function IconBackspace() {
  return (
    <g>
      {/* left chevron body */}
      <path
        d="M-9,0 l4,-6 h14 v12 h-14 z"
        fill="none"
        strokeWidth={ICON_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* X */}
      <path
        d="M-1,-3 l6,6 M5,-3 l-6,6"
        fill="none"
        strokeWidth={ICON_STROKE_W}
        strokeLinecap="round"
      />
    </g>
  )
}

function IconShift() {
  return (
    <g>
      {/* up arrow */}
      <path
        d="M0,-8 l7,8 h-4 v6 h-6 v-6 h-4 z"
        fill="none"
        strokeWidth={ICON_STROKE_W}
        strokeLinejoin="round"
      />
    </g>
  )
}

function renderIcon(id: KeyId): JSX.Element | null {
  const generic = id.startsWith('Shift') ? 'Shift' : id.startsWith('Meta') ? 'Meta' : id
  switch (generic) {
    case 'Backspace':
      return <IconBackspace />
    case 'Enter':
      return <IconEnter />
    case 'Shift':
      return <IconShift />
    case 'Meta':
      return <IconWindows />
    default:
      return null
  }
}

function renderIsoEnter(
  x: number,
  y: number,
  theme: Required<KeyboardTheme>,
  isPressed: boolean,
  isHighlight: boolean
) {
  const fill = isPressed ? theme.pressedFill : isHighlight ? theme.highlightFill : theme.keyFill
  const stroke = theme.keyBorder

  const topW = UNIT_W * 1.75 // wide top part
  const legW = UNIT_W // bottom leg width
  const h = UNIT_H

  // Path: starts top-left of QWERTY row, spans down into ASDF row
  const d = `
    M ${x} ${y}             /* top-left */
    h ${topW}               /* top edge */
    v ${h}                  /* drop 1 row */
    h -${topW - legW}       /* back left to make notch */
    v ${h}                  /* down into ASDF row */
    h -${legW}              /* bottom edge left */
    Z
  `

  return <path d={d} fill={fill} stroke={stroke} strokeWidth={2} />
}

const UKKeyboardSvg: FC<UKKeyboardSvgProps> = ({
  highlightKey,
  listenToKeyboard = false,
  showNumberRow = true,
  className,
  style,
  theme: themeOverride,
  useIconLabels = true,
}) => {
  const theme = { ...DEFAULT_THEME, ...(themeOverride ?? {}) }

  const rows = useMemo(() => {
    const r: RowDef[] = []
    if (showNumberRow) r.push(rowNumbers)
    r.push(rowQWERTY, rowASDF, rowZXCV, rowBottom)
    return r
  }, [showNumberRow])

  const layout = useMemo(() => computeLayoutRows(rows), [rows])

  // Compute cumulative row Y positions
  const rowHeights = rows.map(() => UNIT_H)
  const rowYs = rowHeights.map((_, i) => i * (UNIT_H + GAP))
  const totalHeight = rowYs[rowYs.length - 1] + UNIT_H // last row bottom

  const [pressedKeyId, setPressedKeyId] = useState<KeyId | null>(null)
  const pressTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!listenToKeyboard) return

    const onDown = (e: KeyboardEvent) => {
      const id = mapInputToKeyId(e.key)
      if (!id) return
      setPressedKeyId(id)
      if (pressTimer.current) window.clearTimeout(pressTimer.current)
      // Flash highlight for 120ms
      pressTimer.current = window.setTimeout(() => setPressedKeyId(null), 120)
    }
    const onUp = (_e: KeyboardEvent) => {
      // Could clear faster on keyup if desired
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [listenToKeyboard])

  const highlightId = mapInputToKeyId(highlightKey)

  return (
    <div className={className} style={{ position: 'relative', ...(style ?? {}) }}>
      {/* Visually hidden description for screen readers */}
      <div style={SR_ONLY} aria-hidden={false}>
        UK keyboard layout — SVG visualisation. Use props to highlight next key.
      </div>
      <svg
        role="img"
        aria-label="UK keyboard layout"
        viewBox={`0 0 ${layout.totalWidth} ${totalHeight}`}
        width={layout.totalWidth}
        height={totalHeight}
        style={{ display: 'block', background: theme.background, width: '100%', height: 'auto' }}
      >
        {rows.map((_, rowIdx) => {
          const { positioned } = layout.prepared[rowIdx]
          const y = rowYs[rowIdx]
          return (
            <g key={`row-${rowIdx}`} transform={`translate(0, ${y})`}>
              {positioned.map(({ x, width, key }, i) => {
                const id = key.id
                const isPrimaryHighlight =
                  highlightId &&
                  (id === highlightId ||
                    (highlightId === 'Shift' && (id === 'ShiftLeft' || id === 'ShiftRight')) ||
                    (highlightId === 'Control' &&
                      (id === 'ControlLeft' || id === 'ControlRight')) ||
                    (highlightId === 'Alt' && (id === 'AltLeft' || id === 'AltRight')) ||
                    (highlightId === 'Meta' && (id === 'MetaLeft' || id === 'MetaRight')))
                const isPressed =
                  pressedKeyId &&
                  (id === pressedKeyId ||
                    (pressedKeyId === 'Shift' && (id === 'ShiftLeft' || id === 'ShiftRight')) ||
                    (pressedKeyId === 'Control' &&
                      (id === 'ControlLeft' || id === 'ControlRight')) ||
                    (pressedKeyId === 'Alt' && (id === 'AltLeft' || id === 'AltRight')) ||
                    (pressedKeyId === 'Meta' && (id === 'MetaLeft' || id === 'MetaRight')))

                const fill = isPressed
                  ? theme.pressedFill
                  : isPrimaryHighlight
                    ? theme.highlightFill
                    : theme.keyFill

                return (
                  <g key={`k-${rowIdx}-${i}`}>
                    {key.shape === 'iso-enter' ? (
                      renderIsoEnter(x, 0, theme, !!isPressed, !!isPrimaryHighlight)
                    ) : (
                      <rect
                        x={x}
                        y={0}
                        width={width}
                        height={UNIT_H}
                        fill={fill}
                        stroke={theme.keyBorder}
                        strokeWidth={2}
                      />
                    )}

                    {(() => {
                      const cx = x + width / 2
                      const cy = UNIT_H / 2
                      const icon = useIconLabels ? renderIcon(id) : null
                      if (icon) {
                        return (
                          <g transform={`translate(${cx}, ${cy})`} stroke={theme.label} fill="none">
                            {icon}
                          </g>
                        )
                      }
                      return (
                        <text
                          x={cx}
                          y={cy + 6}
                          textAnchor="middle"
                          fontFamily={KEY_FONT_FAMILY}
                          fontSize={16}
                          fill={theme.label}
                          pointerEvents="none"
                        >
                          {key.label}
                        </text>
                      )
                    })()}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default memo(UKKeyboardSvg)
