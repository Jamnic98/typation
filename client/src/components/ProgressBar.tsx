export const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="h-full bg-blue-500" style={{ width: `${100 - progress * 100}%` }} />
)
