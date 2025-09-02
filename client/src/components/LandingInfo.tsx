import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { DEFAULT_CAROUSEL_INTERVAL } from 'utils'

const ANIMATION_DURATION = 400

export const LandingInfo = () => {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [canNavigate, setCanNavigate] = useState(true)

  const slides = [
    {
      title: '🛠 A Work in Progress',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Typation is in its early stages, created by a solo indie developer. The project will
            continue to evolve with new features and refinements along the way.
          </p>
        </div>
      ),
    },
    {
      title: '🚫 Always Ad-Free',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Typation is built to keep you focused. The core typing experience is completely free —
            with zero ads, ever.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Supporters will unlock extra features in the future, but practising your typing will
            always be barrier-free.
          </p>
        </div>
      ),
    },
    {
      title: '✨ Coming Soon',
      content: (
        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
          <li>🧠 Adaptive practice text tailored to your weaknesses</li>
          <li>📊 Detailed typing analytics and progress tracking</li>
          <li>👻 Ghost racing against your past scores</li>
          <li>⚙️ User settings and persistence</li>
        </ul>
      ),
    },
  ]

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
      position: 'absolute',
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative',
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -150 : 150,
      opacity: 0,
      position: 'absolute',
    }),
  }

  const safeSetStep = useCallback(
    (newStep: number, dir: number) => {
      if (!canNavigate) return
      setCanNavigate(false)
      setDirection(dir)
      setStep(newStep)

      // re-enable after animation
      setTimeout(() => setCanNavigate(true), ANIMATION_DURATION)
    },
    [canNavigate]
  )

  const next = useCallback(() => {
    const slideCount = slides.length
    const nextStep = step + 1 >= slideCount ? 0 : step + 1
    safeSetStep(nextStep, 1)
  }, [slides.length, step, safeSetStep])

  const prev = () => {
    const slideCount = slides.length
    const previousStep = step - 1 < 0 ? slideCount - 1 : step - 1
    safeSetStep(previousStep, -1)
  }

  const paginate = (newStep: number) => {
    if (newStep === step) return
    const slideCount = slides.length
    const wrappedStep = (newStep + slideCount) % slideCount
    safeSetStep(wrappedStep, newStep > step ? 1 : -1)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      next()
    }, DEFAULT_CAROUSEL_INTERVAL)
    return () => clearInterval(interval)
  }, [step, next])

  return (
    <div>
      {/* Slide container */}
      <div className="relative h-full min-h-[220px] flex items-center justify-center overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: ANIMATION_DURATION / 1000 }}
            className="w-full max-w-[640px] text-center flex flex-col items-center gap-4"
          >
            <h1 className="text-2xl font-bold">{slides[step]?.title}</h1>
            <div className="min-w-[300px] max-w-prose mx-auto">{slides[step]?.content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + arrows */}
      <div className="flex justify-center items-center gap-5">
        <button
          type="button"
          className="w-10 h-10 cursor-pointer text-center hover:bg-gray-50 rounded-full select-none outline-none"
          onClick={prev}
          disabled={!canNavigate}
        >
          {'<'}
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => paginate(i)}
            disabled={!canNavigate}
            className={`w-3 h-3 rounded-full transition cursor-pointer ${
              step === i ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
        <button
          type="button"
          className="w-10 h-10 cursor-pointer text-center hover:bg-gray-50 rounded-full select-none outline-none"
          onClick={next}
          disabled={!canNavigate}
        >
          {'>'}
        </button>
      </div>
    </div>
  )
}
