import React from 'react'

import { Alert } from 'components'
import { useAlert } from 'api'

type AlertBannerProps = {
  position?: 'top-center' | 'bottom-right' | 'top-right' | 'bottom-left'
}

const positionStyles: Record<string, string> = {
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ position = 'top-center' }) => {
  const { alerts, removeAlert } = useAlert()

  return (
    <div
      className={`fixed z-50 space-y-2 ${positionStyles[position]}`}
      style={{ pointerEvents: 'none', maxWidth: 320 }}
    >
      {alerts.map((alert) => (
        <div key={alert.id} style={{ pointerEvents: 'auto' }}>
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert?.message}
            onClose={() => removeAlert(alert.id)}
          />
        </div>
      ))}
    </div>
  )
}
