import { useDeferredValue, useEffect, useState } from 'react'

import { Accuracy, CharacterProps, StopWatch, TypingWidgetText, WordsPerMin } from 'components'
import { fetchNewString, updateStats } from 'api'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  AVERAGE_WORD_LENGTH,
} from 'utils/constants'
import { TypedStatus, type FontSettings } from 'types/global'

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  // const [isLoadingText, setIsLoadingText] = useState<boolean>(false)
  const [wpm, setWpm] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [showStats, setShowStats] = useState<boolean>(true)
  const [text, setText] = useState<string | null>(null)
  const [runStopWatch, setRunStopWatch] = useState<boolean>(false)
  const [stopWatchTime, setStopWatchTime] = useState<number>(0)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  const deferredWpm = useDeferredValue(wpm)
  const deferredAccuracy = useDeferredValue(accuracy)

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
    setRunStopWatch(false)
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

    const minutesElapsed = stopWatchTime / (60 * 1000)
    const wordsTyped = correctChars / AVERAGE_WORD_LENGTH

    setWpm(Math.round(wordsTyped / minutesElapsed))
  }

  return text ? (
    <div id="typing-widget" data-testid="typing-widget">
      <TypingWidgetText
        onStart={onStart}
        onComplete={onComplete}
        onType={onType}
        reset={reset}
        textToType={text}
        fontSettings={fontSettings}
      />
      <br />
      {showStats ? (
        <div id="stats" className="space-y-4">
          <WordsPerMin wpm={deferredWpm} />
          <Accuracy accuracy={deferredAccuracy} />
          <StopWatch time={stopWatchTime} />
        </div>
      ) : null}
    </div>
  ) : null
}
