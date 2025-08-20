import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { fetchUnigraphById, useUser } from 'api'
import { type UnigraphStatistic } from 'types'

export const Unigraph = () => {
  const { token } = useUser()

  const { id } = useParams<{ id: string }>()
  const [unigraph, setUnigraph] = useState<UnigraphStatistic | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return
      try {
        setUnigraph(await fetchUnigraphById(id, token))
      } catch (err) {
        console.error('Failed to fetch unigraph:', err)
        setUnigraph(null)
      }
    }

    fetchData()
  }, [id, token]) // include token here

  return (
    <div className="space-y-6">
      <h1 className="text-6xl font-semibold">{unigraph?.key ?? 'Unknown'}</h1>

      <div className="text-lg">Count: {unigraph?.count ?? 'N/A'}</div>

      <div className="text-lg">
        Accuracy: {unigraph?.accuracy !== undefined ? `${unigraph.accuracy}%` : 'N/A'}
      </div>

      {(unigraph?.mistyped?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Mistyped Breakdown</h2>
          <ul className="flex flex-wrap gap-2">
            {unigraph?.mistyped?.map((m: { key: string; count: number }) => (
              <li
                key={m.key}
                className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm font-mono shadow-sm"
              >
                {m.key} → {m.count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
