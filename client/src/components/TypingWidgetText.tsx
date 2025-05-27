import { useEffect, useRef, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  // fetchNewString: () => Promise<string>
  fontSettings?: FontSettings
  onStart: () => Promise<void>
  onComplete: () // charObjArray: CharacterProps[],
  // typedStatus: TypedStatus,
  // cursorIndex: number
  => Promise<void>
  onType: (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => Promise<void>
}

export const TypingWidgetText = ({
  textToType,
  // fetchNewString,
  fontSettings = defaultFontSettings,
  onStart,
  onComplete,
  onType,
}: TypingWidgetTextProps) => {
  const onFocus = () => {
    setIsFocused(true)
    if (cursorIndex === -1) {
      setCursorIndex(0)
    }

    if (charObjArray && !charObjArray[cursorIndex]?.isActive) {
      setCharObjArray(
        charObjArray?.map((character, index) => ({ ...character, isActive: index === cursorIndex }))
      )
    }
  }

  const onBlur = () => {
    setIsFocused(false)
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
      setCharObjArray(
        charObjArray.map((obj, index) => ({
          ...obj,
          isActive: isFocused && index === cursorIndex,
        }))
      )
      if (cursorIndex >= 0 && cursorIndex >= charObjArray.length) {
        setCursorIndex(0)
      }
    }
  }, [cursorIndex])

  useEffect(() => {
    if (textToType) {
      setCharObjArray(strToCharObjArray(textToType))
    }
  }, [textToType])

  const shiftCursor = (forward: boolean = true) => {
    setCursorIndex((prevIndex) => {
      if (prevIndex === charObjArray?.length) {
        return 0
      }
      return prevIndex + (forward ? 1 : -1)
    })
  }

  const updateFunc = async (typedStatus: TypedStatus) => {
    if (charObjArray) {
      onType(charObjArray, typedStatus, cursorIndex)
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
        // shiftCursor()
        if (lastTypedStatus === TypedStatus.NONE) {
          await updateFunc(TypedStatus.HIT)
        }
        if (isFocused && charObjArray && cursorIndex === charObjArray.length - 1) {
          // if (isFocused && charObjArray && cursorIndex === charObjArray?.length - 1) {
          // }
          await onComplete()
          // const newString = await fetchNewString()
          // setCharObjArray(strToCharObjArray(newString ?? ''))
        }
      } else if (typedStatus === TypedStatus.MISS) {
        await updateFunc(TypedStatus.MISS)
        // if (lastTypedStatus === TypedStatus.NONE) {
        // }
      }
      shiftCursor()
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
    // shiftCursor(false)
    // handle backspace
    if (cursorIndex > 0 && charObjArray) {
      setCursorIndex((prevIndex) => prevIndex - 1)
      const updatedCharObjArray = charObjArray.map((obj, index) => {
        if (index === cursorIndex - 1) {
          return { ...obj, typedStatus: TypedStatus.NONE }
        }
        return obj
      })
      setCharObjArray(updatedCharObjArray)
    }
  }

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLElement>) => {
    try {
      const { key } = e
      if (key == 'Space') {
        e.preventDefault()
        await handleNormalKeyPress(key)
        return
      } else if (key === 'Tab') {
        e.preventDefault() // so focus doesn’t jump
      } else if (key.length === 1) {
        if (isFocused && cursorIndex === 0) {
          onStart()
        }
        await handleNormalKeyPress(key)
      } else {
        // Ignore modifier or control keys (Shift, Ctrl, etc.)
        return
      }
    } catch (error) {
      console.error('Error handling key press:', error)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault() // prevent default behavior for all keys
    const { key } = e
    if (key === 'Backspace') {
      handleBackspace()
    }
  }

  if (!textToType) return null
  return (
    <div
      ref={typingWidgetTextRef}
      className="w-fit h-fit font-mono outline-none "
      // onKeyUp={(e) => handleKeyUp(e)}
      onKeyUp={(e) => handleKeyUp(e)}
      onKeyDown={(e) => handleKeyDown(e)}
      id="typing-widget-text"
      data-testid="typing-widget-text"
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
