import { useUser } from 'api'
import { useState, useEffect } from 'react'
import { type StatsSummary } from 'types'

export const Statistics = () => {
  const { statsSummary } = useUser()
  const [userStatsSummary, setUserStatsSummary] = useState<StatsSummary | undefined>()

  useEffect(() => {
    const getStats = async () => {
      const summary = await statsSummary()
      summary && setUserStatsSummary(summary)
    }
    getStats()
  }, [statsSummary])

  return (
    <>
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl font-semibold">Statistics</h1>
        <hr className="w-full" />
      </header>

      <div className="space-y-2">
        <div>
          Practice Sessions: <span>{userStatsSummary?.totalSessions ?? 'n/a'}</span>
        </div>
        <div>
          Fastest WPM: <span>{userStatsSummary?.fastestWpm ?? 'n/a'}</span>
        </div>
        <div>
          Average Accuracy:{' '}
          <span>
            {userStatsSummary?.averageAccuracy
              ? `${userStatsSummary.averageAccuracy.toFixed(1)}%`
              : 'n/a'}
          </span>
        </div>
      </div>
    </>
  )
}
