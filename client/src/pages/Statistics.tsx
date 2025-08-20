import { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { StatRow } from 'components'
import {
  ErrorDistributionPieChart,
  KeystrokesBreakdownChart,
  SessionPerformance,
} from 'components/graphs'
import { useUser } from 'api'
import { prettifyInt } from 'utils/helpers'
import { type TypingSessionStats, type StatsSummary } from 'types'

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return 'N/A'
  const change = ((current - previous) / previous) * 100
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export const Statistics = () => {
  const { statsSummary, sessionsByDateRange } = useUser()

  const [userStatsSummary, setUserStatsSummary] = useState<StatsSummary>()
  const [userSessions, setUserSessions] = useState<TypingSessionStats[]>([])
  const [baselineSessions, setBaselineSessions] = useState<TypingSessionStats[]>([])

  const [startDate, setStartDate] = useState<Date | null>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ) // 7 days ago
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  // Fetch all-time stats summary once
  const fetchStatsSummary = useCallback(async () => {
    const summary = await statsSummary()
    if (summary) setUserStatsSummary(summary)
  }, [statsSummary]) // no dependencies → runs only once

  // Fetch sessions for given range
  const fetchSessions = useCallback(
    async (start: Date, end: Date, setter: (data: TypingSessionStats[]) => void) => {
      const sessions = await sessionsByDateRange(start, end)
      if (sessions) setter(sessions)
    },
    [sessionsByDateRange]
  )

  useEffect(() => {
    fetchStatsSummary()
  }, [fetchStatsSummary])

  // Fetch sessions for current range and baseline whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchSessions(startDate, endDate, setUserSessions)
      // Baseline: 7 days before startDate (exclusive)
      const baselineEnd = new Date(startDate.getTime() - 1)
      const baselineStart = new Date(baselineEnd.getTime() - 7 * 24 * 60 * 60 * 1000)

      fetchSessions(baselineStart, baselineEnd, setBaselineSessions)
    }
  }, [startDate, endDate, fetchSessions])
  // Utility to sum a metric over sessions
  const sumMetric = (sessions: TypingSessionStats[], key: keyof TypingSessionStats): number =>
    sessions.reduce((acc, cur) => {
      const value = cur[key]
      return acc + (typeof value === 'number' ? value : 0)
    }, 0)

  // Calculate average metric from sessions
  const averageMetric = (sessions: TypingSessionStats[], key: keyof TypingSessionStats): number =>
    sessions.length ? sumMetric(sessions, key) / sessions.length : 0

  // Current period stats
  const completedSessionsCurr = userSessions.length
  const correctedCharCountCurr = sumMetric(userSessions, 'correctedCharCount')
  const deletedCharCountCurr = sumMetric(userSessions, 'deletedCharCount')
  const errorCharCountCurr = sumMetric(userSessions, 'errorCharCount')
  const wpmCurr = averageMetric(userSessions, 'wpm')
  const accuracyCurr = averageMetric(userSessions, 'accuracy')

  // Baseline period stats (7 days before current period)
  const completedSessionsBaseline = baselineSessions.length
  const correctedCharCountBaseline = sumMetric(baselineSessions, 'correctedCharCount')
  const deletedCharCountBaseline = sumMetric(baselineSessions, 'deletedCharCount')
  const errorCharCountBaseline = sumMetric(baselineSessions, 'errorCharCount')
  const wpmBaseline = averageMetric(baselineSessions, 'wpm')
  const accuracyBaseline = averageMetric(baselineSessions, 'accuracy')
  const sessionCountsConfig = [
    {
      label: 'Total Sessions Completed',
      tooltip: 'Total number of practice sessions completed.',
      value: userStatsSummary?.totalSessions?.toString() ?? 'n/a',
    },
    {
      label: 'Current Daily Practice Streak',
      tooltip: 'Current streak of consecutive days with at least one completed session.',
      value: userStatsSummary?.practiceStreak?.toString() ?? 'n/a',
    },
    {
      label: 'Longest Daily Practice Streak',
      tooltip: 'Longest streak of consecutive days with at least one completed session.',
      value: userStatsSummary?.longestStreak?.toString() ?? 'n/a',
    },
  ]

  const summaryStatsConfig = [
    {
      label: 'Fastest WPM',
      tooltip: 'Highest recorded words per minute in any session.',
      value: userStatsSummary?.fastestWpm?.toString() ?? 'n/a',
    },
    {
      label: 'Average WPM',
      tooltip: 'Average words per minute across all sessions.',
      value: userStatsSummary?.averageWpm?.toString() ?? 'n/a',
    },
    {
      label: 'Average Accuracy',
      tooltip: 'Average typing accuracy across all sessions (percentage of correct keys).',
      value: userStatsSummary?.averageAccuracy
        ? `${userStatsSummary.averageAccuracy.toFixed(1)}%`
        : 'n/a',
    },
  ]

  const keyStrokeStatsConfig = [
    {
      label: 'Keystroke Count',
      tooltip: 'Total number of keys pressed across all sessions.',
      value: userStatsSummary?.totalKeystrokes
        ? prettifyInt(userStatsSummary.totalKeystrokes)
        : 'n/a',
    },
    {
      label: 'Correctly Typed',
      tooltip: 'Total number of correctly typed keys.',
      value: userStatsSummary?.totalCharCount
        ? prettifyInt(userStatsSummary.totalCharCount)
        : 'n/a',
    },
    {
      label: 'Final Errors',
      tooltip: 'Total number of errors left uncorrected at the end of sessions.',
      value: userStatsSummary?.errorCharCount
        ? prettifyInt(userStatsSummary.errorCharCount)
        : 'n/a',
    },
    {
      label: 'Errors Deleted',
      tooltip: 'Total number of errors removed using backspace.',
      value: userStatsSummary?.totalDeletedCharCount
        ? prettifyInt(userStatsSummary.totalDeletedCharCount)
        : 'n/a',
    },
    {
      label: 'Errors Corrected',
      tooltip: 'Total number of errors corrected by re-typing.',
      value: userStatsSummary?.totalCorrectedCharCount
        ? prettifyInt(userStatsSummary.totalCorrectedCharCount)
        : 'n/a',
    },
    {
      label: 'Correction Rate',
      tooltip: 'Percentage of deleted errors that were correctly re-typed.',
      value:
        userStatsSummary?.totalCorrectedCharCount && userStatsSummary?.totalDeletedCharCount
          ? `${(
              (userStatsSummary.totalCorrectedCharCount / userStatsSummary.totalDeletedCharCount) *
              100
            ).toFixed(1)}%`
          : 'n/a',
    },
  ]

  const metricsConfig = [
    {
      label: 'Sessions Completed',
      tooltip: 'Number of practice sessions completed in the selected period.',
      current: completedSessionsCurr,
      baseline: completedSessionsBaseline,
      format: (v: number) => v,
    },
    {
      label: 'Average WPM',
      tooltip: 'Average words per minute in the selected period.',
      current: wpmCurr,
      baseline: wpmBaseline,
      format: (v: number) => v.toFixed(1),
    },
    {
      label: 'Average Accuracy',
      tooltip: 'Average typing accuracy in the selected period (percentage of correct keys).',
      current: accuracyCurr,
      baseline: accuracyBaseline,
      format: (v: number) => v.toFixed(1) + '%',
    },
    {
      label: 'Final Errors',
      tooltip: 'Number of errors left uncorrected at the end of sessions in the selected period.',
      current: errorCharCountCurr,
      baseline: errorCharCountBaseline,
      format: prettifyInt,
    },

    {
      label: 'Errors Deleted',
      tooltip: 'Number of errors removed using backspace in the selected period.',
      current: deletedCharCountCurr,
      baseline: deletedCharCountBaseline,
      format: prettifyInt,
    },
    {
      label: 'Errors Corrected',
      tooltip: 'Number of errors corrected by re-typing in the selected period.',
      current: correctedCharCountCurr,
      baseline: correctedCharCountBaseline,
      format: prettifyInt,
    },
  ]

  return (
    <>
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl font-semibold">Statistics</h1>
        <hr className="w-full" />
      </header>
      <h2 className="text-2xl font-semibold">All Time Stats Summary</h2>
      <br />
      <div className="space-y-2">
        {sessionCountsConfig.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>
      <br />

      <div className="space-y-2">
        {summaryStatsConfig.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>
      <br />

      <div className="space-y-2">
        {keyStrokeStatsConfig.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>
      {/* TODO: replace br with styles */}

      <br />
      <br />

      <h2 className="text-2xl font-semibold">Statistics by Date Range</h2>
      <br />
      {/* Date + time pickers */}
      <div className="sticky top-[80px] z-10 bg-white ">
        <div className="flex gap-4 mb-0">
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <DatePicker
              className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || undefined}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End</label>
            <DatePicker
              className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm
        focus:border-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
            />
          </div>
        </div>
      </div>
      <br />
      <br />
      {/* Show % changes + current values */}
      <div className="mb-6 space-y-2">
        <h3 className="text-xl font-semibold">
          Change vs Baseline (7-day moving average before period)
        </h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {metricsConfig.map(({ label, current, baseline, format }) => (
            <div key={label}>
              <div className="font-medium">{label}</div>
              <div className="flex items-center gap-2">
                {format(current)}
                <div className={`${current >= baseline ? 'text-green-600' : 'text-red-600'}`}>
                  ({percentChange(current, baseline)})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <br />
      <h2 className="text-xl font-semibold">Session Performance</h2>
      <br />
      <SessionPerformance
        sessions={(userSessions ?? []).map((s) => ({
          startTime: s.startTime,
          wpm: s.wpm,
          accuracy: s.accuracy,
        }))}
      />
      <br />
      <br />
      <h2 className="text-xl font-semibold">Session Keystroke Breakdown</h2>
      <br />
      <KeystrokesBreakdownChart sessions={userSessions} />
      <br />
      <br />
      <h2 className="text-xl font-semibold">Error Distribution</h2>
      <br />
      <ErrorDistributionPieChart sessions={userSessions} />
    </>
  )
}
