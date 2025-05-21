import { useEffect, useState } from 'react'

import { CharacterProps, TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { defaultFontSettings } from 'utils/constants'
import { TypedStatus, type FontSettings } from 'types/global'

const updateStats = async (
  charObjArray: CharacterProps[],
  typedStatus: TypedStatus,
  cursorIndex: number
) => {
  const char = charObjArray?.[cursorIndex].char
  console.log(char, typedStatus)
}

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

  const onComplete = (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => {
    updateStats(charObjArray, typedStatus, cursorIndex)
  }

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
