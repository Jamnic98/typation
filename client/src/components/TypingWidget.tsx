import { useCallback, useEffect, useState } from 'react'

import {
  CharacterProps,
  ComponentSettings,
  PreviewCharacter,
  ProgressBar,
  TypingWidgetText,
  UKKeyboardSvg,
} from 'components'
import { getGlobalIndex, resetTypedStatus } from 'utils/helpers'
import {
  OnTypeParams,
  spaceSymbolMap,
  SpaceSymbols,
  SpecialEvent,
  TypedStatus,
  TypingAction,
} from 'types/global'
import { CONTAINER_HEIGHT, LINE_LENGTH, TYPABLE_CHARS_ARRAY } from 'utils'

interface TypingWidgetProps {
  onType: (onTypeParams: OnTypeParams) => void
  handleBlurReset: () => void
  loadingText: boolean
  inputRef: any
  textToType: string
  elapsed: number
  widgetSettings: ComponentSettings
  isRunning: boolean
  disabled: boolean
  useAlwaysFocus: (inputRef: any) => void
}

export const TypingWidget = ({
  onType,
  inputRef,
  loadingText,
  textToType,
  elapsed,
  widgetSettings,
  isRunning,
  disabled,
  useAlwaysFocus,
}: TypingWidgetProps) => {
  const [lines, setLines] = useState<CharacterProps[][]>([])
  const [lineIndex, setLineIndex] = useState(0)
  const [colIndex, setColIndex] = useState(0)

  const timeLeft = Math.max(Number(widgetSettings.testDuration) - Math.floor(elapsed / 1000), 0)
  const progress = Math.min(elapsed / (Number(widgetSettings.testDuration) * 1000), 1) // 0 → 1

  const handleCharInput = async (key: string) => {
    const line = lines[lineIndex]
    const obj = line[colIndex]

    if (!obj) return

    const typedStatusRaw = obj.char === key ? TypedStatus.HIT : TypedStatus.MISS
    const updated = updateCharStatusAtCursor(typedStatusRaw, key)
    setLines(updated)

    const globalIndex = getGlobalIndex(lineIndex, colIndex, lines)

    onType({
      key,
      typedStatus: updated[lineIndex][colIndex].typedStatus,
      cursorIndex: globalIndex,
      timestamp: Date.now(),
      action: TypingAction.AddKey,
    })

    // End of whole text?
    if (lineIndex === lines.length - 1 && colIndex === line.length - 1) {
      setColIndex(-1)
      return
    }

    // End of line → move to next line
    if (colIndex === line.length - 1) {
      setLineIndex((idx) => idx + 1)
      setColIndex(0)
    } else {
      setColIndex((c) => c + 1)
    }
  }

  const resetTyping = useCallback(() => {
    if (typeof textToType === 'string') {
      const arr = resetTypedStatus(textToType)

      let currentLength = 0
      let currentLine: CharacterProps[] = []
      const chunks: CharacterProps[][] = []

      const words: CharacterProps[][] = []
      let currentWord: CharacterProps[] = []

      // Split characters into words (preserve spaces as their own "word")
      for (let i = 0; i < arr.length; i++) {
        const char = arr[i]
        if (char.char === ' ') {
          if (currentWord.length > 0) {
            words.push(currentWord)
            currentWord = []
          }
          // keep space as a separate token
          words.push([char])
        } else {
          currentWord.push(char)
        }
      }
      if (currentWord.length > 0) {
        words.push(currentWord)
      }

      // Build lines from words
      for (const word of words) {
        // If the word is just a space, try to attach it to the current line
        if (word.length === 1 && word[0].char === ' ') {
          if (currentLength + 1 > LINE_LENGTH) {
            // If the space would overflow, still add it to this line,
            // then break the line immediately.
            currentLine.push(word[0])
            chunks.push(currentLine)
            currentLine = []
            currentLength = 0
          } else {
            currentLine.push(word[0])
            currentLength += 1
          }
          continue
        }

        // For normal words
        if (currentLength + word.length > LINE_LENGTH && currentLine.length > 0) {
          // push current line and start new one
          chunks.push(currentLine)
          currentLine = []
          currentLength = 0
        }
        currentLine = currentLine.concat(word)
        currentLength += word.length
      }

      if (currentLine.length > 0) {
        chunks.push(currentLine)
      }

      setLines(chunks)
      setLineIndex(0)
      setColIndex(0)
    }
  }, [textToType])

  const updateCharStatusAtCursor = (typedStatus: TypedStatus, key?: string): CharacterProps[][] => {
    const updated = [...lines]
    const line = [...updated[lineIndex]]
    const obj = line[colIndex]

    let newStatus = typedStatus
    if (obj.typedStatus === TypedStatus.PENDING) {
      if (typedStatus === TypedStatus.HIT) newStatus = TypedStatus.FIXED
      else if (typedStatus === TypedStatus.MISS) newStatus = TypedStatus.UNFIXED
    }

    line[colIndex] = {
      ...obj,
      typedStatus: newStatus,
      ...(newStatus === TypedStatus.MISS || newStatus === TypedStatus.UNFIXED
        ? key && obj.char !== ' '
          ? { typedChar: key }
          : {}
        : {}),
    }
    updated[lineIndex] = line
    return updated
  }

  const handleBackspace = (ctrl = false) => {
    // nothing to delete
    if (lineIndex === 0 && colIndex === 0) return

    let newLineIndex = lineIndex
    let newColIndex = colIndex

    // Step cursor back 1
    if (colIndex === 0) {
      newLineIndex -= 1
      newColIndex = lines[newLineIndex].length - 1
    } else {
      newColIndex -= 1
    }

    const targetChar = lines[newLineIndex][newColIndex]
    if (!targetChar) return

    // --- CTRL+Backspace: bulk delete ---
    if (ctrl) {
      let li = newLineIndex
      let ci = newColIndex

      // Step 1: walk backwards through consecutive MISS
      while (li >= 0) {
        const char = lines[li][ci]

        if (!char || char.typedStatus !== TypedStatus.MISS) {
          // stop at the first non-MISS
          break
        }

        if (ci === 0) {
          if (li === 0) {
            // reached very beginning (0,0) and it's a MISS
            ci = -1
            break
          }
          li--
          ci = lines[li].length - 1
        } else {
          ci--
        }
      }

      // Step 2: compute start index = one after the stopping point
      let startLine = li
      let startCol = ci + 1
      if (startCol >= (lines[startLine]?.length ?? 0)) {
        startLine++
        startCol = 0
      }

      const globalStart = getGlobalIndex(startLine, startCol, lines)
      const globalEnd = getGlobalIndex(newLineIndex, newColIndex, lines)

      if (globalEnd < globalStart) return

      const updated = lines.map((line, li) =>
        line.map((char, ci) => {
          const gIdx = getGlobalIndex(li, ci, lines)
          if (gIdx >= globalStart && gIdx <= globalEnd && char.typedStatus === TypedStatus.MISS) {
            return { ...char, typedStatus: TypedStatus.PENDING, typedChar: undefined }
          }
          return char
        })
      )

      setLines(updated)
      setLineIndex(startLine)
      setColIndex(startCol)

      onType({
        key: SpecialEvent.BACKSPACE,
        cursorIndex: globalEnd,
        timestamp: Date.now(),
        action: TypingAction.ClearMissRange,
        deleteCount: globalEnd - globalStart + 1,
      })

      return
    }

    // --- Single Backspace ---
    if (targetChar.typedStatus === TypedStatus.MISS) {
      const updated = [...lines]
      const lineCopy = [...updated[newLineIndex]]

      lineCopy[newColIndex] = {
        ...lineCopy[newColIndex],
        typedStatus: TypedStatus.PENDING,
        typedChar: undefined,
      }

      updated[newLineIndex] = lineCopy
      setLines(updated)

      setLineIndex(newLineIndex)
      setColIndex(newColIndex)

      const globalIndex = getGlobalIndex(newLineIndex, newColIndex, lines)

      onType({
        key: SpecialEvent.BACKSPACE,
        cursorIndex: globalIndex,
        timestamp: Date.now(),
        action: TypingAction.BackspaceSingle,
        deleteCount: 1,
      })
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return

    inputRef.current?.focus()

    const { key, ctrlKey } = e
    if (!ctrlKey) e.preventDefault()
    if (ctrlKey && key === 'r') return

    if (!isRunning && key === ' ') {
      return
    }

    if (key === 'Backspace') {
      handleBackspace(ctrlKey)
      return
    }

    if (key.length === 1 && TYPABLE_CHARS_ARRAY.includes(key)) {
      await handleCharInput(key)
    }
  }

  useEffect(() => {
    resetTyping()
  }, [textToType, resetTyping])

  return (
    <div id="typing-widget" data-testid="typing-widget" className="w-full h-full mt-6">
      <div className="flex flex-col items-center select-none">
        {/* Big preview char */}
        <div className="min-h-28">
          {widgetSettings.showCurrentLetter && (
            <PreviewCharacter
              char={lines[lineIndex]?.[colIndex]?.char ?? null}
              spaceSymbol={spaceSymbolMap[SpaceSymbols.DOT]}
            />
          )}
        </div>

        <div className="relative overflow-hidden mb-2" style={{ height: `${CONTAINER_HEIGHT}rem` }}>
          <TypingWidgetText
            inputRef={inputRef}
            textToType={textToType ?? ''}
            widgetSettings={widgetSettings}
            // onFocusChange={handleFocus}
            // handleBlur={handleBlur}
            lines={lines}
            lineIndex={lineIndex}
            colIndex={colIndex}
            handleKeyDown={handleKeyDown}
            loadingText={loadingText}
            useAlwaysFocus={useAlwaysFocus}
          />
        </div>

        {/* Keyboard */}
        {widgetSettings.showBigKeyboard ? (
          <UKKeyboardSvg
            highlightKey={lines[lineIndex]?.[colIndex]?.char}
            showNumberRow
            className="w-full h-auto"
          />
        ) : null}
      </div>

      {isRunning && widgetSettings.showProgressBar && (
        <div className="flex items-center gap-4 mt-3 w-full">
          {/* Time label */}
          <div className="text-lg text-left">{timeLeft}s</div>

          {/* Progress bar container */}
          <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
    </div>
  )
}
