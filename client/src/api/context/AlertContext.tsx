import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { type AlertData, type AlertContextType } from 'types'

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const useAlert = () => {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider')
  return ctx
}

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const showAlert = useCallback(
    (alert: Omit<AlertData, 'id'>) => {
      const exists = alerts.some(
        (a) => a.title === alert.title && a.message === alert.message && a.type === alert.type
      )
      if (exists) return

      const id = crypto.randomUUID()
      const newAlert = { ...alert, id }
      setAlerts((prev) => [...prev, newAlert])
      const timer = setTimeout(() => removeAlert(id), 4000)
      return () => clearTimeout(timer)
    },
    [alerts, removeAlert]
  )

  const value = useMemo(
    () => ({ alerts, showAlert, removeAlert }),
    [alerts, showAlert, removeAlert]
  )

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}
