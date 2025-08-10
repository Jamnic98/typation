import { baseUrl, GRAPHQL_ENDPOINT } from 'utils/constants'
import { GET_SESSIONS_BY_DATE_QUERY } from './queries'

export const fetchUserSessionsByDateRange = async (
  startDate: Date,
  endDate: Date,
  token: string
) => {
  const response = await fetch(`${baseUrl}${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: GET_SESSIONS_BY_DATE_QUERY,
      variables: {
        startDate,
        endDate,
      },
    }),
  })

  if (response.status === 401) {
    throw new Error('Unauthorized: check your token or login status')
  }

  const result = await response.json()

  if (result.errors) {
    throw new Error('Failed to fetch sessions')
  }

  return result.data.userStatsSessionsByDateRange
}
