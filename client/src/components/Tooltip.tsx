import React, { useState } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export const Tooltip = ({ text, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-block cursor-help border-b border-dotted border-gray-400"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      <div
        className={`pointer-events-none absolute bottom-full mb-3 left-1/2
          rounded bg-black text-white text-center text-sm px-4 py-2
          whitespace-normal min-w-48 z-50 shadow-lg
          transition-opacity duration-300 ease-in-out
          ${visible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {text}
      </div>
    </div>
  )
}
