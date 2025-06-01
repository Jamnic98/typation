interface StopWatchProps {
  time: number // time in milliseconds
}

export const StopWatch = ({ time }: StopWatchProps) => {
  const totalSeconds = Math.floor(time / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60

  // Safety: reset to 0 if seconds somehow rounds to 60
  if (seconds === 60) {
    seconds = 0
  }

  return (
    <div className="text-xl font-mono tracking-widest select-none">
      {minutes > 0 ? (
        <>
          {minutes}:{seconds.toString().padStart(2, '0')}s
        </>
      ) : (
        <>{seconds}s</>
      )}
    </div>
  )
}
