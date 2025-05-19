import { useEffect, useRef, useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

export interface TypingWidgetTextProps {
  textToType: string | null
  fetchNewString: () => Promise<string>
  fontSettings?: FontSettings
  onStart: () => void
  onComplete: () => void
}

export const TypingWidgetText = ({
  textToType,
  fetchNewString,
  fontSettings = defaultFontSettings,
  onStart,
  onComplete,
}: TypingWidgetTextProps) => {
  const onFocus = () => {
    setFocused(true)
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
    setFocused(false)
    charObjArray &&
      setCharObjArray(charObjArray?.map((character) => ({ ...character, isActive: false })))
  }

  const strToCharObjArray = (string: string): CharacterProps[] =>
    string.split('').map((char, index) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: focused && index === 0,
    }))

  const typingWidgetTextRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  // const [showCursor, setShowCursor] = useState(false)
  const [cursorIndex, setCursorIndex] = useState(-1)

  const [charObjArray, setCharObjArray] = useState<CharacterProps[] | null>(
    textToType ? strToCharObjArray(textToType) : null
  )

  useEffect(() => {
    if (charObjArray && charObjArray.length > 0) {
      setCharObjArray(
        charObjArray.map((obj, index) => ({
          ...obj,
          isActive: focused && index === cursorIndex,
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

  const shiftCursor = () => setCursorIndex((prevIndex) => prevIndex + 1)

  const updateStats = async (typedStatus: TypedStatus /* , lastTypedStatus: TypedStatus */) => {
    const char = charObjArray?.[cursorIndex].char
    console.log(typedStatus)
    console.log(char)
  }

  const updateFunc = async (typedStatus: TypedStatus) => {
    charObjArray &&
      setCharObjArray(
        charObjArray.map((obj: CharacterProps, index: number) => {
          if (index === cursorIndex) {
            obj.typedStatus = typedStatus
          }
          return obj
        })
      )
  }

  const updateCharObjArray = async (key: string): Promise<void> => {
    try {
      const highlightedCharacter = charObjArray?.[cursorIndex]
      const typedStatus = highlightedCharacter?.char === key ? TypedStatus.HIT : TypedStatus.MISS
      const lastTypedStatus = highlightedCharacter?.typedStatus

      if (typedStatus === TypedStatus.HIT) {
        if (lastTypedStatus === TypedStatus.NONE) {
          await updateStats(typedStatus)
          await updateFunc(TypedStatus.HIT)
        }
        shiftCursor()
        if (charObjArray && cursorIndex === charObjArray.length - 1) {
          const newString = await fetchNewString()
          setCharObjArray(strToCharObjArray(newString ?? ''))
        }
      } else if (typedStatus === TypedStatus.MISS) {
        if (lastTypedStatus === TypedStatus.NONE) {
          await updateFunc(TypedStatus.MISS)
        }
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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    try {
      const { key } = e
      if (key === 'Backspace') {
        // handle backspace
      } else if (key == 'Space') {
        e.preventDefault()
        await handleNormalKeyPress(key)
        return
      } else if (key === 'Tab') {
        e.preventDefault() // so focus doesn’t jump
        // handle tab
      } else if (key.length === 1) {
        // it's a printable character, including shifted ones like 'A'await handleNormalKeyPress(key)
        await handleNormalKeyPress(key)
      } else {
        // Ignore modifier or control keys (Shift, Ctrl, etc.)
        return
      }
    } catch (error) {
      console.error('Error handling key press:', error)
    }
  }

  if (!textToType) return null
  return (
    <div
      ref={typingWidgetTextRef}
      className="w-fit font-mono outline-none" //  focus:outline outline-black font-mono p-4"
      onKeyUp={(e) => handleKeyDown(e)}
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
