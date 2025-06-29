import { createContext, useContext, useState, type ReactNode } from 'react'

type AlertType = 'success' | 'error' | 'info' | 'warning'

export type AlertData = {
  id: string
  type: AlertType
  title?: string
  message: string
}

type AlertContextType = {
  alerts: AlertData[]
  showAlert: (alert: Omit<AlertData, 'id'>) => void
  removeAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const useAlert = () => {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider')
  return ctx
}

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([])

  const showAlert = (alert: Omit<AlertData, 'id'>) => {
    const id = crypto.randomUUID()
    const newAlert = { ...alert, id }
    setAlerts((prev) => [...prev, newAlert])

    // Auto-remove after 4s
    setTimeout(() => removeAlert(id), 4000)
  }

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}
