import { useCallback, useEffect, useState } from 'react'

import { type CharacterProps, Character } from 'components'
import { findDeleteFrom, resetTypedStatus } from 'utils/helpers'
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
import SvgKeyboardUK from './SvgKeyboardUK'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: () => Promise<void>
  onType: (params: OnTypeParams) => void
  reset: () => void
}

export const TypingWidgetText = ({
  textToType,
  fontSettings = defaultFontSettings,
  onStart,
  onComplete,
  onType,
  reset,
}: TypingWidgetTextProps) => {
  const [sessionId, setSessionId] = useState(Date.now())
  const [cursorIndex, setCursorIndex] = useState<number>(0)
  const [charObjArray, setCharObjArray] = useState<CharacterProps[] | null>(null)
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const resetTyping = useCallback(() => {
    if (typeof textToType === 'string') {
      setCursorIndex(0)
      setCharObjArray(resetTypedStatus(textToType))
    }
  }, [textToType])

  useEffect(() => {
    resetTyping()
    setSessionId(Date.now())
  }, [textToType, resetTyping])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = (): void => {
    reset()
    setIsFocused(false)
    resetTyping()
  }

  const shiftCursor = (shift: number): void => {
    if (!charObjArray || cursorIndex === -1) return

    let newIndex = (cursorIndex + shift) % charObjArray.length
    if (newIndex < 0) newIndex += charObjArray.length
    setCursorIndex(newIndex)
  }

  const updateCharStatusAtCursor = (
    typedStatus: TypedStatus,
    key?: string
  ): CharacterProps[] | null => {
    if (!charObjArray) return charObjArray

    return charObjArray.map((obj, index) => {
      if (index !== cursorIndex) return obj

      let newStatus = typedStatus

      if (obj.typedStatus === TypedStatus.PENDING) {
        if (typedStatus === TypedStatus.HIT) {
          newStatus = TypedStatus.FIXED
        } else if (typedStatus === TypedStatus.MISS) {
          newStatus = TypedStatus.UNFIXED
        }
      }

      return {
        ...obj,
        typedStatus: newStatus,
        ...(newStatus === TypedStatus.MISS || newStatus === TypedStatus.UNFIXED
          ? key && obj.char !== ' '
            ? { typedChar: key } // record the wrong key
            : {}
          : {}),
      }
    })
  }

  const applyTypingUpdate = (typedStatus: TypedStatus, key: string) => {
    const updated = updateCharStatusAtCursor(typedStatus, key)
    setCharObjArray(updated)
    return updated
  }

  const handleCharInput = async (key: string): Promise<void> => {
    if (!isFocused || !charObjArray) return

    // If we're already at/past the end, just complete
    if (cursorIndex >= charObjArray.length) {
      try {
        await onComplete()
      } catch (err) {
        console.error('Failed to complete typing session:', err)
      }
      return
    }

    // Determine raw typed status
    const typedStatusRaw =
      charObjArray[cursorIndex]?.char === key ? TypedStatus.HIT : TypedStatus.MISS

    // Apply update
    const updated = applyTypingUpdate(typedStatusRaw, key)

    if (updated && cursorIndex < updated.length) {
      const finalStatus = updated[cursorIndex]?.typedStatus

      onType({
        key,
        typedStatus: finalStatus,
        cursorIndex,
        timestamp: Date.now(),
        action: TypingAction.AddKey,
      })
    }

    // Handle last char vs continue typing
    if (cursorIndex === charObjArray.length - 1) {
      try {
        setCursorIndex(-1) // mark finished
        await onComplete()
      } catch (err) {
        console.error('Failed to complete typing session:', err)
      }
      return
    }

    // Otherwise, move forward
    shiftCursor(1)
  }

  const handleBackspace = (ctrl: boolean = false): void => {
    if (!textToType || !charObjArray || cursorIndex === 0) return

    const prevIndex = cursorIndex - 1
    const prevChar = charObjArray[prevIndex]
    if (!prevChar) return

    let updated = [...charObjArray]

    if (ctrl) {
      // Bulk backspace (ctrl+backspace): clear a range of errors
      const deleteFrom = findDeleteFrom(updated, prevIndex)
      const deleteCount = prevIndex - deleteFrom + 1

      onType({
        key: SpecialEvent.BACKSPACE,
        cursorIndex: prevIndex,
        timestamp: Date.now(),
        action: TypingAction.ClearMissRange,
        deleteCount,
      })

      updated = updated.map((char, idx) =>
        idx >= deleteFrom && idx <= prevIndex
          ? {
              ...char,
              char: textToType[idx],
              typedStatus:
                char.typedStatus === TypedStatus.MISS
                  ? TypedStatus.PENDING // 🔑 mark as pending correction
                  : TypedStatus.NONE,
            }
          : char
      )

      setCharObjArray(updated)
      setCursorIndex(deleteFrom)
    } else {
      // Single backspace
      onType({
        key: SpecialEvent.BACKSPACE,
        cursorIndex: prevIndex,
        timestamp: Date.now(),
        action: TypingAction.BackspaceSingle,
        deleteCount: 1,
      })

      updated[prevIndex] = {
        ...updated[prevIndex],
        char: textToType[prevIndex],
        typedStatus:
          updated[prevIndex].typedStatus === TypedStatus.MISS
            ? TypedStatus.PENDING // 🔑 mark as pending correction
            : TypedStatus.NONE,
      }

      setCharObjArray(updated)
      shiftCursor(-1)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    const { key, ctrlKey, metaKey } = e
    if (!ctrlKey) e.preventDefault()
    if (ctrlKey && key === 'r') return

    if (key === 'Backspace') {
      handleBackspace(ctrlKey || metaKey)
      return
    }

    if (key.length === 1 && TYPABLE_CHARS_ARRAY.indexOf(key) !== -1) {
      if (isFocused && cursorIndex === 0) onStart()
      await handleCharInput(key)
    }
  }

  if (!textToType || !charObjArray) return null

  return (
    <>
      <div className="relative select-none">
        <div>
          {textToType && charObjArray && !isFocused ? (
            <span className="absolute inset-0 flex items-center justify-center flex-row z-10 pointer-events-none select-none text-lg font-medium text-neutral-500">
              Click here to start
            </span>
          ) : null}
        </div>
        <div>
          <div
            id="typing-widget-text"
            data-testid="typing-widget-text"
            className={`font-mono outline-none transition duration-300 ease-in-out min-h-6 ${
              isFocused ? '' : 'blur-xs hover:cursor-pointer'
            } flex justify-center text-center flex-wrap`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {(() => {
              const words: CharacterProps[][] = []
              let currentWord: CharacterProps[] = []

              charObjArray.forEach((charObj) => {
                if (charObj.char === ' ') {
                  if (currentWord.length) words.push(currentWord)
                  words.push([charObj])
                  currentWord = []
                } else {
                  currentWord.push(charObj)
                }
              })
              if (currentWord.length) words.push(currentWord)

              return words.map((wordChars, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap">
                  {wordChars.map((charObj) => {
                    const index = charObjArray.indexOf(charObj)
                    return (
                      <Character
                        {...charObj}
                        fontSettings={fontSettings}
                        isActive={index === cursorIndex && isFocused}
                        key={`${index}-${charObj.char}-${sessionId}`}
                      />
                    )
                  })}
                </span>
              ))
            })()}
          </div>
        </div>
      </div>

      <div className="w-fit m-auto  text-8xl my-8 select-none">
        {charObjArray && charObjArray[cursorIndex]?.char
          ? charObjArray[cursorIndex]?.char === ' '
            ? spaceSymbolMap[SpaceSymbols.DOT]
            : charObjArray[cursorIndex]?.char
          : ''}
      </div>

      <SvgKeyboardUK
        highlightKey={charObjArray[cursorIndex]?.char}
        showNumberRow
        className="w-full h-auto"
      />
    </>
  )
}
