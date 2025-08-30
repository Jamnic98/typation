import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_TRACKING_ID = 'G-K6KQGP4TKX'

export const usePageTracking = () => {
  const location = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    window.gtag('config', GA_TRACKING_ID, {
      page_path: location.pathname + location.search,
    })
  }, [location])
}

export const trackEvent = (name: string, params: Record<string, any> = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}
