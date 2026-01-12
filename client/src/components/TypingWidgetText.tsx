import { Character, type CharacterProps, ComponentSettings } from 'components'
import {
  defaultWidgetSettings,
  GAP,
  INITIAL_OFFSET,
  LINE_SPACING,
  ROW_HEIGHT,
} from 'utils/constants'
import { SpaceSymbols, spaceSymbolMap, CursorStyles } from 'types'

interface TypingWidgetSkeletonProps {
  rows?: number
  rowHeightRem?: number
  gapRem?: number
}

export const TypingWidgetSkeleton: React.FC<TypingWidgetSkeletonProps> = ({
  rows = 4,
  rowHeightRem = 2,
  gapRem = 0.5,
}) => {
  const charsPerRow = 40 // approximate number of characters per line

  return (
    <div className="font-mono outline-none px-4 select-none" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIdx) => {
        let opacity = 0.15
        if (rowIdx === 1) opacity = 1
        if (rowIdx === 0 || rowIdx === 2) opacity = 0.3
        if (rowIdx === 3) opacity = 0.1

        return (
          <div
            key={rowIdx}
            className="flex justify-center mb-2 overflow-hidden"
            style={{
              height: `${rowHeightRem}rem`,
              marginBottom: `${gapRem}rem`,
              opacity,
            }}
          >
            {Array.from({ length: charsPerRow }).map((_, ci) => (
              <div
                key={ci}
                className="rounded-sm bg-neutral-700/30 mr-1 last:mr-0"
                style={{
                  width: `${rowHeightRem / 2}rem`,
                  height: '100%',
                  display: 'inline-block',
                  animation: 'skeleton-shimmer 1.5s infinite linear',
                  background:
                    'linear-gradient(to right, rgba(100,100,100,0.1) 0%, rgba(150,150,150,0.2) 50%, rgba(100,100,100,0.1) 100%)',
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export interface TypingWidgetTextProps {
  inputRef: any
  lines: CharacterProps[][]
  lineIndex: number
  colIndex: number
  textToType: string | null
  loadingText: boolean
  widgetSettings?: ComponentSettings
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void
  useAlwaysFocus: (inputRef: any) => void
}

export const TypingWidgetText = ({
  handleKeyDown,
  inputRef,
  lines,
  lineIndex,
  colIndex,
  loadingText,
  textToType,
  widgetSettings = defaultWidgetSettings,
  useAlwaysFocus,
}: TypingWidgetTextProps) => {
  if (!textToType || !lines?.length) return null

  useAlwaysFocus(inputRef)

  const handleOnBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as HTMLElement | null
    if (next && next.tabIndex >= 0) return

    // refocus immediately
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div>
      {loadingText ? (
        <TypingWidgetSkeleton />
      ) : (
        <div
          id="typing-widget-text"
          data-testid="typing-widget-text"
          role="textbox"
          aria-label="Typing area"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onBlur={handleOnBlur}
          className={`font-mono outline-none px-4`}
          ref={inputRef}
        >
          <div
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateY(-${lineIndex * LINE_SPACING}rem)`,
            }}
          >
            {/* add empty "padding" lines at the top */}
            {Array.from({ length: INITIAL_OFFSET }).map((_, idx) => (
              <div
                key={`pad-${idx}`}
                style={{
                  height: `${ROW_HEIGHT}rem`,
                  marginBottom: `${GAP}rem`,
                  opacity: 0,
                }}
              />
            ))}

            {/* Actual typing lines */}
            {lines.map((line, idx) => {
              const relative = idx - lineIndex

              let opacity = 0
              if (relative === -1) {
                opacity = lineIndex > 0 ? 0.15 : 0
              } else if (relative === 0) {
                opacity = 1
              } else if (relative === 1) {
                opacity = 0.15
              } else if (relative === 2) {
                opacity = 0.05
              }

              return (
                <div
                  key={idx}
                  className="flex justify-center transition-opacity duration-300"
                  style={{
                    height: `${ROW_HEIGHT}rem`,
                    marginBottom: `${GAP}rem`,
                    opacity,
                  }}
                >
                  {lineIndex > 0 || relative >= 0
                    ? line.map((charObj: CharacterProps, ci) => (
                        <Character
                          {...charObj}
                          characterAnimationEnabled={widgetSettings.characterAnimationEnabled}
                          spaceSymbol={
                            spaceSymbolMap[widgetSettings?.spaceSymbol || SpaceSymbols.DOT]
                          }
                          cursorStyle={widgetSettings.cursorStyle || CursorStyles.UNDERSCORE}
                          // TODO: REMOVE HARDCODED TRUE
                          isActive={idx === lineIndex && ci === colIndex && true}
                          key={`${idx}-${ci}`}
                          // key={`${idx}-${ci}-${sessionId}`}
                        />
                      ))
                    : null}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
