import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_CORPUS_KEY } from 'utils/constants'
import { shuffleArray } from 'utils/helpers'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
const url = `${baseUrl}/text/generate-practice-text`

const loadCorpus = async (): Promise<string[]> => await (await fetch('/corpus.json')).json()

type TextSource = 'server' | 'corpus-cache' | 'corpus-file' | 'hardcoded-fallback'

export const fetchTypingString = async (): Promise<{ text: string; source: TextSource }> => {
  const useCorpus = async (): Promise<{ text: string; source: TextSource }> => {
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
      // last-ditch fallback; keep short so the user isn’t stuck with lorem too long
      const text = 'The quick brown fox jumps over the lazy dog.'
      return { text, source: 'hardcoded-fallback' }
    }
  }

  try {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    if (!token) {
      // unauthenticated: go straight to corpus strategy
      return await useCorpus()
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      console.warn(`Server ${response.status}; using corpus fallback.`)
      return await useCorpus()
    }

    const { text }: { text: string } = await response.json()
    return { text, source: 'server' }
  } catch (err) {
    console.error('fetchTypingString failed; using corpus fallback.', err)
    return await useCorpus()
  }
}
