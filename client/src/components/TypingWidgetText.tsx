import { useCallback, useEffect, useState } from 'react'

import { type CharacterProps, Character } from 'components'
import { getGlobalIndex, resetTypedStatus } from 'utils/helpers'
import { defaultFontSettings, TYPABLE_CHARS_ARRAY } from 'utils/constants'
import {
  type OnTypeParams,
  type FontSettings,
  TypedStatus,
  TypingAction,
  SpaceSymbols,
  spaceSymbolMap,
  SpecialEvent,
} from 'types'
import UKKeyboardSvg from './UKKeyboardSvg'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: () => Promise<void>
  onType: (params: OnTypeParams) => void
  reset: () => void
}

const LINE_LENGTH = 80 // adjust to fit your layout

export const TypingWidgetText = ({
  textToType,
  fontSettings = defaultFontSettings,
  onStart,
  onComplete,
  onType,
  reset,
}: TypingWidgetTextProps) => {
  const [sessionId, setSessionId] = useState(Date.now())
  const [lines, setLines] = useState<CharacterProps[][]>([])
  const [lineIndex, setLineIndex] = useState(0)
  const [colIndex, setColIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  const resetTyping = useCallback(() => {
    if (typeof textToType === 'string') {
      const arr = resetTypedStatus(textToType)

      const chunks: CharacterProps[][] = []
      let currentLine: CharacterProps[] = []
      let currentLength = 0

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
          words.push([char]) // keep space as a separate token
        } else {
          currentWord.push(char)
        }
      }
      if (currentWord.length > 0) {
        words.push(currentWord)
      }

      // Build lines from words
      for (const word of words) {
        if (currentLength + word.length > LINE_LENGTH && currentLine.length > 0) {
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

  useEffect(() => {
    resetTyping()
    setSessionId(Date.now())
  }, [textToType, resetTyping])

  const handleFocus = () => setIsFocused(true)

  const handleBlur = () => {
    reset()
    setIsFocused(false)
    resetTyping()
  }

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

  const handleCharInput = async (key: string) => {
    if (!isFocused || !lines[lineIndex]) return

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
      cursorIndex: globalIndex, // now it's unique across lines
      timestamp: Date.now(),
      action: TypingAction.AddKey,
    })

    // End of whole text?
    if (lineIndex === lines.length - 1 && colIndex === line.length - 1) {
      setColIndex(-1)
      await onComplete()
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

  const handleBackspace = (ctrl = false) => {
    if (lineIndex === 0 && colIndex === 0) return // nothing to delete

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

      // Walk back through consecutive MISS/UNFIXED
      while (li >= 0 && lines[li][ci].typedStatus === TypedStatus.MISS) {
        if (ci === 0) {
          if (li === 0) break
          li--
          ci = lines[li].length - 1
        } else {
          ci--
        }
      }

      // Start point is just after that last non-deletable
      let startLine = li
      let startCol = ci + 1
      if (startCol >= lines[startLine].length) {
        startLine++
        startCol = 0
      }

      const globalStart = getGlobalIndex(startLine, startCol, lines)
      const globalEnd = getGlobalIndex(newLineIndex, newColIndex, lines)

      if (globalEnd < globalStart) return // nothing deletable

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
    const { key, ctrlKey } = e
    if (!ctrlKey) e.preventDefault()
    if (ctrlKey && key === 'r') return

    if (key === 'Backspace') {
      handleBackspace(ctrlKey)
      return
    }

    if (key.length === 1 && TYPABLE_CHARS_ARRAY.includes(key)) {
      if (isFocused && lineIndex === 0 && colIndex === 0) onStart()
      await handleCharInput(key)
    }
  }

  if (!textToType || !lines.length) return null

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Big preview char */}
      <div className="text-8xl">
        {lines[lineIndex]?.[colIndex]?.char
          ? lines[lineIndex][colIndex].char === ' '
            ? spaceSymbolMap[SpaceSymbols.DOT]
            : lines[lineIndex][colIndex].char
          : ''}
      </div>

      {/* Typing text area */}
      <div className="relative overflow-hidden h-[4.5rem]">
        {!isFocused && (
          <span className="absolute inset-0 flex items-center justify-center text-lg font-medium text-neutral-500 pointer-events-none">
            Click here to start
          </span>
        )}

        <div
          id="typing-widget-text"
          data-testid="typing-widget-text"
          className={`font-mono outline-none transition-transform duration-300 ease-in-out ${
            isFocused ? '' : 'blur-xs hover:cursor-pointer'
          }`}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            transform: `translateY(calc(1.5rem * ${1 - lineIndex}))`,
          }}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex justify-center h-[1.5rem] ${idx !== lineIndex ? 'opacity-10' : ''}`}
            >
              {line.map((charObj, ci) => (
                <Character
                  {...charObj}
                  fontSettings={fontSettings}
                  isActive={idx === lineIndex && ci === colIndex && isFocused}
                  key={`${idx}-${ci}-${sessionId}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard */}
      <UKKeyboardSvg
        highlightKey={lines[lineIndex]?.[colIndex]?.char}
        showNumberRow
        className="w-full h-auto"
      />
    </div>
  )
}
