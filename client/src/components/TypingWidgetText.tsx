import { useCallback, useEffect, useRef, useState } from 'react'

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
  const cursorIndex = useRef<number>(-1)
  const typingWidgetTextRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const strToCharObjArray = useCallback(
    (string: string, showCursor: boolean = false): CharacterProps[] => {
      return string.split('').map((char, index) => ({
        char,
        typedStatus: TypedStatus.NONE,
        isActive: showCursor && isFocused && index === cursorIndex.current,
      }))
    },
    [isFocused]
  )

  const [charObjArray, setCharObjArray] = useState<CharacterProps[] | null>(
    textToType ? strToCharObjArray(textToType) : null
  )

  useEffect(() => {
    if (textToType) {
      cursorIndex.current = 0
      setCharObjArray(strToCharObjArray(textToType, true))
    }
  }, [textToType])

  useEffect(() => {
    if (isFocused && charObjArray) {
      updateCharObjArrayManually(cursorIndex.current)
    }
  }, [isFocused])

  const setCharObjArrayWithCursor = (
    updater: (prev: CharacterProps[], index: number) => CharacterProps[],
    indexOverride?: number
  ) => {
    setCharObjArray((previousCharArray) => {
      if (!previousCharArray) return []

      const activeIndex = indexOverride ?? cursorIndex.current

      const updatedCharArray = updater(previousCharArray, activeIndex)

      return updatedCharArray.map((character, idx) => ({
        ...character,
        isActive: isFocused && idx === activeIndex,
      }))
    })
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (cursorIndex.current === -1) cursorIndex.current = 0
    setCharObjArrayWithCursor((prev) => [...prev])
  }

  const handleBlur = () => {
    setIsFocused(false)
    reset && reset()
    cursorIndex.current = -1
    textToType && setCharObjArray(strToCharObjArray(textToType, false))
  }

  const forceCursorUpdate = () => setCharObjArrayWithCursor((prev) => [...prev])

  const shiftCursor = (shift: number) => {
    if (!charObjArray || charObjArray.length === 0) return
    const len = charObjArray.length
    let newIndex = (cursorIndex.current + shift) % len
    if (newIndex < 0) newIndex += len
    cursorIndex.current = newIndex
    forceCursorUpdate()
  }

  const updateCharObjArrayManually = (cursorPosition: number = 0) =>
    setCharObjArray((prev) =>
      prev
        ? prev.map((charObj, idx) => ({
            ...charObj,
            isActive: isFocused && cursorPosition === idx,
          }))
        : []
    )

  const updateFunc = (typedStatus: TypedStatus, key?: string) => {
    if (!charObjArray) return charObjArray
    return key && typedStatus === TypedStatus.MISS
      ? [
          ...charObjArray.slice(0, cursorIndex.current),
          { char: key, typedStatus: TypedStatus.MISS, isActive: false },
          ...charObjArray.slice(cursorIndex.current + 1),
        ]
      : charObjArray.map((obj, index) =>
          index === cursorIndex.current ? { ...obj, typedStatus } : obj
        )
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
      const highlightedCharacter = charObjArray?.[cursorIndex.current]
      const typedStatus = highlightedCharacter?.char === key ? TypedStatus.HIT : TypedStatus.MISS
      const lastTypedStatus = highlightedCharacter?.typedStatus

      const updatedCharObjArray = updateCharObjArray(typedStatus, lastTypedStatus, key)
      if (updatedCharObjArray) {
        onType(updatedCharObjArray, typedStatus, cursorIndex.current)
        setCharObjArrayWithCursor(() => updatedCharObjArray)
      }
      if (cursorIndex.current === charObjArray.length - 1) {
        cursorIndex.current = 0
        await onComplete()
        return
      }
      shiftCursor(1)
    } catch (error) {
      console.error('Error handling normal key press:', error)
      throw new Error('Error handling normal key press')
    }
  }

  const handleBackspace = (ctrl: boolean = false) => {
    if (cursorIndex.current > 0 && charObjArray && textToType) {
      const prevIndex = cursorIndex.current - 1
      const prevChar = charObjArray[prevIndex]
      // only allow missed chars to be deleted
      if (prevChar.typedStatus === TypedStatus.MISS) {
        if (ctrl) {
          // Find position after last correctly typed char before cursor using recursion or a functional approach
          const findDeleteFrom = (index: number): number =>
            index < 0 || charObjArray[index].typedStatus !== TypedStatus.MISS
              ? index + 1
              : findDeleteFrom(index - 1)

          const deleteFrom = findDeleteFrom(cursorIndex.current - 1)

          // Reset missed chars in [deleteFrom, cursorIndex.current)
          const updatedCharObjArray = charObjArray.map((obj, index) =>
            index >= deleteFrom &&
            index < cursorIndex.current &&
            obj.typedStatus === TypedStatus.MISS
              ? { ...obj, typedStatus: TypedStatus.NONE, char: textToType[index] }
              : obj
          )

          setCharObjArrayWithCursor(() => updatedCharObjArray)
          shiftCursor(deleteFrom - cursorIndex.current)
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

          setCharObjArrayWithCursor(() => updatedCharObjArray)
          shiftCursor(-1)
        }
      }
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    try {
      const { key, ctrlKey, metaKey } = e

      if (!ctrlKey) e.preventDefault()
      if (ctrlKey && key === 'r') return

      if (key === 'Backspace') {
        handleBackspace(ctrlKey || metaKey)
        return
      }

      if (key.length === 1) {
        if (isFocused && cursorIndex.current === 0) onStart()
        await handleNormalKeyPress(key)
      }
    } catch (error) {
      console.error('Error handling key press:', error)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()
    if (e.ctrlKey && e.key === 'r') return
  }

  if (!textToType) return null
  return (
    <div className="relative w-fit h-fit select-none">
      {/* Overlay message when not focused */}
      {!isFocused && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none text-lg font-medium text-neutral-500">
          Click here to start
        </div>
      )}

      {/* Typing widget */}
      <div
        id="typing-widget-text"
        data-testid="typing-widget-text"
        ref={typingWidgetTextRef}
        className={`w-fit h-fit font-mono outline-none transition duration-300 ease-in-out ${
          isFocused ? '' : 'blur-xs'
        }`}
        onKeyUp={(e) => handleKeyUp(e)}
        onKeyDown={async (e) => await handleKeyDown(e)}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
    </div>
  )
}
