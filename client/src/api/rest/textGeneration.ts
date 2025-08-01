const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

const url = `${baseUrl}/text/generate-practice-text`

export const fetchTypingString = async (): Promise<string> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed: ${response.status} ${errorText}`)
    }

    const { text }: { text: string } = await response.json()
    return text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
}
