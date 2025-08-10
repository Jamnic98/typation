export const GET_STATS_SUMMARY_QUERY = `
  query {
      userStatsSummary {
          userId
          fastestWpm
          averageAccuracy
          totalSessions
          totalKeystrokes
          totalCorrectedCharCount
          totalDeletedCharCount
          totalCharCount
          errorCharCount
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
      errorCount
      correctedCharCount
      deletedCharCount
      correctCharsTyped
      totalCharsTyped
      errorCharCount
    }
  }
`
