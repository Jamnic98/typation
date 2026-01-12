import { useRef } from 'react'

type WordLengthSliderProps = {
  min: number
  max: number
  minLimit?: number
  maxLimit?: number
  onChange: (min: number, max: number) => void
  onCommit?: () => void
  size?: 'small' | 'medium' | 'large'
}

export const WordLengthSlider = ({
  min,
  max,
  minLimit = 1,
  maxLimit = 16,
  onChange,
  onCommit,
  size = 'medium',
}: WordLengthSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const activeThumb = useRef<'min' | 'max' | null>(null)

  const startDrag = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    e.preventDefault()
    activeThumb.current = thumb

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!sliderRef.current || !activeThumb.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      let pos = (moveEvent.clientX - rect.left) / rect.width
      pos = Math.max(0, Math.min(1, pos))
      const value = Math.round(pos * (maxLimit - minLimit)) + minLimit

      if (activeThumb.current === 'min') onChange(Math.min(value, max), max)
      if (activeThumb.current === 'max') onChange(min, Math.max(value, min))
    }

    const onMouseUp = () => {
      activeThumb.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      onCommit?.()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Map size to pixel values
  const thumbSizeMap = {
    small: 0.8,
    medium: 1.2,
    large: 1.4,
  }

  const thumbSize = thumbSizeMap[size]

  return (
    <div>
      <div className="relative w-full h-6 select-none" ref={sliderRef}>
        {/* Track */}
        <div className="absolute top-1/2 w-full h-1 bg-gray-300 rounded -translate-y-1/2 pointer-events-none"></div>

        {/* Active range */}
        <div
          className="absolute top-1/2 h-1 bg-blue-500 rounded -translate-y-1/2 pointer-events-none"
          style={{
            left: `${((min - minLimit) / (maxLimit - minLimit)) * 100}%`,
            right: `${100 - ((max - minLimit) / (maxLimit - minLimit)) * 100}%`,
          }}
        ></div>

        {/* Min Thumb */}
        <div
          className={`absolute bg-white border border-gray-400 rounded-full cursor-pointer z-30`}
          style={{
            width: `${thumbSize}rem`,
            height: `${thumbSize}rem`,
            left: `${((min - minLimit) / (maxLimit - minLimit)) * 100}%`,
            top: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onMouseDown={(e) => startDrag(e, 'min')}
        />

        {/* Max Thumb */}
        <div
          className={`absolute bg-white border border-gray-400 rounded-full cursor-pointer z-30`}
          style={{
            width: `${thumbSize}rem`,
            height: `${thumbSize}rem`,
            left: `${((max - minLimit) / (maxLimit - minLimit)) * 100}%`,
            top: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onMouseDown={(e) => startDrag(e, 'max')}
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-500">
        <span>Min: {min}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  )
}
