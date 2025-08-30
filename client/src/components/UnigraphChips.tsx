import { useState } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import { Skeleton } from 'components'
import { fetchUnigraphById, useUser } from 'api'
import { type UnigraphStatistic, spaceSymbolMap, SpaceSymbols } from 'types'

export const UnigraphChips = ({ unigraphs }: { unigraphs: UnigraphStatistic[] }) => {
  const { token } = useUser()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, UnigraphStatistic>>({})

  const handleFetch = async (id: string) => {
    if (!token || data[id]) return // don't refetch if we already have it
    setLoadingId(id)
    try {
      const result = await fetchUnigraphById(id, token)
      setData((prev) => ({ ...prev, [id]: result }))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
      {unigraphs
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((uni) => (
          <li key={uni.id}>
            <Popover className="relative">
              <PopoverButton
                onClick={() => uni.id && handleFetch(uni.id)}
                style={{
                  backgroundColor:
                    uni.accuracy !== undefined
                      ? `hsl(${(uni.accuracy / 100) * 120}, 65%, 70%)`
                      : undefined,
                  color: '#1f2937', // tailwind gray-800
                }}
                className="inline-block px-3 py-1 rounded-full 
             cursor-pointer border border-gray-200 
             transition shadow-sm"
              >
                {uni.key === ' ' ? spaceSymbolMap[SpaceSymbols.DOT] : uni.key}
              </PopoverButton>

              <PopoverPanel className="absolute z-10 mt-2 max-w-xs rounded-lg bg-white p-4 shadow-lg border border-gray-200">
                {loadingId === uni.id ? (
                  <Skeleton />
                ) : (
                  uni.id &&
                  data[uni.id] && (
                    <div className="space-y-2">
                      <div className="font-semibold text-lg">
                        {data[uni.id].key === ' '
                          ? spaceSymbolMap[SpaceSymbols.DOT]
                          : data[uni.id].key}
                      </div>
                      <div className="text-sm">Count: {data[uni.id].count}</div>
                      <div className="text-sm w-full whitespace-nowrap">
                        Accuracy: {data[uni.id].accuracy}%
                      </div>
                      {data[uni.id].mistyped?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-1">Mistyped</div>
                          <ul className="flex flex-wrap gap-1">
                            {data[uni.id].mistyped.map((m: { key: string; count: number }) => (
                              <li
                                key={m.key}
                                className="px-2 py-0.5 text-xs bg-gray-100 rounded-full"
                              >
                                {m.key} → {m.count}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                )}
              </PopoverPanel>
            </Popover>
          </li>
        ))}
    </ul>
  )
}
