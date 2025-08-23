export const SAVE_STATS_MUTATION = `
  mutation SaveStats($userStatsSessionInput: UserStatsSessionInput!) {
    createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
      id
      wpm
      netWpm
      accuracy
      practiceDuration
    }
  }
`
