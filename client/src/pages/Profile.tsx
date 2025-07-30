import { useState, useEffect } from 'react'

import { useUser } from 'api/context/UserContext'
import { type StatsSummary } from 'types'

export const Profile = () => {
  const { user, statsSummary } = useUser()
  const [userStatsSummary, setUserStatsSummary] = useState<StatsSummary | undefined>()

  console.log(userStatsSummary)

  useEffect(() => {
    const getStats = async () => {
      const summary = await statsSummary()
      summary && setUserStatsSummary(summary)
      console.log(summary)
    }

    getStats()
  }, [statsSummary])

  return (
    <>
      <div>
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-semibold">Profile</h1>
          <hr className="w-full" />
        </header>

        <div className="space-y-12">
          <h2 className="text-2xl mb-4">User</h2>
          <div className="space-y-2">
            <div>
              Username: <span>{user?.user_name}</span>
            </div>
            <div>
              Email: <span>{user?.email}</span>
            </div>
          </div>

          <h2 className="text-2xl mb-4">Statistics</h2>
          <div className="space-y-2">
            <div>
              Fastest WPM: <span>79</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
