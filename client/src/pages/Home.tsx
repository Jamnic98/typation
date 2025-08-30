import { lazy, Suspense, useEffect, useState } from 'react'
import { LandingInfo, Modal } from 'components'
import { LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY } from 'utils/constants'

const TypingWidget = lazy(() => import('components').then((m) => ({ default: m.TypingWidget })))

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
      <p className="text-gray-600 font-medium animate-pulse">Loading Typation…</p>
    </div>
  </div>
)

export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const isFirstVisit = localStorage.getItem(LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY)
    if (!isFirstVisit) {
      setIsModalOpen(true)
      localStorage.setItem(LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY, 'true')
    }
  }, [])

  const handleCloseModal = () => setIsModalOpen(false)

  return (
    <Suspense fallback={<Loader />}>
      {/* 👇 nothing outside Suspense */}
      <article className="justify-center items-center flex flex-col select-none">
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <LandingInfo />
        </Modal>

        <TypingWidget />
      </article>
    </Suspense>
  )
}
