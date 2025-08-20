import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type TypingSessionStats = {
  correctedCharCount: number
  deletedCharCount: number
  errorCharCount: number
}

type Props = {
  sessions: TypingSessionStats[]
}

const COLORS = ['#0088FE', '#FFA500', '#FF4136']

export const ErrorDistributionPieChart: React.FC<Props> = ({ sessions }) => {
  // Aggregate totals (use 0 as default if any field is missing)
  const totalCorrected = sessions.reduce((acc, s) => acc + (s.correctedCharCount ?? 0), 0)
  const totalDeleted = sessions.reduce((acc, s) => acc + (s.deletedCharCount ?? 0), 0)
  const totalUncorrected = sessions.reduce((acc, s) => acc + (s.errorCharCount ?? 0), 0)

  const total = totalCorrected + totalDeleted + totalUncorrected

  // If there's no data, render a friendly placeholder
  if (total === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-gray-500">
        No error data to display
      </div>
    )
  }

  const data = [
    { name: 'Corrected Errors', value: totalCorrected },
    { name: 'Deleted Errors', value: totalDeleted },
    { name: 'Uncorrected Errors', value: totalUncorrected },
  ]

  // Tooltip formatter: show raw value and percent of total
  const tooltipFormatter = (value: number) => {
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
    return `${value} (${pct}%)`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
