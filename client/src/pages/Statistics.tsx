import { useState, useEffect } from 'react'

import { StatRow } from 'components'
import { useUser } from 'api'
import { prettifyInt } from 'utils/helpers'
import { type StatsSummary } from 'types'

export const Statistics = () => {
  const { statsSummary } = useUser()
  const [userStatsSummary, setUserStatsSummary] = useState<StatsSummary>()

  useEffect(() => {
    const getStats = async () => {
      const summary = await statsSummary()
      if (summary) setUserStatsSummary(summary)
    }
    getStats()
  }, [statsSummary])

  const stats = [
    {
      label: 'Total Practice Sessions',
      tooltip: 'Number of completed practice sessions.',
      value: userStatsSummary?.totalSessions?.toString() ?? 'n/a',
    },
    {
      label: 'Fastest WPM',
      tooltip: 'Highest recorded words per minute.',
      value: userStatsSummary?.fastestWpm?.toString() ?? 'n/a',
    },
    {
      label: 'Average Accuracy',
      tooltip: 'Average typing accuracy across all sessions.',
      value: userStatsSummary?.averageAccuracy
        ? `${userStatsSummary.averageAccuracy.toFixed(1)}%`
        : 'n/a',
    },
    {
      label: 'Keystrokes',
      tooltip: 'Total keys pressed across all sessions.',
      value: userStatsSummary?.totalKeystrokes
        ? prettifyInt(userStatsSummary.totalKeystrokes)
        : 'n/a',
    },
    {
      label: 'Correctly Typed',
      tooltip: 'Number of correct characters typed.',
      value: userStatsSummary?.totalCharCount
        ? prettifyInt(userStatsSummary.totalCharCount)
        : 'n/a',
    },
    {
      label: 'Errors',
      tooltip: 'Number of incorrect characters typed.',
      value: userStatsSummary?.errorCharCount
        ? prettifyInt(userStatsSummary.errorCharCount)
        : 'n/a',
    },
    {
      label: 'Errors Deleted',
      tooltip: 'Errors that were removed using backspace/delete.',
      value: userStatsSummary?.totalDeletedCharCount
        ? prettifyInt(userStatsSummary.totalDeletedCharCount)
        : 'n/a',
    },
    {
      label: 'Errors Corrected',
      tooltip: 'Errors that were fixed before moving on.',
      value: userStatsSummary?.totalCorrectedCharCount
        ? prettifyInt(userStatsSummary.totalCorrectedCharCount)
        : 'n/a',
    },
  ]

  return (
    <>
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl font-semibold">Statistics</h1>
        <hr className="w-full" />
      </header>

      <div className="space-y-2">
        {stats.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>
    </>
  )
}
