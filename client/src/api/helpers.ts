import { type CharacterProps } from 'components'
import { TypedStatus, type TypingSessionStats } from 'types'

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

export const convertToGraphQLInput = (stats: TypingSessionStats) => {
  return {
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    practiceDuration: stats.practiceDuration,
    startTime: stats.startTime,
    endTime: stats.endTime,
    correctedCharCount: stats.correctedCharCount,
    deletedCharCount: stats.deletedCharCount,
    correctCharsTyped: stats.correctCharsTyped,
    totalCharsTyped: stats.totalCharsTyped,
    errorCharCount: stats.errorCharCount,

    unigraphs: stats.unigraphs.map((u) => ({
      key: u.key,
      count: u.count,
      accuracy: u.accuracy,
      mistyped: u.mistyped,
    })),

    digraphs: stats.digraphs.map((d) => ({
      key: d.key,
      count: d.count,
      accuracy: d.accuracy,
      meanInterval: d.meanInterval,
    })),
  }
}

export const getReadableErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

export const resetTypedStatus = (chars: CharacterProps[] | string): CharacterProps[] => {
  if (typeof chars === 'string') {
    return chars.split('').map((char, index) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: index === 0,
    }))
  }

  return chars.map((c) => ({ ...c, typedStatus: TypedStatus.NONE }))
}
