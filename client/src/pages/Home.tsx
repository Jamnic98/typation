import { lazy, Suspense, useEffect, useState } from 'react'

import { LandingInfo, Loader, Modal } from 'components'
import { LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY } from 'utils/constants'

const TypingWidget = lazy(() => import('components').then((m) => ({ default: m.TypingWidget })))

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
      <article className="justify-center items-center flex flex-col select-none">
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <LandingInfo />
        </Modal>

        <TypingWidget />
      </article>
    </Suspense>
  )
}
