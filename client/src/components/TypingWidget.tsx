import { useEffect, useState } from 'react'

import { TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { defaultFontSettings } from 'utils/constants'
import { /* TypedStatus,  */ type FontSettings } from 'types/global'

// create an array of all possible char pair combinations from CHAR_ARRAY
// const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) =>
//   CHAR_ARRAY.map((char2) => {
//     const charPair = char1 + char2
//     return { charPair, hit: 0, miss: 0 }
//   })
// )

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

  const onStart = () => {}

  const onComplete = () => {}

  return (
    <div id="typing-widget" data-testid="typing-widget">
      {/* setting for typing widget */}
      <TypingWidgetText
        onStart={onStart}
        onComplete={onComplete}
        textToType={text}
        fetchNewString={fetchNewString}
        fontSettings={fontSettings}
      />
    </div>
  )
}
