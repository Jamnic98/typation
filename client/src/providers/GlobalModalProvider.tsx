import { useEffect, useState } from 'react'

import { Modal, LandingInfo } from 'components'
import { LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY } from 'utils/constants'

export const GlobalModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const isFirstVisit = localStorage.getItem(LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY)
    if (!isFirstVisit) {
      setIsOpen(false)
      localStorage.setItem(LOCAL_STORAGE_FIRST_VISIT_FLAG_KEY, 'true')
    }
  }, [])

  const handleClose = () => setIsOpen(false)

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <LandingInfo />
      </Modal>
      {children}
    </>
  )
}
