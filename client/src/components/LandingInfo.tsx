import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingInfo = () => {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const slides = [
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
      title: '🛠 A Work in Progress',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Typation is being built by a solo indie developer. It’s still early days, and your
            feedback helps shape where it goes next.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Expect bugs, changes, and plenty of new ideas as the project grows.
          </p>
        </div>
      ),
    },
    {
      title: '✨ Coming Soon',
      content: (
        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
          <li>🧠 Adaptive practice text tailored to your weaknesses</li>
          <li>📊 Detailed analytics and progress tracking</li>
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
