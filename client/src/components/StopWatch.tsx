interface StopWatchProps {
  time: number
}

export const StopWatch = ({ time }: StopWatchProps) => {
  const secondsWithHundredths = (time / 1000).toFixed(2)

  return (
    <div className="text-xl font-mono tracking-widest select-none">{secondsWithHundredths}s</div>
  )
}
