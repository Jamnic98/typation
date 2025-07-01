import { useCallback, useEffect, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings, TYPABLE_CHARS_ARRAY } from 'utils/constants'
import { findDeleteFrom } from 'utils/helpers'
import { TypedStatus, TypingAction, type OnTypeParams, type FontSettings } from 'types'

// TODO MOVE
const resetTypedStatus = (chars: CharacterProps[] | string): CharacterProps[] => {
  if (typeof chars === 'string') {
    return chars.split('').map((char) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: false,
    }))
  }

  return chars.map((c) => ({ ...c, typedStatus: TypedStatus.NONE }))
}

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
      setCharObjArray(resetTypedStatus(textToType))
      setCursorIndex(0)
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
    if (!charObjArray) return
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
          await onComplete(
            charObjArray.filter((charObj) => charObj.typedStatus === TypedStatus.CORRECTED).length
          )
          setCursorIndex(0)
        } catch (err) {
          console.error('Failed to complete typing session:', err)
        }
        return
      }
    }

    shiftCursor(1)
  }

  const handleBackspace = (ctrl: boolean = false): void => {
    if (!charObjArray || !textToType || cursorIndex === 0) return

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

  const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()
    if (e.ctrlKey && e.key === 'r') return
  }

  if (!textToType || !charObjArray) return null

  return (
    <div className="relative w-fit h-fit select-none">
      {!isFocused && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none text-lg font-medium text-neutral-500">
          Click here to start
        </div>
      )}

      <div
        id="typing-widget-text"
        data-testid="typing-widget-text"
        className={`w-fit h-fit font-mono outline-none transition duration-300 ease-in-out ${
          isFocused ? '' : 'blur-xs'
        }`}
        tabIndex={0}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {charObjArray.map((character, index) => (
          <Character
            {...character}
            fontSettings={fontSettings}
            isActive={index === cursorIndex && isFocused}
            key={`${character.char ?? ''}-${index}`}
          />
        ))}
      </div>
    </div>
  )
}
