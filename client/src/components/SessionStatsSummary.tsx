import { StopWatch } from './StopWatch'

interface SessionStatsSummaryProps {
  wpm: number
  netWpm: number
  accuracy: number
  rawAccuracy: number
  displayTime: number
}

export const SessionStatsSummary = ({
  wpm,
  netWpm,
  accuracy,
  rawAccuracy,
  displayTime,
}: SessionStatsSummaryProps) => {
  return (
    <div id="session-stats-summary" className="space-y-2 flex flex-col justify-center items-center">
      <div className="text-xl font-mono ">
        <span className="text-xl font-mono tracking-widest select-none">wpm:</span>
        <span>{wpm}</span>
      </div>

      <div className="text-xl font-mono ">
        <span className="text-xl font-mono tracking-widest select-none">net wpm:</span>
        <span>{netWpm}</span>
      </div>

      <div className="text-xl font-mono ">
        <span className="text-xl font-mono tracking-widest select-none">accuracy:</span>
        <span>{accuracy}%</span>
      </div>

      <div className="text-xl font-mono ">
        <span className="text-xl font-mono tracking-widest select-none">raw accuracy:</span>
        <span>{rawAccuracy}%</span>
      </div>

      <StopWatch time={displayTime} />
    </div>
  )
}
