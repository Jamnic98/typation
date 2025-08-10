import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  sessions: {
    startTime: number // timestamp
    wpm: number | null
    accuracy: number | null
  }[]
}

export const TestGraph = ({ sessions }: Props) => {
  const data = sessions.map((s) => ({
    timestamp: s.startTime * 1000, // full timestamp (milliseconds)
    wpm: s.wpm ?? 0,
    accuracy: s.accuracy ? Math.round(s.accuracy * 100) / 100 : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
        <YAxis />
        <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
        <Legend />
        <Line type="monotone" dataKey="wpm" stroke="#8884d8" strokeWidth={2} />
        <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
