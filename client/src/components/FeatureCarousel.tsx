import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { DEFAULT_CAROUSEL_INTERVAL } from 'utils'

interface Feature {
  title: string
  desc: string
  more: string
}

const features: Feature[] = [
  {
    title: '📊 Analytics',
    desc: 'Detailed insights into your typing data and progress.',
    more: 'Typation analyses unigraphs (single keys), digraphs (two-key combos), and inter-key timings. Over time it builds a profile of your strengths and weaknesses.',
  },
  {
    title: '🧠 Adaptive Practice',
    desc: 'Practice that adapts to your weaknesses.',
    more: 'Based on your typing data, Typation generates practice text that focuses on your weakest areas — no wasted drills, just smarter repetition.',
  },
  {
    title: '👻 Ghost Racing',
    desc: 'Race your past scores.',
    more: 'Push yourself by racing against a ghost of your average WPM or personal best. A fun way to measure progress in real time.',
  },
  {
    title: '👑 Early Perks',
    desc: 'Founding members get early access.',
    more: 'Unlock discounts to premium features and a voice in shaping Typation’s roadmap.',
  },
]

export const FeaturesCarousel = () => {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const paginate = (newIndex: number) => {
    if (newIndex < 0) setIndex(features.length - 1)
    else if (newIndex >= features.length) setIndex(0)
    else setIndex(newIndex)
  }

  const next = useCallback(() => {
    setDirection(-1)
    paginate(index + 1)
  }, [index])

  // Auto-loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      next()
    }, DEFAULT_CAROUSEL_INTERVAL)
    return () => clearInterval(timer)
  }, [index, next])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? -150 : 150,
      opacity: 0,
      position: 'absolute',
    }),
    center: { x: 0, opacity: 1, position: 'relative' },
    exit: (direction: number) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
      position: 'absolute',
    }),
  }

  return (
    <div className="mx-auto text-center">
      <div className="relative min-h-[220px] flex items-center justify-center overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="absolute w-full space-y-3"
          >
            <h3 className="text-xl font-semibold">{features[index].title}</h3>
            <p className="text-gray-600">{features[index].desc}</p>
            <p className="text-sm text-gray-700  max-w-3/4 text-center mx-auto">
              {features[index].more}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls (centered dots) */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition cursor-pointer ${
                index === i ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
