import { useEffect, useState } from 'react'

import { CharacterProps, /* StopWatch, */ TypingWidgetText } from 'components'
import { fetchNewString } from 'api/textGeneration'
import { defaultFontSettings } from 'utils/constants'
import { TypedStatus, type FontSettings } from 'types/global'
import { Accuracy } from 'components/Accuracy'

import { WordsPerMin } from 'components/WordsPerMin'
import { updateStats } from 'api/userStatistics'

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  const [wpm, setWpm] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [text, setText] = useState<string | null>(null)
  const [runStopWatch, setRunStopWatch] = useState<boolean>(false)
  const [stopWatchTime, setStopWatchTime] = useState<number>(0)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (runStopWatch) {
      intervalId = setInterval(() => {
        setStopWatchTime((prev) => prev + 1)
      }, 10)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [runStopWatch])

  useEffect(() => {
    if (!text) {
      const fetchText = async () => {
        const newText = await fetchNewString()
        setText(newText)
      }
      fetchText()
    }
  }, [fetchNewString])

  const onStart = async () => {
    setWpm(0)
    setAccuracy(0)
    setStopWatchTime(0)
    setShowStats(false)
    setRunStopWatch(true)
  }

  const onType = async (
    charObjArray: CharacterProps[],
    typedStatus: TypedStatus,
    cursorIndex: number
  ) => {
    await updateStats(charObjArray, typedStatus, cursorIndex)
    await updateAccuracy(charObjArray, cursorIndex)
    await updateWpm(charObjArray, cursorIndex)
  }

  const onComplete = async () => {
    setRunStopWatch(false)
    setShowStats(true)
    setText(await fetchNewString())
  }

  const updateAccuracy = async (charObjArray: CharacterProps[], cursorIndex: number) => {
    const correctChars = charObjArray
      .slice(0, cursorIndex + 1)
      .reduce((count, char) => count + (char.typedStatus === TypedStatus.MISS ? 0 : 1), 0)

    const totalTyped = cursorIndex + 1
    const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0

    setAccuracy(Math.round(accuracy))
  }

  const updateWpm = async (
    charObjArray: CharacterProps[],
    cursorIndex: number
    // stopWatchTime: number,
    // setWpm: (wpm: number) => void
  ) => {
    if (stopWatchTime === 0) {
      setWpm(0)
      return
    }

    const correctChars = charObjArray
      .slice(0, cursorIndex + 1)
      .reduce((count, char) => count + (char.typedStatus !== TypedStatus.MISS ? 1 : 0), 0)

    const minutesElapsed = stopWatchTime / 6000 // because 6000 units = 60 seconds
    const wordsTyped = correctChars / 5
    const wpm = Math.round(wordsTyped / minutesElapsed)

    setWpm(wpm)
  }

  return (
    <div id="typing-widget" data-testid="typing-widget">
      {/* setting for typing widget */}
      <div className="w-full">
        <TypingWidgetText
          onStart={onStart}
          onComplete={onComplete}
          onType={onType}
          textToType={text}
          fontSettings={fontSettings}
        />
      </div>
      {/* TODO: Remove br */}
      {showStats ? (
        <>
          {/* <br />
          <div>
            <StopWatch time={stopWatchTime} />
          </div> */}
          {/* TODO: Remove br */}
          <br />
          <div>
            <Accuracy accuracy={accuracy} />
          </div>
          <br />
          <div>
            <WordsPerMin wpm={wpm} />
          </div>
        </>
      ) : null}
    </div>
  )
}
