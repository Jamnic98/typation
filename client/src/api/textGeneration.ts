// const URL = import.meta.env.SERVER

// TODO: use env variable for URL
const URL = '/api/generate-text'
// const URL = 'http://localhost:5000/generate-text'

export const fetchNewString = async (): Promise<string> => {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const { text }: { text: string } = await response.json()
    return text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(errorMessage)
    alert(errorMessage)
    throw new Error(errorMessage)
  }
}
