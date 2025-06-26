import { useEffect, useReducer, useRef, useState } from 'react'

import { Accuracy, StopWatch, TypingWidgetText, WordsPerMin, type CharacterProps } from 'components'
import { fetchNewString, saveStats } from 'api'
import { type FontSettings } from 'types/global'
import { calculateAccuracy, calculateWpm, typingWidgetStateReducer } from 'utils/helpers'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
} from 'utils/constants'

export const TypingWidget = () => {
  const startTimestamp = useRef<number>(0)
  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)
  const [showStats /* setShowStats */] = useState<boolean>(true)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  // Load persisted text from localStorage or fetch new text on mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    try {
      if (savedText && completed === 'false') {
        dispatch({ type: 'SET_TEXT', payload: savedText })
      } else {
        // If no saved text or completed, fetch a new string
        // setIsLoadingText(true)
        localStorage.removeItem(LOCAL_STORAGE_TEXT_KEY) // Clear old text
        localStorage.removeItem(LOCAL_STORAGE_COMPLETED_KEY) // Clear completed status
        // Get new text
        const getText = async () => {
          const newText = await fetchNewString()
          dispatch({ type: 'SET_TEXT', payload: newText })
          localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
          localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
        }
        getText()
      }
    } catch (error) {
      console.error('Error loading text from localStorage:', error)
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
    dispatch({ type: 'RESET_SESSION' })
    startTimestamp.current = 0
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  const onStart = () => {
    reset()
    startTimestamp.current = Date.now()
    dispatch({ type: 'START' })
  }

  const onType = (charObjArray: CharacterProps[]) => {
    if (!state.text) return

    const typedText = charObjArray.map((obj) => obj.char).join('')
    updateAccuracy(state.text, typedText)
    updateWpm(state.text, typedText)
  }

  const onComplete = async (charObjArray: CharacterProps[]) => {
    if (!state.text) return
    dispatch({ type: 'STOP' })

    const typedText = charObjArray.map((obj) => obj.char).join('')

    const now = Date.now()
    const elapsedTime = startTimestamp ? now - startTimestamp.current : state.stopWatchTime

    // Update reducer time so UI matches final elapsedTime
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const latestWpm = calculateWpm(state.text, typedText, elapsedTime)
    const latestAccuracy = calculateAccuracy(state.text, typedText)

    dispatch({ type: 'SET_WPM', payload: latestWpm })
    dispatch({ type: 'SET_ACCURACY', payload: latestAccuracy })

    saveStats({
      wpm: latestWpm,
      accuracy: latestAccuracy,
      startTime: startTimestamp.current,
    })

    const newText = await fetchNewString()
    dispatch({ type: 'SET_TEXT', payload: newText })
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

  return state.text ? (
    <div id="typing-widget" data-testid="typing-widget">
      <TypingWidgetText
        // key={text}
        onStart={onStart}
        onComplete={onComplete}
        onType={onType}
        reset={reset}
        textToType={state.text}
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
