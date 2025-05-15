import { useState } from 'react'

import { Character, type CharacterProps } from 'components'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings, TypedStatus } from 'types'

const strToCharObjArray = (string: string): CharacterProps[] =>
  string.split('').map((char, index) => ({
    char,
    typedStatus: TypedStatus.NONE,
    highlighted: index === 0,
  }))

export interface TypingWidgetTextProps {
  textToType: string | null
  fetchNewString: () => Promise<string>
  fontSettings?: FontSettings
}

export const TypingWidgetText = ({
  textToType,
  fetchNewString,
  fontSettings = defaultFontSettings,
}: TypingWidgetTextProps) => {
  if (!textToType) return null

  const [charObjArray, setCharObjArray] = useState<CharacterProps[]>(strToCharObjArray(textToType))

  const getCursorIndex = (): number => {
    try {
      const cursorIndex = charObjArray.map((charObj) => charObj.highlighted).indexOf(true)
      if (cursorIndex < 0 || cursorIndex >= charObjArray.length) {
        console.warn('Invalid cursor index:', cursorIndex)
        throw new Error('Cursor index out of bounds')
      }
      return cursorIndex
    } catch (error) {
      console.error('Error getting cursor index:', error)
      throw new Error('Error getting cursor index')
    }
  }

  const shiftCursor = () =>
    setCharObjArray(
      charObjArray.map((obj, index) => ({
        ...obj,
        highlighted: index === getCursorIndex() + 1,
      }))
    )

  const updateFunc = async (typedStatus: TypedStatus, cursorIndex: number) => {
    setCharObjArray(
      charObjArray.map((obj: CharacterProps, index: number) => {
        if (index === cursorIndex) {
          obj.typedStatus = typedStatus
        }
        return obj
      })
    )
  }

  // if (cursorIndex === charObjArray.length - 1) {
  //   setCharObjArray(strToCharObjArray(await fetchNewString()))
  // }

  const updateCharObjArray = async (key: string): Promise<void> => {
    try {
      const cursorIndex = getCursorIndex()

      const highlightedCharacter = charObjArray[cursorIndex]
      const typedStatus = highlightedCharacter.char === key ? TypedStatus.HIT : TypedStatus.MISS
      const lastTypedStatus = highlightedCharacter.typedStatus

      if (typedStatus === TypedStatus.HIT) {
        if (lastTypedStatus === TypedStatus.NONE) {
          // await updateStats(typedStatus, lastTypedStatus, cursorIndex)
          await updateFunc(TypedStatus.HIT, cursorIndex)
        }
        shiftCursor()
        if (cursorIndex === charObjArray.length - 1) {
          const newString = await fetchNewString()
          setCharObjArray(strToCharObjArray(newString ?? ''))
        }
      } else if (typedStatus === TypedStatus.MISS) {
        if (lastTypedStatus === TypedStatus.NONE) {
          // await updateStats(typedStatus, lastTypedStatus, cursorIndex)
          await updateFunc(TypedStatus.MISS, cursorIndex)
        }
      }
    } catch (error) {
      console.error('updateCharObjArray failed:', error)
      throw new Error('Error updating charObjArray')
    }
  }

  const handleNormalKeyPress = async (key: string) => {
    try {
      await updateCharObjArray(key)

      // update charObjArray
      // updateCharObjArray(key, cursorIndex)
    } catch (error) {
      console.error('Error handling normal key press:', error)
      throw new Error('Error handling normal key press')
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    const key = e.key

    try {
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

  // const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
  //   setCharObjArray(strToCharObjArray(await fetchNewString()))
  //   console.log('Clicked:', e.currentTarget)
  // }

  return (
    <div
      className="w-fit focus:outline outline-black whitespace-pre-wrap"
      onKeyDown={(e) => handleKeyDown(e)}
      id="typing-widget-text"
      data-testid="typing-widget-text"
      tabIndex={0}
    >
      {charObjArray
        // .slice(spaceIndex, Object.values(charObjArray).length)
        .map((characterProps, index) => (
          <Character {...characterProps} fontSettings={fontSettings} key={index} />
        ))}
    </div>
  )
}
