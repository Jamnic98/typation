import { useEffect, useState } from 'react'

import { TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { defaultFontSettings } from 'utils/constants'
import { type FontSettings } from 'types/global'
// import { fetchNewString } from 'api/textGeneration'

// const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
// const CHAR_ARRAY = (' ' + ALPHABET).split('')

// create an array of all possible char pair combinations from CHAR_ARRAY
// const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
//   return CHAR_ARRAY.map((char2) => {
//     const charPair = char1 + char2
//     return { charPair, hit: 0, miss: 0 }
//   })textGeneration
// })

// const updateStats = (typedStatus: TypedStatus) => {
//   if (typedStatus === TypedStatus.HIT) {
//   } else if (typedStatus === TypedStatus.MISS) {
//   }
// }

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  const [text, setText] = useState<string | null>(null)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  useEffect(() => {
    if (!text) {
      const fetchText = async () => {
        const newText = await fetchNewString()
        setText(newText)
      }
      fetchText()
    }
  }, [fetchNewString])

  return (
    <div id="typing-widget" data-testid="typing-widget">
      {/* setting for typing widget */}
      <TypingWidgetText
        textToType={text}
        fetchNewString={fetchNewString}
        fontSettings={fontSettings}
      />
    </div>
  )
}
