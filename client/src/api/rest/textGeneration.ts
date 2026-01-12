import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_CORPUS_KEY } from 'utils/constants'
import { shuffleArray } from 'utils/helpers'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

const loadCorpus = async (): Promise<string[]> => await (await fetch('/corpus.json')).json()

type TextSource = 'server' | 'corpus-cache' | 'corpus-file' | 'hardcoded-fallback'

const getCorpusText = async (): Promise<{ text: string; source: TextSource }> => {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_CORPUS_KEY)
    if (cached) {
      const corpus: string[] = JSON.parse(cached)
      return { text: shuffleArray([...corpus]).join(' '), source: 'corpus-cache' }
    }

    const corpus = await loadCorpus()
    localStorage.setItem(LOCAL_STORAGE_CORPUS_KEY, JSON.stringify(corpus))
    return { text: shuffleArray([...corpus]).join(' '), source: 'corpus-file' }
  } catch {
    return {
      text: 'The quick brown fox jumps over the lazy dog.',
      source: 'hardcoded-fallback',
    }
  }
}

export const fetchTypingString = async (
  min?: number,
  max?: number
): Promise<{ text: string; source: TextSource }> => {
  const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)

  // unauthenticated users go straight to corpus
  if (!token) return await getCorpusText()

  try {
    // Build URL with query params
    const queryParams = new URLSearchParams()
    if (min !== undefined) queryParams.append('minlen', min.toString())
    if (max !== undefined) queryParams.append('maxlen', max.toString())

    const response = await fetch(`${baseUrl}/text/generate-practice-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ minlen: min, maxlen: max }),
    })

    if (!response.ok) throw new Error('Server unavailable')

    const { text }: { text: string } = await response.json()
    return { text, source: 'server' }
  } catch {
    return await getCorpusText()
  }
}
