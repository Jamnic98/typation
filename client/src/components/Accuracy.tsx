export interface AccuracyProps {
  accuracy: number
}

export const Accuracy = ({ accuracy }: AccuracyProps) => {
  return (
    <div data-testid="accuracy" className="text-xl font-mono tracking-widest select-none">
      accuracy:{accuracy}%
    </div>
  )
}
