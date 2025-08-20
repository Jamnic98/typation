export const GET_STATS_SUMMARY_QUERY = `
  query {
      userStatsSummary {
          userId
          fastestWpm
          averageWpm
          averageAccuracy
          totalSessions
          totalKeystrokes
          totalCorrectedCharCount
          totalDeletedCharCount
          totalCharCount
          errorCharCount
          practiceStreak
          longestStreak
      }
  }
`

export const GET_SESSIONS_BY_DATE_QUERY = `
  query GetSessionsByDateRange($startDate: DateTime!, $endDate: DateTime!) {
    userStatsSessionsByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      startTime
      endTime
      wpm
      accuracy
      practiceDuration
      correctedCharCount
      deletedCharCount
      correctCharsTyped
      totalCharsTyped
      errorCharCount
    }
  }
`
