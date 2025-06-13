interface StopWatchProps {
  time: number // time in milliseconds
}

export const StopWatch = ({ time }: StopWatchProps) => {
  const totalSeconds = time / 1000
  const seconds = totalSeconds % 60 // Includes decimal part

  return <div className="text-xl font-mono tracking-widest select-none">{seconds.toFixed(1)}s</div>
}
