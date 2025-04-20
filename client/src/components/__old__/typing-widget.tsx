// import { useState } from 'react'
import TypingWidgetText from './typing-widget-text.js'
import './typing-widget.css'

// const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
// const CHAR_ARRAY = (' ' + ALPHABET).split('')
// create an array of all possible char pair combinations from CHAR_ARRAY
// const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
//   return CHAR_ARRAY.map((char2) => {
//     const charPair = char1 + char2
//     return { charPair, hit: 0, miss: 0 }
//   })
// })

// enum TypedStatus {
//   HIT = 'hit',
//   MISS = 'miss',
//   NONE = 'none',
// }

const TypingWidget = () => {
  // const [, /* charObjArray */ setCharObjArray] = useState([])

  // const updateStats = (typedStatus: TypedStatus) => {
  //   if (typedStatus === TypedStatus.HIT) {
  //   } else if (typedStatus === TypedStatus.MISS) {
  //   }
  // }

  // const updateCharObjArray = (charObjArray: any[], keyPressed: string) => {
  //   const cursorPosition = getCursorPosition(charObjArray)
  //   const charArray = charObjArray.map((obj: any) => obj.character)
  //   const typedStatus =
  //     keyPressed === charArray[cursorPosition] ? TypedStatus.HIT : TypedStatus.MISS
  //   const currentTypedStatus = charObjArray[cursorPosition].typedStatus

  //   // if the highlighted character has not been typed
  //   if (currentTypedStatus === TypedStatus.NONE) {
  //     updateStats(typedStatus)
  //     if (typedStatus === TypedStatus.HIT) {
  //       return updateCharObj(charObjArray, cursorPosition, TypedStatus.HIT)
  //     } else if (typedStatus === TypedStatus.MISS) {
  //       return charObjArray.map((obj: any, index: number) => {
  //         if (index === cursorPosition) {
  //           obj.typedStatus = TypedStatus.MISS
  //         }
  //         return obj
  //       })
  //     }
  //   } else if (currentTypedStatus === TypedStatus.MISS) {
  //     if (typedStatus === TypedStatus.HIT) {
  //       return updateCharObj(charObjArray, cursorPosition, TypedStatus.MISS)
  //     }
  //   }
  //   return charObjArray
  // }

  // const updateCharObj = async (
  //   charObjArray: any[],
  //   cursorPosition: number,
  //   typedStatus: TypedStatus
  // ) => {
  //   if (cursorPosition === charObjArray.length - 1) {
  //     return strToCharObjArray(await getNewString())
  //   } else {
  //     return charObjArray.map((obj: any, index: number) => {
  //       obj.highlighted = index === cursorPosition + 1
  //       if (index === cursorPosition) {
  //         obj.typedStatus = typedStatus
  //       }
  //       return obj
  //     })
  //   }
  // }

  // const getNewString = async () => {
  //   return 'the quick brown fox jumps over the lazy dog'
  // }

  // const strToCharObjArray = useCallback((string: string) => {
  //   return string.split('').map((character, index) => {
  //     return {
  //       character,
  //       typedStatus: TypedStatus.NONE,
  //       highlighted: index === 0,
  //     }
  //   })
  // }, [])

  // const getCursorPosition = useCallback((charObjArray: any[]) => {
  //   return charObjArray
  //     .map((charObj) => {
  //       return charObj.highlighted
  //     })
  //     .indexOf(true)
  // }, [])

  // const handleKeyPressed = async (e) => {
  //   const { key: keyPressed } = e
  //   if (CHAR_ARRAY.indexOf(keyPressed) !== -1) {
  //     setCharObjArray([])
  //   }
  // }

  return (
    <div id="typing-widget" tabIndex={0} /*  onKeyDown={(e) => handleKeyPressed(e)} */>
      <TypingWidgetText /* displayText={charObjArray} */ />
    </div>
  )
}

export default TypingWidget
