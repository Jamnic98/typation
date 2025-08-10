import { useState, useEffect } from 'react'

import { StatRow } from 'components'
import { useUser } from 'api'
import { prettifyInt } from 'utils/helpers'
import { type TypingSessionStats, type StatsSummary } from 'types'

// TODO: move this to a real graph component
import { TestGraph } from 'components/graphs/TestGraph'

export const Statistics = () => {
  const { statsSummary } = useUser()
  const [userStatsSummary, setUserStatsSummary] = useState<StatsSummary>()

  const { sessionsByDateRange } = useUser()
  const [userSessions, setUserSessions] = useState<TypingSessionStats[]>()

  // const [startDate, setStartDate] = useState<Date>()
  // const [endDate, setEndDate] = useState<Date>()

  useEffect(() => {
    const getStats = async () => {
      const summary = await statsSummary()
      if (summary) {
        setUserStatsSummary(summary)
      }
    }
    getStats()

    const dateInPast = new Date('2025-07-30')
    const dateNow = new Date()
    const getSessions = async () => {
      const sessions = await sessionsByDateRange(dateInPast, dateNow)
      if (sessions) {
        console.log(sessions)
        setUserSessions(sessions)
      }
    }
    getSessions()
  }, [sessionsByDateRange, statsSummary])

  const stats = [
    {
      label: 'Practice Sessions',
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
      tooltip: 'Errors that were fixed before continuing.',
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

      <br />
      <br />
      <br />

      <h2 className="text-xl font-semibold">Session Performance</h2>
      <br />

      <TestGraph
        sessions={(userSessions ?? []).map((s) => ({
          startTime: s.startTime,
          wpm: s.wpm,
          accuracy: s.accuracy,
        }))}
      />
    </>
  )
}
