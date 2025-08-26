import { useState, useEffect, useCallback } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { StatRow /* UnigraphChips */ } from 'components'
import {
  ErrorDistributionPieChart,
  KeystrokesBreakdownChart,
  SessionPerformance,
  // SessionPerformance,
} from 'components/graphs'
import { useUser } from 'api'
import { displayValue, percentChange, prettifyDuration, prettifyInt } from 'utils/helpers'
import { type TypingSessionStats, type StatsSummary, type MetricConfig, ActiveTab } from 'types'

export const Statistics = () => {
  const { statsSummary, sessionsByDateRange } = useUser()

  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Summary)
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
  const wpmMax = userSessions.reduce((max, session) => (session.wpm > max ? session.wpm : max), 0)
  const completedSessionsCurr = userSessions.length
  const totalPracticeDurationCurr = sumMetric(userSessions, 'practiceDuration')
  const totalCharsTypedCurr = sumMetric(userSessions, 'totalCharsTyped')
  const correctedCharCountCurr = sumMetric(userSessions, 'correctedCharCount')
  const deletedCharCountCurr = sumMetric(userSessions, 'deletedCharCount')
  const errorCharCountCurr = sumMetric(userSessions, 'errorCharCount')
  const wpmCurr = averageMetric(userSessions, 'wpm')
  const accuracyCurr = averageMetric(userSessions, 'accuracy')
  const rawAccuracyCurr = averageMetric(userSessions, 'rawAccuracy')

  // Baseline period stats (7 days before current period)
  const wpmMaxBaseline = baselineSessions.reduce(
    (max, session) => (session.wpm > max ? session.wpm : max),
    0
  )
  const completedSessionsBaseline = baselineSessions.length
  const totalPracticeDurationBaseline = sumMetric(baselineSessions, 'practiceDuration')
  const totalCharsTypedBaseline = sumMetric(baselineSessions, 'totalCharsTyped')
  const correctedCharCountBaseline = sumMetric(baselineSessions, 'correctedCharCount')
  const deletedCharCountBaseline = sumMetric(baselineSessions, 'deletedCharCount')
  const errorCharCountBaseline = sumMetric(baselineSessions, 'errorCharCount')
  const wpmBaseline = averageMetric(baselineSessions, 'wpm')
  const accuracyBaseline = averageMetric(baselineSessions, 'accuracy')
  const rawAccuracyBaseline = averageMetric(baselineSessions, 'rawAccuracy')

  const sessionCountsConfig = [
    {
      label: 'Total Sessions Completed',
      tooltip: 'Number of completed practice sessions.',
      value: displayValue(userStatsSummary?.totalSessions),
    },
    // {
    //   label: 'Current Daily Practice Streak',
    //   tooltip: 'Number of consecutive days with completed practice sessions.',
    //   value: displayValue(userStatsSummary?.practiceStreak),
    // },
    // {
    //   label: 'Longest Daily Practice Streak',
    //   tooltip: 'All time longest streak of consecutive days with completed practice sessions.',
    //   value: displayValue(userStatsSummary?.longestStreak),
    // },
  ]

  const summaryStatsConfig = [
    {
      label: 'Fastest WPM',
      tooltip: 'Highest recorded words per minute.',
      value: displayValue(userStatsSummary?.fastestWpm),
    },
    {
      label: 'Average WPM',
      tooltip: 'Average words per minute across all sessions.',
      value: displayValue(userStatsSummary?.averageWpm),
    },
    {
      label: 'Average Accuracy',
      tooltip:
        'Average typing accuracy across all sessions, after corrections (percentage of keys that ended up correct).',
      value: displayValue(userStatsSummary?.averageAccuracy, { percent: true }),
    },
    {
      label: 'Average Raw Accuracy',
      tooltip:
        'Average typing accuracy across all sessions, before corrections (percentage of keys that were correct on the first try).',
      value: displayValue(userStatsSummary?.averageRawAccuracy, { percent: true }),
    },
  ]

  const keyStrokeStatsConfig = [
    {
      label: 'Keystroke Count',
      tooltip: 'Total number of keys pressed across all sessions.',
      value:
        userStatsSummary?.totalKeystrokes !== undefined && userStatsSummary?.totalKeystrokes
          ? prettifyInt(userStatsSummary.totalKeystrokes)
          : 'n/a',
    },
    {
      label: 'Correctly Typed',
      tooltip: 'Total number of correctly typed keys.',
      value:
        userStatsSummary?.totalCharCount !== undefined && userStatsSummary?.totalCharCount
          ? prettifyInt(userStatsSummary.totalCharCount)
          : 'n/a',
    },
    {
      label: 'Final Errors',
      tooltip: 'Total number of errors left uncorrected at the end of sessions.',
      value:
        userStatsSummary?.errorCharCount !== undefined && userStatsSummary?.errorCharCount !== null
          ? prettifyInt(userStatsSummary.errorCharCount)
          : 'n/a',
    },

    {
      label: 'Errors Deleted',
      tooltip: 'Total number of errors removed using backspace.',
      value:
        userStatsSummary?.totalDeletedCharCount !== undefined &&
        userStatsSummary?.totalDeletedCharCount !== null
          ? prettifyInt(userStatsSummary.totalDeletedCharCount)
          : 'n/a',
    },
    {
      label: 'Errors Corrected',
      tooltip: 'Total number of errors corrected by re-typing.',
      value:
        userStatsSummary?.totalCorrectedCharCount !== undefined &&
        userStatsSummary?.totalCorrectedCharCount !== null
          ? prettifyInt(userStatsSummary.totalCorrectedCharCount)
          : 'n/a',
    },
    {
      label: 'Correction Rate',
      tooltip: 'Percentage of deleted errors that were correctly re-typed.',
      value:
        userStatsSummary?.totalDeletedCharCount != null &&
        userStatsSummary.totalDeletedCharCount > 0
          ? `${(
              ((userStatsSummary.totalCorrectedCharCount ?? 0) /
                userStatsSummary.totalDeletedCharCount) *
              100
            ).toFixed(1)}%`
          : 'n/a',
    },
  ]

  const metricsConfig: MetricConfig[] = [
    {
      label: 'Sessions Completed',
      tooltip: 'Number of practice sessions completed in the selected period.',
      current: completedSessionsCurr,
      baseline: completedSessionsBaseline,
      format: (v: number) => v,
    },
    {
      label: 'Total Practice Duration',
      tooltip: 'Total duration of practice sessions in the selected period.',
      current: totalPracticeDurationCurr,
      baseline: totalPracticeDurationBaseline,
      format: (v: number) => prettifyDuration(v),
    },
    {
      label: 'Fastest WPM',
      tooltip: 'Fastest words per minute in the selected period.',
      current: wpmMax,
      baseline: wpmMaxBaseline,
      format: (v: number) => Math.floor(v),
    },
    {
      label: 'Average WPM',
      tooltip: 'Average words per minute in the selected period.',
      current: wpmCurr,
      baseline: wpmBaseline,
      format: (v: number) => Math.floor(v),
    },
    {
      label: 'Average Accuracy',
      tooltip: 'Average typing accuracy in the selected period (percentage of correct keys).',
      current: accuracyCurr,
      baseline: accuracyBaseline,
      format: (v: number) => Math.floor(v) + '%',
    },
    {
      label: 'Average Raw Accuracy',
      tooltip:
        'Average raw typing accuracy in the selected period (percentage of correct keys ignoring corrections).',
      current: rawAccuracyCurr,
      baseline: rawAccuracyBaseline,
      format: (v: number) => Math.floor(v) + '%',
    },
    {
      label: 'Total Keys',
      tooltip: '',
      current: totalCharsTypedCurr,
      baseline: totalCharsTypedBaseline,
      format: prettifyInt,
    },
    {
      label: 'Error Rate',
      tooltip: 'Errors per 100 keys (lower is better).',
      current: totalCharsTypedCurr > 0 ? (errorCharCountCurr / totalCharsTypedCurr) * 100 : 0,
      baseline:
        totalCharsTypedBaseline > 0 ? (errorCharCountBaseline / totalCharsTypedBaseline) * 100 : 0,
      format: (v: number) => v.toFixed(1) + '%',
      inverse: true, // tells your renderer lower = good
    },
    {
      label: 'Correction Rate',
      tooltip: 'Corrections per 100 keys (lower is better).',
      current: totalCharsTypedCurr > 0 ? (correctedCharCountCurr / totalCharsTypedCurr) * 100 : 0,
      baseline:
        totalCharsTypedBaseline > 0
          ? (correctedCharCountBaseline / totalCharsTypedBaseline) * 100
          : 0,
      format: (v: number) => v.toFixed(1) + '%',
      inverse: true,
    },
    {
      label: 'Backspace Rate',
      tooltip: 'Backspaces per 100 keys (lower is better).',
      current: totalCharsTypedCurr > 0 ? (deletedCharCountCurr / totalCharsTypedCurr) * 100 : 0,
      baseline:
        totalCharsTypedBaseline > 0
          ? (deletedCharCountBaseline / totalCharsTypedBaseline) * 100
          : 0,
      format: (v: number) => v.toFixed(1) + '%',
      inverse: true,
    },
  ]

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Statistics</h1>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {[
            { id: ActiveTab.Summary, label: 'Summary' },
            { id: ActiveTab.Trends, label: 'Trends' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <section className="space-y-6">
          {/* <h2 className="text-xl font-semibold">All Time Stats Summary</h2> */}
          <div className="space-y-2">
            {sessionCountsConfig.map((stat) => (
              <StatRow key={stat.label} {...stat} />
            ))}
          </div>
          <div className="space-y-2">
            {summaryStatsConfig.map((stat) => (
              <StatRow key={stat.label} {...stat} />
            ))}
          </div>
          <div className="space-y-2">
            {keyStrokeStatsConfig.map((stat) => (
              <StatRow key={stat.label} {...stat} />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'trends' && (
        <>
          <section className="space-y-6">
            {/* <h2 className="text-xl font-semibold">Statistics by Date Range</h2> */}
            <div className="sticky top-[80px] z-1 bg-white">
              <div className="flex gap-4">
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

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">
                Change vs Baseline
                <span className="block text-sm font-normal text-neutral-500">
                  (7-day moving average before period)
                </span>
              </h3>

              {/* Group: Speed */}
              <div>
                <h4 className="text-lg font-medium text-neutral-700 mb-2">Speed</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    metricsConfig.find((m) => m.label === 'Fastest WPM'),
                    metricsConfig.find((m) => m.label === 'Average WPM'),
                  ]
                    .filter(Boolean)
                    .map((metric) => {
                      const { label, current, baseline, format } = metric!
                      const change = percentChange(current, baseline)

                      return (
                        <div
                          key={label}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                        >
                          <div className="text-xs font-medium text-neutral-600">{label}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {format(current)}
                            </span>
                            {change && (
                              <span
                                className={`text-xs font-medium ${
                                  change.positive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {change.arrow} {change.text}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {baseline && baseline !== 0
                              ? `Baseline ${format(baseline)}`
                              : 'Baseline –'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Group: Accuracy */}
              <div>
                <h4 className="text-lg font-medium text-neutral-700 mb-2">Accuracy</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    metricsConfig.find((m) => m.label === 'Average Accuracy'),
                    metricsConfig.find((m) => m.label === 'Average Raw Accuracy'),
                  ]
                    .filter(Boolean)
                    .map((metric) => {
                      const { label, current, baseline, format } = metric!
                      const change = percentChange(current, baseline)
                      return (
                        <div
                          key={label}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                        >
                          <div className="text-xs font-medium text-neutral-600">{label}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {format(current)}
                            </span>
                            {change && (
                              <span
                                className={`text-xs font-medium ${
                                  change.positive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {change.arrow} {change.text}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {baseline && baseline !== 0
                              ? `Baseline ${format(baseline)}`
                              : 'Baseline –'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Group: Keys */}
              <div>
                <h4 className="text-lg font-medium text-neutral-700 mb-2">Key presses</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    metricsConfig.find((m) => m.label === 'Total Keys'),
                    metricsConfig.find((m) => m.label === 'Backspace Rate'),
                  ]
                    .filter(Boolean)
                    .map((metric) => {
                      const { label, current, baseline, format } = metric!
                      const change = percentChange(current, baseline)
                      return (
                        <div
                          key={label}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                        >
                          <div className="text-xs font-medium text-neutral-600">{label}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {format(current)}
                            </span>
                            {change && (
                              <span
                                className={`text-xs font-medium ${
                                  change.positive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {change.arrow} {change.text}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {baseline && baseline !== 0
                              ? `Baseline ${format(baseline)}`
                              : 'Baseline –'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Group: Errors */}
              <div>
                <h4 className="text-lg font-medium text-neutral-700 mb-2">Errors</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    metricsConfig.find((m) => m.label === 'Error Rate'),
                    metricsConfig.find((m) => m.label === 'Correction Rate'),
                  ]
                    .filter(Boolean)
                    .map((metric) => {
                      const { label, current, baseline, format } = metric!
                      const change = percentChange(current, baseline)

                      return (
                        <div
                          key={label}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                        >
                          <div className="text-xs font-medium text-neutral-600">{label}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {format(current)}
                            </span>
                            {change && (
                              <span
                                className={`text-xs font-medium ${
                                  change.positive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {change.arrow} {change.text}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {baseline && baseline !== 0
                              ? `Baseline ${format(baseline)}`
                              : 'Baseline –'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Group: Sessions */}
              <section className="mb-12 space-y-6">
                <h4 className="text-lg font-medium text-neutral-700 mb-2">Sessions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    metricsConfig.find((m) => m.label === 'Sessions Completed'),
                    metricsConfig.find((m) => m.label === 'Total Practice Duration'),
                  ]
                    .filter((metric): metric is MetricConfig => metric !== undefined)
                    .map(({ label, current, baseline, format }) => {
                      const change = percentChange(current, baseline)
                      return (
                        <div
                          key={label}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                        >
                          <div className="text-xs font-medium text-neutral-600">{label}</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {format(current)}
                            </span>
                            {change && (
                              <span
                                className={`text-xs font-medium ${
                                  change.positive ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {change.arrow} {change.text}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {baseline && baseline !== 0
                              ? `Baseline ${format(baseline)}`
                              : 'Baseline –'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </section>
              <section className="mb-12 space-y-6">
                <h2 className="text-xl font-semibold">Session Performance</h2>
                <SessionPerformance
                  sessions={(userSessions ?? []).map((s) => ({
                    startTime: s.startTime,
                    wpm: s.wpm,
                    netWpm: s.netWpm,
                    accuracy: s.accuracy,
                    rawAccuracy: s.rawAccuracy,
                  }))}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-semibold">Keystroke Analysis</h2>
                <KeystrokesBreakdownChart sessions={userSessions} />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-semibold">Error Analysis</h2>
                <ErrorDistributionPieChart sessions={userSessions} />
              </section>
            </div>
          </section>
        </>
      )}
    </>
  )
}
