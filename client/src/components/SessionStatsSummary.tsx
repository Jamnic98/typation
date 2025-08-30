import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface SessionStatsSummaryProps {
  wpm: number
  netWpm: number
  accuracy: number
  rawAccuracy: number
  keystrokes: number
  corrected: number
  missed: number
  deleted: number
}

export const SessionStatsSummary = ({
  wpm,
  netWpm,
  accuracy,
  rawAccuracy,
  keystrokes,
  corrected,
  missed,
  deleted,
}: SessionStatsSummaryProps) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Hero row */}
      <div className="grid grid-cols-2 gap-6 mb-8 text-center">
        <div>
          <div className="text-5xl font-bold text-blue-600">{wpm}</div>
          <div className="uppercase tracking-widest text-sm text-blue-600">WPM</div>
        </div>
        <div>
          <div className="text-5xl font-bold text-green-600">{accuracy}%</div>
          <div className="uppercase tracking-widest text-sm text-green-600">Accuracy</div>
        </div>
      </div>

      {/* Toggle Details */}
      <div>
        <button
          onClick={() => setShowDetails((s) => !s)}
          className="mx-auto block text-sm text-blue-600 hover:text-blue-800 transition cursor-pointer"
        >
          {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
        </button>

        <AnimatePresence initial={false}>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden mt-6"
            >
              {/* Adjusted Metrics */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Adjusted Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Net WPM" value={netWpm} color="#60A5FA" />
                    <StatCard label="Raw Accuracy" value={`${rawAccuracy}%`} color="#86EFAC" />
                  </div>
                </div>

                {/* Technical details */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Technical Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                    <DetailCard label="Keystrokes" value={keystrokes} />
                    <DetailCard label="Corrected" value={corrected} />
                    <DetailCard label="Missed" value={missed} />
                    <DetailCard label="Backspaces" value={deleted} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string
  value: React.ReactNode
  color: string
}) => (
  <div className="p-3 rounded-md bg-gray-50 text-center">
    <div className="text-xl font-semibold" style={{ color }}>
      {value}
    </div>
    <div className="text-xs font-medium" style={{ color }}>
      {label}
    </div>
  </div>
)

const DetailCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="p-3 rounded-md bg-gray-50 flex flex-col items-center">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
)
