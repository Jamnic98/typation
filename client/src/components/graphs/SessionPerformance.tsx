import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { type NameType, type ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { LABEL_MAP } from 'utils'

type Props = {
  sessions: {
    startTime: number
    wpm: number | null
    netWpm: number | null
    accuracy: number | null
    rawAccuracy: number | null
  }[]
}
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: {
    name: string
    value: number
    dataKey: string
    color: string
  }[]
  label: string
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0 || label === undefined) return null

  const timestamp = typeof label === 'number' ? new Date(label).toLocaleString() : String(label)

  return (
    <div className="flex flex-col mt-3 text-sm">
      <div className="bg-white border border-gray-200 rounded-md px-4 py-2 shadow">
        {/* Timestamp */}
        <div className="font-medium text-gray-600 mb-2">{timestamp}</div>

        {/* Metrics */}
        <div className="flex flex-col gap-1">
          {payload.map((p) => {
            if (!p) return null
            const key = p.dataKey?.toString() ?? ''
            const label = LABEL_MAP[key] ?? key
            return (
              <div key={key} className="flex items-center gap-2" style={{ color: p.color }}>
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-medium">{label}:</span>
                <span>
                  {p.value}
                  {key.includes('accuracy') || key.includes('rawAccuracy') ? '%' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const SessionPerformance = ({ sessions }: Props) => {
  const data = sessions.map((s) => ({
    timestamp: s.startTime * 1000,
    wpm: s.wpm ?? 0,
    netWpm: s.netWpm ?? 0,
    accuracy: s.accuracy ? Math.floor(s.accuracy * 100) / 100 : 0,
    rawAccuracy: s.rawAccuracy ? Math.floor(s.rawAccuracy * 100) / 100 : 0,
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

  const toggleGroup = (keys: (keyof typeof visible)[]) => {
    const allOn = keys.every((k) => visible[k])
    setVisible((prev) => {
      const updated = { ...prev }
      keys.forEach((k) => {
        updated[k] = !allOn
      })
      return updated
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ✅ Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
          <YAxis />

          <Tooltip content={<CustomTooltip label={''} />} />

          {visible.accuracy && (
            <Line type="monotone" dataKey="accuracy" stroke="#16A34A" strokeWidth={2} />
          )}
          {visible.rawAccuracy && (
            <Line type="monotone" dataKey="rawAccuracy" stroke="#86EFAC" strokeWidth={2} />
          )}

          {visible.wpm && <Line type="monotone" dataKey="wpm" stroke="#2563EB" strokeWidth={2} />}
          {visible.netWpm && (
            <Line type="monotone" dataKey="netWpm" stroke="#60A5FA" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ✅ Legend all inline */}
      <div className="flex justify-center gap-10 text-sm mt-3">
        {/* Accuracy group */}
        <div className="flex items-center gap-3">
          <span
            className="font-medium text-green-600 cursor-pointer hover:underline"
            onClick={() => toggleGroup(['accuracy', 'rawAccuracy'])}
          >
            Accuracy:
          </span>
          {[
            { key: 'accuracy', label: 'Accuracy', color: '#16A34A' },
            { key: 'rawAccuracy', label: 'Raw Accuracy', color: '#86EFAC' },
          ].map(({ key, label, color }) => {
            const active = visible[key as keyof typeof visible]
            return (
              <span
                key={key}
                onClick={() => toggleLine(key as keyof typeof visible)}
                className={`cursor-pointer flex items-center gap-1 ${
                  active ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
                />
                {label}
              </span>
            )
          })}
        </div>

        {/* Speed group */}
        <div className="flex items-center gap-3">
          <span
            className="font-medium text-blue-600 cursor-pointer hover:underline"
            onClick={() => toggleGroup(['wpm', 'netWpm'])}
          >
            Speed:
          </span>
          {[
            { key: 'wpm', label: 'WPM', color: '#2563EB' },
            { key: 'netWpm', label: 'Net WPM', color: '#60A5FA' },
          ].map(({ key, label, color }) => {
            const active = visible[key as keyof typeof visible]
            return (
              <span
                key={key}
                onClick={() => toggleLine(key as keyof typeof visible)}
                className={`cursor-pointer flex items-center gap-1 ${
                  active ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
                />
                {label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
