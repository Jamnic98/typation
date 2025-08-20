import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  sessions: {
    startTime: number
    correctCharsTyped: number
    errorCharCount: number
    deletedCharCount: number
  }[]
}

export const KeystrokesBreakdownChart = ({ sessions }: Props) => {
  const data = sessions.map((s) => ({
    timestamp: s.startTime * 1000,
    Correct: s.correctCharsTyped,
    Errors: s.errorCharCount,
    Deleted: s.deletedCharCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
        <YAxis />
        <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
        <Legend />
        <Bar dataKey="Correct" stackId="a" fill="#4CAF50" />
        <Bar dataKey="Deleted" stackId="a" fill="#FFA500" />
        <Bar dataKey="Errors" stackId="a" fill="#FF4136" />
      </BarChart>
    </ResponsiveContainer>
  )
}
