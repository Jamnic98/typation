import { TypingWidgetText } from './TypingWidgetText'
import { CharacterProps } from './Character'
import { useState } from 'react'

// const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
// const CHAR_ARRAY = (' ' + ALPHABET).split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
// const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
//   return CHAR_ARRAY.map((char2) => {
//     const charPair = char1 + char2
//     return { charPair, hit: 0, miss: 0 }
//   })
// })

const strToCharObjArray = (string: string) =>
  string.split('').map((char, index) => ({
    char,
    // typedStatus: TypedStatus.NONE,
    highlighted: index === 0,
  }))

const updateStats = (typedStatus: TypedStatus) => {
  if (typedStatus === TypedStatus.HIT) {
  } else if (typedStatus === TypedStatus.MISS) {
  }
}

enum TypedStatus {
  HIT = 'hit',
  MISS = 'miss',
  NONE = 'none',
}

export interface TypingWidgetProps {
  textToType: string
}

export const TypingWidget = ({ textToType }: TypingWidgetProps) => {
  const [charObjArray, setCharObjArray] = useState<CharacterProps[]>(strToCharObjArray(textToType))

  const updateCharObjArray = (charObjArray: CharacterProps[], keyPressed: string) => {
    const cursorPosition = getCursorPosition(charObjArray)
    const charArray = charObjArray.map((obj: CharacterProps) => obj.char)
    const typedStatus =
      keyPressed === charArray[cursorPosition] ? TypedStatus.HIT : TypedStatus.MISS
    const currentTypedStatus = charObjArray[cursorPosition].typedStatus || TypedStatus.NONE

    // if the highlighted character has not been typed
    if (currentTypedStatus === TypedStatus.NONE) {
      updateStats(typedStatus)
      if (typedStatus === TypedStatus.HIT) {
        return updateCharObj(charObjArray, TypedStatus.HIT)
      } else if (typedStatus === TypedStatus.MISS) {
        return charObjArray.map((obj: any, index: number) => {
          if (index === cursorPosition) {
            obj.typedStatus = TypedStatus.MISS
          }
          return obj
        })
      }
    } else if (typedStatus === TypedStatus.HIT) {
      return updateCharObj(charObjArray, TypedStatus.HIT)
    }
    return charObjArray
  }

  const updateCharObj = async (charObjArray: CharacterProps[], typedStatus: TypedStatus) => {
    const cursorPosition = getCursorPosition(charObjArray)
    if (cursorPosition === charObjArray.length - 1) {
      return strToCharObjArray('test' /* await getNewString() */)
    } else {
      return charObjArray.map((obj: any, index: number) => {
        obj.highlighted = index === cursorPosition + 1
        if (index === cursorPosition) {
          obj.typedStatus = typedStatus
        }
        return obj
      })
    }
  }

  const getCursorPosition = (charObjArray: CharacterProps[]) => {
    return charObjArray
      .map((charObj) => {
        return charObj.highlighted
      })
      .indexOf(true)
  }

  const handleKeyPressed = async (e: any) => {
    const updatedCharObjArray = await updateCharObjArray(charObjArray, e.key)
    setCharObjArray(updatedCharObjArray)
  }

  return (
    <div
      id="typing-widget"
      data-testid="typing-widget"
      tabIndex={0}
      onKeyDown={(e) => handleKeyPressed(e)}
      className="focus:outline outline-black"
    >
      <TypingWidgetText displayText={strToCharObjArray(textToType)} />
    </div>
  )
}
