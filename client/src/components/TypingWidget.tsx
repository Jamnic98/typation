import { useEffect, useState } from 'react'

import { TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { CHAR_ARRAY_PAIRS, defaultFontSettings } from 'utils/constants'
import { /* TypedStatus,  */ type FontSettings } from 'types/global'

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
