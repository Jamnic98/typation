import { useEffect, useReducer, useState } from 'react'

import { Accuracy, StopWatch, TypingWidgetText, WordsPerMin, type CharacterProps } from 'components'
import { fetchNewString, saveStats } from 'api'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
} from 'utils/constants'
import { type Action, type State, type FontSettings } from 'types/global'
import { calculateAccuracy, calculateWpm } from 'utils/helpers'

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
      return { ...state, stopWatchTime: state.stopWatchTime + 10 }
    case 'SET_STOPWATCH_TIME':
      return { ...state, stopWatchTime: action.payload }
    default:
      return state
  }
}

export interface TypingWidgetProps {}

export const TypingWidget = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // const [isLoadingText, setIsLoadingText] = useState<boolean>(false)
  const [text, setText] = useState<string>('')
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null)
  const [showStats /* setShowStats */] = useState<boolean>(true)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  // Load persisted text from localStorage or fetch new text on mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      setText(savedText)
    } else {
      // If no saved text or completed, fetch a new string
      // setIsLoadingText(true)
      setText('') // Clear text while fetching
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
      intervalId = setInterval(() => dispatch({ type: 'TICK' }), 10)
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
    reset()
    setStartTimestamp(Date.now())
    dispatch({ type: 'START' })
  }

  const onType = (charObjArray: CharacterProps[]) => {
    if (!text) return

    const typedText = charObjArray.map((obj) => obj.char).join('')
    updateAccuracy(text, typedText)
    updateWpm(text, typedText)
  }

  const onComplete = async (charObjArray: CharacterProps[]) => {
    if (!text) return
    dispatch({ type: 'STOP' })

    const typedText = charObjArray.map((obj) => obj.char).join('')

    const now = Date.now()
    const elapsedTime = startTimestamp ? now - startTimestamp : state.stopWatchTime

    // Update reducer time so UI matches final elapsedTime
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const latestWpm = calculateWpm(text, typedText, elapsedTime)
    const latestAccuracy = calculateAccuracy(text, typedText)

    dispatch({ type: 'SET_WPM', payload: latestWpm })
    dispatch({ type: 'SET_ACCURACY', payload: latestAccuracy })

    saveStats({
      wpm: latestWpm,
      accuracy: latestAccuracy,
      time: Number.parseFloat((elapsedTime / 1000).toFixed(2)),
    })

    const newText = await fetchNewString()
    setText(newText)
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')
  }

  const updateAccuracy = (targetText: string, typedText: string) => {
    const accuracy = calculateAccuracy(targetText, typedText)
    dispatch({ type: 'SET_ACCURACY', payload: accuracy })
  }

  const updateWpm = (targetText: string, typedText: string) => {
    const wpm = calculateWpm(targetText, typedText, state.stopWatchTime)
    dispatch({ type: 'SET_WPM', payload: wpm })
  }

  return text ? (
    <div id="typing-widget" data-testid="typing-widget">
      <TypingWidgetText
        // key={text}
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
          <WordsPerMin wpm={state.wpm} />
          <Accuracy accuracy={state.accuracy} />
          <StopWatch time={state.stopWatchTime} />
        </div>
      ) : null}
    </div>
  ) : null
}
