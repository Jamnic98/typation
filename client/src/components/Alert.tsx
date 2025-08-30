import React from 'react'

import { AlertType } from 'types/global'
type AlertProps = {
  type: AlertType
  title?: string
  message?: string
  onClose?: () => void
}

const typeStyles: Record<AlertType, string> = {
  [AlertType.SUCCESS]: 'bg-green-100 border-green-500 text-green-700',
  [AlertType.ERROR]: 'bg-red-100 border-red-500 text-red-700',
  [AlertType.INFO]: 'bg-blue-100 border-blue-500 text-blue-700',
  [AlertType.WARNING]: 'bg-yellow-100 border-yellow-500 text-yellow-700',
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  return (
    <div
      className={`px-3 py-2 border-l-4 rounded shadow-sm flex items-start space-x-3 ${typeStyles[type]}`}
      role="alert"
      style={{ minWidth: 240, maxWidth: 320 }}
    >
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <p className="text-xs leading-tight m-0">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg font-bold leading-none focus:outline-none ml-2 cursor-pointer"
          aria-label="Close alert"
          style={{ lineHeight: 1 }}
        >
          &times;
        </button>
      )}
    </div>
  )
}
