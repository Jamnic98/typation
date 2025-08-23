import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  sessions: {
    startTime: number
    wpm: number | null
    netWpm: number | null
    accuracy: number | null
    rawAccuracy: number | null
  }[]
}

export const SessionPerformance = ({ sessions }: Props) => {
  const data = sessions.map((s) => ({
    timestamp: s.startTime * 1000,
    wpm: s.wpm ?? 0,
    netWpm: s.netWpm ?? 0,
    accuracy: s.accuracy ? Math.round(s.accuracy * 100) / 100 : 0,
    rawAccuracy: s.rawAccuracy ? Math.round(s.rawAccuracy * 100) / 100 : 0,
  }))

  const [visible, setVisible] = useState({
    wpm: true,
    netWpm: true,
    accuracy: true,
    rawAccuracy: true,
  })

  const toggleLine = (key: keyof typeof visible) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      {/* ✅ Custom grouped legend */}
      <div className="flex flex-col gap-2 mb-3 text-sm">
        <div className="flex gap-6">
          <span className="font-medium text-neutral-600 w-16">Speed:</span>
          <ul className="flex gap-4">
            {[
              { key: 'wpm', label: 'WPM', color: '#8884d8' },
              { key: 'netWpm', label: 'Net WPM', color: '#f42424' },
            ].map(({ key, label, color }) => {
              const active = visible[key as keyof typeof visible]
              return (
                <li
                  key={key}
                  onClick={() => toggleLine(key as keyof typeof visible)}
                  className={`cursor-pointer flex items-center gap-1 select-none ${
                    active ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
                  />
                  {label}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="flex gap-6">
          <span className="font-medium text-neutral-600 w-16">Accuracy:</span>
          <ul className="flex gap-4">
            {[
              { key: 'accuracy', label: 'Accuracy', color: '#16a34a' },
              { key: 'rawAccuracy', label: 'Raw Accuracy', color: '#a21caf' },
            ].map(({ key, label, color }) => {
              const active = visible[key as keyof typeof visible]
              return (
                <li
                  key={key}
                  onClick={() => toggleLine(key as keyof typeof visible)}
                  className={`cursor-pointer flex items-center gap-1 select-none ${
                    active ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
                  />
                  {label}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
          <YAxis />
          <Tooltip
            labelFormatter={(ts) => new Date(ts).toLocaleString()}
            formatter={(value, name) => {
              if (name === 'wpm') return [value, 'WPM']
              if (name === 'netWpm') return [value, 'Net WPM']
              if (name === 'accuracy') return [`${value}%`, 'Accuracy']
              if (name === 'rawAccuracy') return [`${value}%`, 'Raw Accuracy']
              return [value, name]
            }}
          />

          {visible.wpm && <Line type="monotone" dataKey="wpm" stroke="#8884d8" strokeWidth={2} />}
          {visible.netWpm && (
            <Line type="monotone" dataKey="netWpm" stroke="#f42424" strokeWidth={2} />
          )}
          {visible.accuracy && (
            <Line type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} />
          )}
          {visible.rawAccuracy && (
            <Line type="monotone" dataKey="rawAccuracy" stroke="#a21caf" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
