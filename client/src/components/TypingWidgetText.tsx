import { useCallback, useEffect, useState } from 'react'

import { type CharacterProps, Character } from 'components'
import { findDeleteFrom, resetTypedStatus } from 'utils/helpers'
import { defaultFontSettings, TYPABLE_CHARS_ARRAY } from 'utils/constants'
import { type OnTypeParams, type FontSettings, TypedStatus, TypingAction } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: (correctedCharCount: number) => Promise<void>
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
      // When correcting from MISS or PENDING to HIT
      if (
        typedStatus === TypedStatus.HIT &&
        (obj.typedStatus === TypedStatus.MISS || obj.typedStatus === TypedStatus.PENDING)
      ) {
        newStatus = TypedStatus.CORRECTED
      } else if (
        typedStatus === TypedStatus.MISS &&
        (obj.typedStatus === TypedStatus.MISS || obj.typedStatus === TypedStatus.PENDING)
      ) {
        newStatus = TypedStatus.NON_FIX_DELETE
      }

      return {
        ...obj,
        typedStatus: newStatus,
        ...((newStatus === TypedStatus.MISS || newStatus === TypedStatus.NON_FIX_DELETE) && key
          ? { char: key }
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

    const typedStatus = charObjArray[cursorIndex]?.char === key ? TypedStatus.HIT : TypedStatus.MISS
    const updated = applyTypingUpdate(typedStatus, key)

    if (updated) {
      onType({
        key,
        typedStatus,
        cursorIndex,
        timestamp: Date.now(),
        action: TypingAction.AddKey,
      })

      if (cursorIndex === charObjArray.length - 1) {
        try {
          setCursorIndex(-1)
          await onComplete(
            charObjArray.filter((charObj) => charObj.typedStatus === TypedStatus.CORRECTED).length
          )
        } catch (err) {
          console.error('Failed to complete typing session:', err)
        }
        return
      }
    }

    shiftCursor(1)
  }

  const handleBackspace = (ctrl: boolean = false): void => {
    if (!textToType || !charObjArray || cursorIndex === 0) return

    const prevIndex = cursorIndex - 1
    const prevChar = charObjArray[prevIndex]
    if (!prevChar || prevChar.typedStatus !== TypedStatus.MISS) return

    let updated = [...charObjArray]

    if (ctrl) {
      const deleteFrom = findDeleteFrom(updated, prevIndex)
      const deleteCount = prevIndex - deleteFrom + 1
      onType({
        key: 'Backspace',
        typedStatus: TypedStatus.NONE,
        cursorIndex: prevIndex,
        timestamp: Date.now(),
        action: TypingAction.ClearMissRange,
        deleteCount,
      })

      updated = updated.map((char, idx) =>
        idx >= deleteFrom && idx <= prevIndex
          ? {
              ...char,
              typedStatus:
                char.typedStatus === TypedStatus.MISS ? TypedStatus.PENDING : TypedStatus.NONE,
              char: textToType[idx], // reset displayed char as before
            }
          : char
      )

      setCharObjArray(updated)
      setCursorIndex(deleteFrom)
    } else {
      // Single backspace — tell onType to pop last event
      onType({
        key: 'Backspace',
        typedStatus: TypedStatus.NONE,
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
            ? TypedStatus.PENDING
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
    <div className="relative select-none">
      {textToType && charObjArray && !isFocused ? (
        <div className="absolute inset-0 flex items-center justify-center flex-row z-10 pointer-events-none select-none text-lg font-medium text-neutral-500">
          Click here to start
        </div>
      ) : null}
      <div
        id="typing-widget-text"
        data-testid="typing-widget-text"
        className={`font-mono outline-none transition duration-300 ease-in-out min-h-12 ${
          isFocused ? '' : 'blur-xs'
        }`}
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
                    key={`${charObj.char ?? ''}-${index}`}
                  />
                )
              })}
            </span>
          ))
        })()}
      </div>
    </div>
  )
}
