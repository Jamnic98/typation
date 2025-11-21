import React from 'react'

interface PreviewCharacterProps {
  char: string | null
  spaceSymbol: string
}

export const PreviewCharacter: React.FC<PreviewCharacterProps> = ({ char, spaceSymbol }) => {
  if (char === null) return null
  const display = char === ' ' ? spaceSymbol : char

  return <div className="text-8xl h-18 text-black">{display}</div>
}
