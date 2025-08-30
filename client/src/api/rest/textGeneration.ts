import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_CORPUS_KEY } from 'utils/constants'
import { shuffleArray } from 'utils/helpers'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

const url = `${baseUrl}/text/generate-practice-text`

const loadCorpus = async (): Promise<string[]> => await (await fetch('/corpus.json')).json()

export const fetchTypingString = async (): Promise<string> => {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    if (!token) {
      const corpusLocal = localStorage.getItem(LOCAL_STORAGE_CORPUS_KEY)
      if (!corpusLocal) {
        const corpus = await loadCorpus()
        localStorage.setItem(LOCAL_STORAGE_CORPUS_KEY, JSON.stringify(corpus))
        return shuffleArray(corpus).join(' ')
      }

      const corpus = JSON.parse(corpusLocal)
      const randomised = shuffleArray(corpus)
      // Use the corpus for text generation
      const text = randomised.join(' ')
      return text
    }

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
