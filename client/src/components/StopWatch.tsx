interface StopWatchProps {
  time: number
}

export const StopWatch = ({ time }: StopWatchProps) => (
  <div className="text-xl font-mono tracking-widest select-none">{(time / 1000).toFixed(2)}s</div>
)
