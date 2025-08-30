import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeatureCardProps {
  title: string
  desc: string
  more: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, more }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition flex flex-col max-h-[300px]">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>

      <button
        onClick={() => setOpen(!open)}
        className="mt-3 text-blue-600 text-sm font-medium focus:outline-none"
      >
        {open ? 'Show less' : 'Learn more'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t text-gray-700 text-sm overflow-y-auto"
            style={{ maxHeight: '120px' }} // 👈 only this area scrolls
          >
            {more}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
