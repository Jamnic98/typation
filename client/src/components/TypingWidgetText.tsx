import { useEffect, useRef, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fontSettings?: FontSettings
  onStart: () => Promise<void>
  onComplete: () => Promise<void>
  onType: (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => Promise<void>
}

export const TypingWidgetText = ({
  textToType,
  fontSettings = defaultFontSettings,
  onStart,
  onComplete,
  onType,
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
    setIsFocused(false)
    setCursorIndex(0)

    charObjArray &&
      setCharObjArray(charObjArray?.map((character) => ({ ...character, isActive: false })))
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
    if (textToType) {
      setCharObjArray(strToCharObjArray(textToType))
    }
  }, [textToType])

  const shiftCursor = (forward: boolean = true) =>
    setCursorIndex((prevIndex) => prevIndex + (forward ? 1 : -1))

  // TODO: insert incorrectly typed text into charObjArray
  const updateFunc = async (typedStatus: TypedStatus, key?: string) => {
    key && console.log(key)
    if (charObjArray) {
      // run onType func with current state
      onType(charObjArray, typedStatus, cursorIndex)
      // update state
      setCharObjArray(
        charObjArray.map((obj: CharacterProps, index: number) => {
          if (index === cursorIndex) {
            obj.typedStatus = typedStatus
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
    if (cursorIndex > 0 && charObjArray) {
      if (charObjArray[cursorIndex - 1].typedStatus === TypedStatus.MISS) {
        shiftCursor(false)
        const updatedCharObjArray = charObjArray.map((obj, index) => {
          if (index === cursorIndex - 1) {
            return { ...obj, typedStatus: TypedStatus.NONE }
          }
          return obj
        })
        setCharObjArray(updatedCharObjArray)
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
        charObjArray.map((characterProps, index) => (
          <Character {...characterProps} fontSettings={fontSettings} key={index} />
        ))}
    </div>
  )
}
