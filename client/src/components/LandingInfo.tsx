import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingInfo = () => {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const slides = [
    {
      title: 'Type Smarter, Not Harder',
      content: (
        <p className="text-gray-700 text-lg leading-relaxed">
          Typation isn’t just another typing test — it studies how <em>you</em> type. From
          single-key accuracy to digraph timings, Typation builds personalised practice sessions
          that focus on where you need it most.
        </p>
      ),
    },
    {
      title: '🚫 100% Ad-Free, Forever',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            I’m building Typation as a solo software engineer because I believe learning should be
            distraction-free. The core typing interface will always be free and ad-free.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Premium features help keep the project alive — but anyone can practise typing without
            barriers. Every bit of support means the world 🙏
          </p>
        </div>
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

  const paginate = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  return (
    <div className="p-6 space-y-6 text-center max-w-xl mx-auto">
      {/* Animated content box */}
      <div className="relative min-h-[260px] flex items-center justify-center overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="absolute w-full space-y-4"
          >
            <h1 className="text-2xl font-bold">{slides[step].title}</h1>
            <div>{slides[step].content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`w-3 h-3 rounded-full transition cursor-pointer ${
              step === i ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
