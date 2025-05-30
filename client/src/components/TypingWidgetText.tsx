import { useEffect, useRef, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: () => Promise<void>
  onType: (charObjArray: CharacterProps[], typedStatus: TypedStatus, cursorIndex: number) => void
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
  const onFocus = () => {
    setIsFocused(true)
    if (cursorIndex === -1) {
      setCursorIndex(0)
    } else if (charObjArray && !charObjArray[cursorIndex]?.isActive) {
      setCharObjArray(
        charObjArray?.map((character, index) => ({ ...character, isActive: index === cursorIndex }))
      )
    }
  }

  const onBlur = () => {
    reset && reset()
    setIsFocused(false)

    // reset charObjArray
    setCursorIndex(0)
    textToType && setCharObjArray(strToCharObjArray(textToType))
  }

  const strToCharObjArray = (string: string): CharacterProps[] =>
    string.split('').map((char, index) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: isFocused && index === cursorIndex,
    }))

  const typingWidgetTextRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [cursorIndex, setCursorIndex] = useState(-1)

  const [charObjArray, setCharObjArray] = useState<CharacterProps[] | null>(
    textToType ? strToCharObjArray(textToType) : null
  )

  useEffect(() => {
    // update the charObjArray to reflect cursor change visually
    if (charObjArray && cursorIndex >= 0) {
      setCharObjArray(
        charObjArray.map((obj, index) => ({
          ...obj,
          isActive: isFocused && index === cursorIndex,
        }))
      )
    }
  }, [cursorIndex])

  useEffect(() => {
    textToType && setCharObjArray(strToCharObjArray(textToType))
  }, [textToType])

  const shiftCursor = (shift: number) => {
    if (!charObjArray || charObjArray.length === 0) return

    setCursorIndex((prevIndex) => {
      const len = charObjArray.length
      // Calculate new index with wrapping:
      // Use modulo, but since JS % can be negative, handle that:
      let newIndex = (prevIndex + shift) % len
      if (newIndex < 0) newIndex += len
      return newIndex
    })
  }

  const updateFunc = (typedStatus: TypedStatus, key?: string) => {
    if (!charObjArray) return charObjArray
    return key && typedStatus === TypedStatus.MISS
      ? [
          ...charObjArray.slice(0, cursorIndex),
          { char: key, typedStatus: TypedStatus.MISS, isActive: false },
          ...charObjArray.slice(cursorIndex + 1),
        ]
      : charObjArray.map((obj, index) => (index === cursorIndex ? { ...obj, typedStatus } : obj))
  }

  const updateCharObjArray = (
    typedStatus: TypedStatus,
    lastTypedStatus: TypedStatus,
    key: string
  ) => {
    try {
      return typedStatus === TypedStatus.HIT && lastTypedStatus === TypedStatus.NONE
        ? updateFunc(TypedStatus.HIT)
        : updateFunc(TypedStatus.MISS, key)
    } catch (error) {
      console.error('updateCharObjArray failed:', error)
      throw new Error('Error updating charObjArray')
    }
  }

  const handleNormalKeyPress = async (key: string) => {
    try {
      if (!isFocused || !charObjArray) return
      const highlightedCharacter = charObjArray?.[cursorIndex]
      const typedStatus = highlightedCharacter?.char === key ? TypedStatus.HIT : TypedStatus.MISS
      const lastTypedStatus = highlightedCharacter?.typedStatus

      const updatedCharObjArray = updateCharObjArray(typedStatus, lastTypedStatus, key)
      if (updatedCharObjArray) {
        onType(updatedCharObjArray, typedStatus, cursorIndex)
        setCharObjArray(updatedCharObjArray)
      }
      if (cursorIndex === charObjArray.length - 1) await onComplete()
      shiftCursor(1)
    } catch (error) {
      console.error('Error handling normal key press:', error)
      throw new Error('Error handling normal key press')
    }
  }

  const handleBackspace = (ctrl: boolean = false) => {
    if (cursorIndex > 0 && charObjArray && textToType) {
      const prevIndex = cursorIndex - 1
      const prevChar = charObjArray[prevIndex]
      // only allow missed chars to be deleted
      if (prevChar.typedStatus === TypedStatus.MISS) {
        if (ctrl) {
          // Find position after last correctly typed char before cursor using recursion or a functional approach
          const findDeleteFrom = (index: number): number =>
            index < 0 || charObjArray[index].typedStatus !== TypedStatus.MISS
              ? index + 1
              : findDeleteFrom(index - 1)

          const deleteFrom = findDeleteFrom(cursorIndex - 1)

          // Reset missed chars in [deleteFrom, cursorIndex)
          const updatedCharObjArray = charObjArray.map((obj, index) =>
            index >= deleteFrom && index < cursorIndex && obj.typedStatus === TypedStatus.MISS
              ? { ...obj, typedStatus: TypedStatus.NONE, char: textToType[index] }
              : obj
          )

          setCharObjArray(updatedCharObjArray)
          shiftCursor(deleteFrom - cursorIndex) // shiftCursor by the relative distance
        } else {
          const updatedCharObjArray = charObjArray.map((obj, index) =>
            index === prevIndex
              ? {
                  ...obj,
                  char: textToType[prevIndex],
                  typedStatus: TypedStatus.NONE,
                }
              : obj
          )

          setCharObjArray(updatedCharObjArray)
          shiftCursor(-1)
        }
      }
    }
  }

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()
    try {
      const { key } = e
      if (key.length === 1) {
        if (isFocused && cursorIndex === 0) onStart()
        await handleNormalKeyPress(key)
      }
    } catch (error) {
      console.error('Error handling key press:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!e.ctrlKey) e.preventDefault()
    if (e.key === 'Backspace') handleBackspace(e.ctrlKey || e.metaKey)
  }

  if (!textToType) return null
  return (
    <div
      id="typing-widget-text"
      data-testid="typing-widget-text"
      ref={typingWidgetTextRef}
      className="w-fit h-fit font-mono outline-none "
      onKeyUp={async (e) => await handleKeyUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={0}
    >
      {charObjArray &&
        charObjArray.map((character, index) => (
          <Character
            {...character}
            fontSettings={fontSettings}
            key={`${character.char}-${index}`}
          />
        ))}
    </div>
  )
}
