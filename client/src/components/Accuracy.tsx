export interface AccuracyProps {
  accuracy: number
}

export const Accuracy = ({ accuracy }: AccuracyProps) => {
  return (
    <div className="text-xl font-mono ">
      <span className="text-xl font-mono tracking-widest select-none">accuracy:</span>
      <span>{accuracy}%</span>
    </div>
  )
}
