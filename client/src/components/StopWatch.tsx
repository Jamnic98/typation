import { useState, useEffect } from 'react'

export const StopWatch = () => {
  // state to store time
  const [time, setTime] = useState(0)

  // state to check stopwatch running or not
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let intervalId: any
    if (isRunning) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10)
    }
    return () => clearInterval(intervalId)
  }, [isRunning, time])

  // Hours calculation
  const hours = Math.floor(time / 360000)

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000)

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100)

  // Milliseconds calculation
  const milliseconds = time % 100

  // Method to start and stop timer
  const startAndStop = () => {
    setIsRunning(!isRunning)
  }

  // Method to reset timer back to 0
  const reset = () => setTime(0)

  return (
    <div className="flex flex-col items-center  p-6 w-64">
      <p className="text-4xl font-mono tracking-widest mb-6 select-none">
        {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}:
        {milliseconds.toString().padStart(2, '0')}
      </p>
      <div className="flex space-x-4">
        <button
          className={`cursor-pointer px-6 py-2 rounded-md font-semibold transition-colors duration-200 ${
            isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white shadow-md`}
          onClick={startAndStop}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          className={`${time === 0 ? 'disabled:' : 'hover:bg-gray-600 cursor-pointer'} px-6 py-2 rounded-md bg-gray-700  text-white font-semibold shadow-md transition-colors duration-200`}
          onClick={reset}
          disabled={time === 0}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
