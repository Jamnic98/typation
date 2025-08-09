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
