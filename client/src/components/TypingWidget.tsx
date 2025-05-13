import { useState } from 'react'

import { CharacterProps, TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { TypedStatus } from 'types'

// const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
// const CHAR_ARRAY = (' ' + ALPHABET).split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
// const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
//   return CHAR_ARRAY.map((char2) => {
//     const charPair = char1 + char2
//     return { charPair, hit: 0, miss: 0 }
//   })textGeneration
// })

const strToCharObjArray = (string: string): CharacterProps[] => {
  return string.split('').map((char, index) => ({
    char,
    typedStatus: TypedStatus.NONE,
    highlighted: index === 0,
  }))
}

// const updateStats = (typedStatus: TypedStatus) => {
//   if (typedStatus === TypedStatus.HIT) {
//   } else if (typedStatus === TypedStatus.MISS) {
//   }
// }

export interface TypingWidgetProps {
  textToType: string
  widgetSettings?: {
    spaceSymbol: string
    highlightColor: string
    textColor: string
    backgroundColor: string
    fontSize: string
    fontFamily: string
    fontWeight: string
    textAlign: string
    textDecoration: string
    textTransform: string
    textShadow: string
    textOverflow: string
    textIndent: string
    textJustify: string
    textLineHeight: string
    textLetterSpacing: string
    textWordSpacing: string
  }
}

export const TypingWidget = ({ textToType }: TypingWidgetProps) => {
  const [charObjArray, setCharObjArray] = useState<CharacterProps[]>(strToCharObjArray(textToType))

  const getCursorIndex = (charObjArray: CharacterProps[]) =>
    charObjArray.map((charObj) => charObj.highlighted).indexOf(true)

  const updateCharObjArray = (keyPressed: string) => {
    const cursorIndex = getCursorIndex(charObjArray)
    const charArray = charObjArray.map((obj: CharacterProps) => obj.char)

    const typedStatus = keyPressed === charArray[cursorIndex] ? TypedStatus.HIT : TypedStatus.MISS

    const currentTypedStatus = charObjArray[cursorIndex].typedStatus

    if (currentTypedStatus === TypedStatus.NONE) {
      // updateStats(typedStatus)
      if (typedStatus === TypedStatus.HIT) {
        return updateCharObj(TypedStatus.HIT, cursorIndex)
      } else if (typedStatus === TypedStatus.MISS) {
        return charObjArray.map((obj: CharacterProps, index: number) => {
          if (index === cursorIndex) {
            obj.typedStatus = TypedStatus.MISS
          }
          return obj
        })
      }
    } else if (currentTypedStatus === TypedStatus.MISS) {
      // updateCharObj(typedStatus, cursorIndex)
      // handle incorrect key press update
      if (typedStatus === TypedStatus.HIT) {
        return updateCharObj(TypedStatus.MISS, cursorIndex)
      } else if (typedStatus === TypedStatus.MISS) {
        return charObjArray.map((obj: CharacterProps, index: number) => {
          if (index === cursorIndex) {
            obj.typedStatus = TypedStatus.MISS
          }
          return obj
        })
      }
    }

    return charObjArray
  }

  const shiftCursor = (charObjArray: CharacterProps[]): CharacterProps[] => {
    const cursorIndex = getCursorIndex(charObjArray)
    return charObjArray.map((obj, index) => ({
      ...obj,
      highlighted: index === cursorIndex + 1,
    }))
  }

  const updateCharObj = async (typedStatus: TypedStatus, cursorIndex: number) => {
    try {
      if (cursorIndex === charObjArray.length - 1) {
        return strToCharObjArray(await fetchNewString())
      }

      return shiftCursor(charObjArray).map((obj: CharacterProps, index: number) => {
        obj.highlighted = index === cursorIndex + 1
        if (index === cursorIndex) {
          obj.typedStatus = typedStatus
        }
        return obj
      })
    } catch (error) {
      throw new Error('Error fetching new string')
    }
  }

  const handleKeyPressed = async ({ key }: React.KeyboardEvent<HTMLElement>) => {
    try {
      if (key === 'Backspace') {
        // handle backspace
      } else if (key === 'Shift') {
        // handle shift
      } else {
        setCharObjArray(await updateCharObjArray(key))
      }
    } catch (error) {
      console.error('Error updating charObjArray:', error)
    }
  }

  return (
    <div
      id="typing-widget"
      data-testid="typing-widget"
      tabIndex={0}
      onKeyDown={(e) => handleKeyPressed(e)}
      className="focus:outline outline-black"
    >
      <TypingWidgetText displayText={charObjArray} />
    </div>
  )
}
