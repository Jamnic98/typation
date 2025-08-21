import { GRAPHQL_ENDPOINT } from 'utils/constants'

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
