import {
  type DigraphTiming,
  type DigraphTimingAverage,
  type TypingSessionStats,
} from 'types/global'

export const GRAPHQL_ENDPOINT = '/graphql'

export const useGraphQLRequest = async <T, V = undefined>(
  query: string,
  variables?: V,
  token?: string
): Promise<T> => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  const data = await response.json()

  if (!response.ok || data.errors) {
    const msg = data.errors?.[0]?.message ?? response.statusText
    throw new Error(`GraphQL error: ${msg}`)
  }

  return data.data
}

function aggregateDigraphTimings(timings: DigraphTiming[]): DigraphTimingAverage[] {
  return timings.map(({ key, intervals }) => {
    const sum = intervals.reduce((acc, cur) => acc + cur, 0)
    const average = Math.round(sum / intervals.length)
    return { key, averageInterval: average }
  })
}

export const convertToGraphQLInput = (stats: TypingSessionStats) => {
  return {
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    practiceDuration: stats.practiceDuration,
    startTime: stats.startTime,
    endTime: stats.endTime,

    details: {
      correctedCharCount: stats.correctedCharCount,
      deletedCharCount: stats.deletedCharCount,
      typedCharCount: stats.typedCharCount,
      totalCharCount: stats.totalCharCount,
      errorCharCount: stats.errorCharCount,

      aveDigraphTimings: aggregateDigraphTimings(stats.aveDigraphTimings),

      unigraphStats: stats.unigraphStats.map((u) => ({
        key: u.key,
        count: u.count,
        accuracy: u.accuracy,
      })),

      digraphStats: stats.digraphStats.map((d) => ({
        key: d.firstKey + d.secondKey,
        count: d.count,
        accuracy: d.accuracy,
      })),
    },
  }
}
