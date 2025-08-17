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

  const summaryStatsConfig = [
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

  const metricsConfig = [
    {
      label: 'Completed Sessions',
      // TODO: update baseline to be 7-day moving average
      current: completedSessionsCurr,
      baseline: completedSessionsBaseline,
      format: (v: number) => v,
    },
    {
      label: 'Average WPM',
      current: wpmCurr,
      baseline: wpmBaseline,
      format: (v: number) => v.toFixed(1),
    },
    {
      label: 'Average Accuracy',
      current: accuracyCurr,
      baseline: accuracyBaseline,
      format: (v: number) => v.toFixed(1) + '%',
    },
    {
      label: 'Corrected Characters',
      current: correctedCharCountCurr,
      baseline: correctedCharCountBaseline,
      format: prettifyInt,
    },
    {
      label: 'Deleted Characters',
      current: deletedCharCountCurr,
      baseline: deletedCharCountBaseline,
      format: prettifyInt,
    },
    {
      label: 'Errors',
      current: errorCharCountCurr,
      baseline: errorCharCountBaseline,
      format: prettifyInt,
    },
  ]

  return (
    <>
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl font-semibold">Statistics</h1>
        <hr className="w-full" />
      </header>

      <h2 className="text-xl font-semibold">All Time Stats Summary</h2>
      <br />
      <div className="space-y-2">
        {summaryStatsConfig.map((stat) => (
          <StatRow key={stat.label} {...stat} />
        ))}
      </div>

      {/* TODO: replace br with styles */}
      <br />
      <br />
      <br />

      <h2 className="text-xl font-semibold">Statistics by Date Range</h2>
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
        <h3 className="text-lg font-semibold">
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

      <h2 className="text-xl font-semibold">Errors Per Session</h2>
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
