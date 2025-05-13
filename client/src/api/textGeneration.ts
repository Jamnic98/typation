// const URL = process.env.SERVER_URL ||
const URL = 'http://localhost:5000/generate-text'

export const fetchNewString = async (): Promise<string> => {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data: { text: string } = await response.json()
    console.log('Fetched new string:', data)
    return data.text
  } catch (error) {
    console.error('Error fetching new string:', error)
    return 'Error fetching new string'
  }
}
