export const GET_STATS_SUMMARY_QUERY = `
  query {
      userStatsSummary {
          userId
          fastestWpm
          averageWpm
          averageAccuracy
          averageRawAccuracy
          totalSessions
          totalKeystrokes
          totalCorrectedCharCount
          totalDeletedCharCount
          totalCharCount
          errorCharCount
          practiceStreak
          longestStreak

          unigraphs {
            id
            key
            count
            accuracy
            mistyped {
              key
              count
            }
          }

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

export const GET_UNIGRAPH_BY_ID = `
  query GetUnigraph($id: ID!) {
    unigraph(id: $id) {
      id
      key
      count
      accuracy
      mistyped {
        key
        count
      }
    }
  }
`

// TODO: remove
// digraphs {
//   key
//   count
//   accuracy
// }
