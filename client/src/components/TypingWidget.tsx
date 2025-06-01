import { useEffect, useState } from 'react'

import { Accuracy, CharacterProps, TypingWidgetText, WordsPerMin } from 'components'
import { fetchNewString, updateStats } from 'api'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
} from 'utils/constants'
import { TypedStatus, type FontSettings } from 'types/global'

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  const [wpm, setWpm] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [text, setText] = useState<string | null>(null)
  const [runStopWatch, setRunStopWatch] = useState<boolean>(false)
  const [stopWatchTime, setStopWatchTime] = useState<number>(0)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  // Load persisted text from localStorage or fetch new text on mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      setText(savedText)
    } else {
      const fetchText = async () => {
        const newText = await fetchNewString()
        setText(newText)
        localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
        localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
      }
      fetchText()
    }
  }, [])

  // Stopwatch interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (runStopWatch) {
      intervalId = setInterval(() => setStopWatchTime((prev) => prev + 100), 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [runStopWatch])

  const reset = () => {
    setWpm(0)
    setAccuracy(0)
    setStopWatchTime(0)
    setShowStats(false)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  const onStart = () => {
    reset()
    setRunStopWatch(true)
  }

  const onType = (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => {
    updateStats(charObjArray, typedStatus, cursorIndex)
    updateAccuracy(charObjArray, cursorIndex)
    updateWpm(charObjArray, cursorIndex)
  }

  const onComplete = async () => {
    setRunStopWatch(false)
    setShowStats(true)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')

    const newText = await fetchNewString()
    setText(newText)

    // Save new text and reset completion
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  const updateAccuracy = (charObjArray: CharacterProps[], cursorIndex: number) => {
    const typedChars = charObjArray.slice(0, cursorIndex + 1)
    const correctChars = typedChars.reduce(
      (count, char) => count + (char.typedStatus !== TypedStatus.MISS ? 1 : 0),
      0
    )

    const totalTyped = cursorIndex + 1
    const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0

    setAccuracy(Math.round(accuracy))
  }

  const updateWpm = (charObjArray: CharacterProps[], cursorIndex: number) => {
    if (stopWatchTime === 0) return setWpm(0)

    const correctChars = charObjArray
      .slice(0, cursorIndex + 1)
      .reduce((count, char) => count + (char.typedStatus !== TypedStatus.MISS ? 1 : 0), 0)

    const minutesElapsed = stopWatchTime / 60000
    const wordsTyped = correctChars / 5
    const wpm = Math.round(wordsTyped / minutesElapsed)

    setWpm(wpm)
  }

  return (
    <div id="typing-widget" data-testid="typing-widget">
      <div className="w-full">
        <TypingWidgetText
          onStart={onStart}
          onComplete={onComplete}
          onType={onType}
          reset={reset}
          textToType={text}
          fontSettings={fontSettings}
        />
      </div>
      <br />
      {showStats ? (
        <div className="flex justify-between space-x-4">
          <WordsPerMin wpm={wpm} />
          <Accuracy accuracy={accuracy} />
        </div>
      ) : null}
    </div>
  )
}
