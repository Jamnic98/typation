export {}

declare global {
  interface Window {
    gtag?: (...args: T[]) => void
  }
}
