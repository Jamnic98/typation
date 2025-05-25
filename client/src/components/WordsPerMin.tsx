interface WordsPerMinProps {
  wpm: number
}

export const WordsPerMin = ({ wpm }: WordsPerMinProps) => {
  return <div className="text-xl font-mono tracking-widest select-none">wpm:{wpm}</div>
}
