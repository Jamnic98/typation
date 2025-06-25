import { useCallback, useEffect, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: (charObjArray: CharacterProps[], cursorIndex: number) => Promise<void>
  onType: (charObjArray: CharacterProps[], cursorIndex: number, typedStatus?: TypedStatus) => void
  reset?: () => void
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

  const strToCharObjArray = useCallback((string: string): CharacterProps[] => {
    return string.split('').map((char) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: false,
    }))
  }, [])

  useEffect(() => {
    if (textToType) {
      setCursorIndex(0)
      setCharObjArray(strToCharObjArray(textToType))
    }
  }, [textToType, strToCharObjArray])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    reset?.()
    setCursorIndex(0)
    setIsFocused(false)
    textToType && setCharObjArray(strToCharObjArray(textToType))
  }

  const shiftCursor = (shift: number) => {
    if (!charObjArray) return
    let newIndex = (cursorIndex + shift) % charObjArray.length
    if (newIndex < 0) newIndex += charObjArray.length
    setCursorIndex(newIndex)
  }

  const updateFunc = (typedStatus: TypedStatus, key?: string) => {
    if (!charObjArray) return charObjArray
    return charObjArray.map((obj, index) =>
      index === cursorIndex
        ? {
            ...obj,
            typedStatus,
            ...(typedStatus === TypedStatus.MISS && key ? { char: key } : {}),
          }
        : obj
    )
  }

  const updateCharObjArray = (
    typedStatus: TypedStatus,
    lastTypedStatus: TypedStatus,
    key: string
  ) => {
    try {
      const updated =
        typedStatus === TypedStatus.HIT && lastTypedStatus === TypedStatus.NONE
          ? updateFunc(TypedStatus.HIT)
          : updateFunc(TypedStatus.MISS, key)
      setCharObjArray(updated)
      return updated
    } catch (error) {
      console.error('updateCharObjArray failed:', error)
      throw new Error('Error updating charObjArray')
    }
  }

  const handleNormalKeyPress = async (key: string) => {
    if (!isFocused || !charObjArray) return

    const currentChar = charObjArray[cursorIndex]
    const typedStatus = currentChar?.char === key ? TypedStatus.HIT : TypedStatus.MISS
    const lastTypedStatus = currentChar?.typedStatus

    const updated = updateCharObjArray(typedStatus, lastTypedStatus, key)
    if (updated) {
      onType(updated, cursorIndex, typedStatus)
    }

    if (cursorIndex === charObjArray.length - 1) {
      await onComplete(charObjArray, cursorIndex)
      setCursorIndex(0)
      return
    }

    shiftCursor(1)
  }

  const handleBackspace = (ctrl: boolean = false) => {
    if (!charObjArray || !textToType || cursorIndex === 0) return

    const prevIndex = cursorIndex - 1
    const prevChar = charObjArray[prevIndex]

    if (prevChar.typedStatus === TypedStatus.MISS) {
      let updated = [...charObjArray]

      if (ctrl) {
        const findDeleteFrom = (index: number): number =>
          index < 0 || updated[index].typedStatus !== TypedStatus.MISS
            ? index + 1
            : findDeleteFrom(index - 1)

        const deleteFrom = findDeleteFrom(prevIndex)

        updated = updated.map((char, idx) =>
          idx >= deleteFrom && idx <= prevIndex
            ? { ...char, typedStatus: TypedStatus.NONE, char: textToType[idx] }
            : char
        )

        setCharObjArray(updated)
        setCursorIndex(deleteFrom)
      } else {
        updated[prevIndex] = {
          ...updated[prevIndex],
          char: textToType[prevIndex],
          typedStatus: TypedStatus.NONE,
        }
        setCharObjArray(updated)
        setCursorIndex(prevIndex)
      }
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

    if (key.length === 1) {
      if (isFocused && cursorIndex === 0) onStart()
      await handleNormalKeyPress(key)
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
            key={`${character.char}-${index}`}
          />
        ))}
      </div>
    </div>
  )
}
