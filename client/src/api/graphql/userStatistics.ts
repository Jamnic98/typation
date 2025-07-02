import { convertToGraphQLInput, GRAPHQL_ENDPOINT } from 'api/helpers'
import { type TypingSessionStats } from 'types/global'
import { baseUrl } from 'utils'

const SAVE_STATS_MUTATION = `
  mutation SaveStats($userStatsSessionInput: UserStatsSessionInput!) {
    createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
      id
      wpm
      accuracy
      practiceDuration
    }
  }
`

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
