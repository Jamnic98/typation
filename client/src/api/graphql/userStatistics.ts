import { convertToGraphQLInput } from 'api/helpers'
import { SAVE_STATS_MUTATION } from './mutations'
import { GET_STATS_SUMMARY_QUERY, GET_UNIGRAPH_BY_ID } from './queries'
import { baseUrl, GRAPHQL_ENDPOINT } from 'utils/constants'
import { type StatsSummary, type TypingSessionStats } from 'types'

export const saveStats = async (stats: TypingSessionStats, token: string): Promise<void> => {
  const input = convertToGraphQLInput(stats)
  const response = await fetch(`${baseUrl}${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: SAVE_STATS_MUTATION,
      variables: { userStatsSessionInput: input },
    }),
  })

  if (response.status === 401) {
    throw new Error('Unauthorized: check your token or login status')
  }

  const result = await response.json()

  if (result.errors) {
    console.error('[saveStats] GraphQL errors:', result.errors)
    throw new Error('Failed to save typing stats')
  }
}

export const fetchUserStatsSummary = async (token: string): Promise<StatsSummary> => {
  const response = await fetch(`${baseUrl}${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: GET_STATS_SUMMARY_QUERY,
    }),
  })

  if (response.status === 401) {
    throw new Error('Unauthorized: check your token or login status')
  }

  const result = await response.json()

  if (result.errors) {
    console.error('[fetchUserStatsSummary] GraphQL errors:', result.errors)
    throw new Error('Failed to fetch typing stats')
  }

  return result.data.userStatsSummary
}

export const fetchUnigraphById = async (id: string, token: string) => {
  const response = await fetch(`${baseUrl}${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: GET_UNIGRAPH_BY_ID,
      variables: { id },
    }),
  })

  if (response.status === 401) {
    throw new Error('Unauthorized: check your token or login status')
  }

  const result = await response.json()

  if (result.errors) {
    console.error('[fetchUnigraphById] GraphQL errors:', result.errors)
    throw new Error('Failed to fetch unigraph')
  }

  return result.data.unigraph
}
