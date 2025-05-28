import { useEffect, useRef, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: () => Promise<void>
  onType: (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => Promise<void>
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
    if (cursorIndex === -1) setCursorIndex(0)
    if (charObjArray && !charObjArray[cursorIndex]?.isActive) {
      setCharObjArray(
        charObjArray?.map((character, index) => ({ ...character, isActive: index === cursorIndex }))
      )
    }
  }

  const onBlur = () => {
    reset && reset()
    setIsFocused(false)
    setCursorIndex(0)

    // reset charObjArray
    charObjArray &&
      setCharObjArray(
        charObjArray?.map((character) => ({
          ...character,
          isActive: false,
          typedStatus: TypedStatus.NONE,
        }))
      )
  }

  const strToCharObjArray = (string: string): CharacterProps[] =>
    string.split('').map((char, index) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: isFocused && index === 0,
    }))

  const typingWidgetTextRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [cursorIndex, setCursorIndex] = useState(-1)

  const [charObjArray, setCharObjArray] = useState<CharacterProps[] | null>(
    textToType ? strToCharObjArray(textToType) : null
  )

  useEffect(() => {
    // update the charObjArray to reflect cursor change visually
    if (charObjArray) {
      if (cursorIndex === charObjArray.length) setCursorIndex(0)
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

  const shiftCursor = (forward: boolean = true) =>
    setCursorIndex((prevIndex) => prevIndex + (forward ? 1 : -1))

  const updateFunc = async (typedStatus: TypedStatus, key?: string) => {
    if (!charObjArray) return

    // run onType func with current state
    onType(charObjArray, typedStatus, cursorIndex)

    // handle miss: insert incorrect character at cursorIndex
    if (key && typedStatus === TypedStatus.MISS) {
      const newCharObj: CharacterProps = {
        char: key,
        isActive: false,
        typedStatus: TypedStatus.MISS,
      }

      const updatedArray = [
        ...charObjArray.slice(0, cursorIndex),
        newCharObj,
        ...charObjArray.slice(cursorIndex + 1),
      ]

      setCharObjArray(updatedArray)
    } else {
      // normal update
      setCharObjArray(
        charObjArray.map((obj: CharacterProps, index: number) => {
          if (index === cursorIndex) {
            return {
              ...obj,
              typedStatus,
            }
          }
          return obj
        })
      )
    }
  }

  const updateCharObjArray = async (key: string): Promise<void> => {
    try {
      const highlightedCharacter = charObjArray?.[cursorIndex]
      const typedStatus = highlightedCharacter?.char === key ? TypedStatus.HIT : TypedStatus.MISS
      const lastTypedStatus = highlightedCharacter?.typedStatus

      if (typedStatus === TypedStatus.HIT) {
        if (lastTypedStatus === TypedStatus.NONE) {
          await updateFunc(TypedStatus.HIT)
        }
      } else if (typedStatus === TypedStatus.MISS) {
        await updateFunc(TypedStatus.MISS, key)
      }
      shiftCursor()
      if (isFocused && charObjArray && cursorIndex === charObjArray.length - 1) {
        await onComplete()
      }
    } catch (error) {
      console.error('updateCharObjArray failed:', error)
      throw new Error('Error updating charObjArray')
    }
  }

  const handleNormalKeyPress = async (key: string) => {
    try {
      charObjArray && (await updateCharObjArray(key))
    } catch (error) {
      console.error('Error handling normal key press:', error)
      throw new Error('Error handling normal key press')
    }
  }

  const handleBackspace = async () => {
    if (cursorIndex > 0 && charObjArray && textToType) {
      const prevIndex = cursorIndex - 1
      const prevChar = charObjArray[prevIndex]

      if (prevChar.typedStatus === TypedStatus.MISS) {
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
        shiftCursor(false)
      }
    }
  }

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLElement>) => {
    try {
      const { key } = e
      if (key.length === 1) {
        if (isFocused && cursorIndex === 0) onStart()
        await handleNormalKeyPress(key)
      } else {
        e.preventDefault()
      }
    } catch (error) {
      console.error('Error handling key press:', error)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()
    const { key } = e
    if (key === 'Backspace') {
      handleBackspace()
    }
  }

  if (!textToType) return null
  return (
    <div
      id="typing-widget-text"
      data-testid="typing-widget-text"
      ref={typingWidgetTextRef}
      className="w-fit h-fit font-mono outline-none "
      onKeyUp={(e) => handleKeyUp(e)}
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
