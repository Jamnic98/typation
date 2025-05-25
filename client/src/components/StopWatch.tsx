interface StopWatchProps {
  time: number
}

export const StopWatch = ({ time }: StopWatchProps) => {
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
