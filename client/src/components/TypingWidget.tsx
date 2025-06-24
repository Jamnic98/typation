import { useDeferredValue, useEffect, useReducer, useState } from 'react'

import { Accuracy, StopWatch, TypingWidgetText, WordsPerMin, type CharacterProps } from 'components'
import { fetchNewString, saveStats } from 'api'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  AVERAGE_WORD_LENGTH,
  MIN_ELAPSED_TIME_MS,
} from 'utils/constants'
// import { updateStats } from 'utils/helpers'
import { type Action, type State, TypedStatus, type FontSettings } from 'types/global'

const initialState: State = {
  wpm: 0,
  accuracy: 0,
  stopWatchTime: 0,
  runStopWatch: false,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET':
      return initialState
    case 'START':
      return { ...state, runStopWatch: true, stopWatchTime: 0 }
    case 'STOP':
      return { ...state, runStopWatch: false }
    case 'SET_WPM':
      return { ...state, wpm: action.payload }
    case 'SET_ACCURACY':
      return { ...state, accuracy: action.payload }
    case 'TICK':
      return { ...state, stopWatchTime: state.stopWatchTime + 100 }
    default:
      return state
  }
}

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // const [isLoadingText, setIsLoadingText] = useState<boolean>(false)
  const [text, setText] = useState<string | null>(null)
  const [showStats /* setShowStats */] = useState<boolean>(true)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  const deferredWpm = useDeferredValue(state.wpm)
  const deferredAccuracy = useDeferredValue(state.accuracy)

  // Load persisted text from localStorage or fetch new text on mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      setText(savedText)
    } else {
      // If no saved text or completed, fetch a new string
      // setIsLoadingText(true)
      setText(null) // Clear text while fetching
      localStorage.removeItem(LOCAL_STORAGE_TEXT_KEY) // Clear old text
      localStorage.removeItem(LOCAL_STORAGE_COMPLETED_KEY) // Clear completed status
      // Get new text
      const getText = async () => {
        const newText = await fetchNewString()
        setText(newText)
        localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
        localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
      }
      getText()
    }
  }, [])

  // Stopwatch interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (state.runStopWatch) {
      intervalId = setInterval(() => dispatch({ type: 'TICK' }), 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [state.runStopWatch])

  const reset = () => {
    dispatch({ type: 'RESET' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  const onStart = () => {
    dispatch({ type: 'RESET' })
    dispatch({ type: 'START' })
  }

  const onType = (
    charObjArray: CharacterProps[],
    // TODO: remove or update
    // typedStatus: TypedStatus,
    cursorIndex: number
  ) => {
    updateAccuracy(charObjArray, cursorIndex)
    updateWpm(charObjArray, cursorIndex)
  }

  const onComplete = async () => {
    // setShowStats(true)
    saveStats({
      wpm: deferredWpm,
      accuracy: deferredAccuracy,
      time: Number.parseFloat((state.stopWatchTime / 1000).toFixed(1)),
    })
    dispatch({ type: 'STOP' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')

    const newText = await fetchNewString()
    setText(newText)

    // Save new text and reset 'text completed' flag
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

    dispatch({ type: 'SET_ACCURACY', payload: Math.round(accuracy) })
  }

  const updateWpm = (charObjArray: CharacterProps[], cursorIndex: number) => {
    const elapsedTime = state.stopWatchTime || 1 // Avoid divide by zero
    const correctChars = charObjArray
      .slice(0, cursorIndex + 1)
      .reduce((count, char) => count + (char.typedStatus !== TypedStatus.MISS ? 1 : 0), 0)

    const safeElapsedTime = Math.max(elapsedTime, MIN_ELAPSED_TIME_MS)
    const minutesElapsed = safeElapsedTime / (60 * 1000)

    const wordsTyped = correctChars / AVERAGE_WORD_LENGTH

    dispatch({ type: 'SET_WPM', payload: Math.round(wordsTyped / minutesElapsed) })
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
          <StopWatch time={state.stopWatchTime} />
        </div>
      ) : null}
    </div>
  ) : null
}
