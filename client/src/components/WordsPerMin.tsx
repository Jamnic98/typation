import { useEffect } from 'react'

interface WordsPerMinProps {
  time: number
  setTime: (time: number) => void
  isRunning: boolean
  start?: () => void
  stop?: () => void
  reset?: () => void
}

export const WordsPerMin = ({
  time,
  setTime,
  isRunning /* , start, stop, reset */,
}: WordsPerMinProps) => {
  useEffect(() => {
    let intervalId: any
    if (isRunning) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10)
    }
    return () => clearInterval(intervalId)
  }, [isRunning, time])

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000)

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100)

  // Milliseconds calculation
  const milliseconds = time % 100

  // // Method to start and stop timer
  // const startAndStop = () => {
  //   setIsRunning(!isRunning)
  // }

  return (
    <div className="text-xl font-mono tracking-widest select-none">
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}:
      {milliseconds.toString().padStart(2, '0')}
    </div>
  )
}
