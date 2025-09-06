import { Outlet } from 'react-router-dom'

import { Header, Footer, Loader } from 'components'
import { useUser } from 'api/context'

interface AppLayoutProps {
  maxWidth?: string
  padded?: boolean
}

export const AppLayout = ({ maxWidth = 'max-w-4xl', padded = true }: AppLayoutProps) => {
  const { user, loading } = useUser()

  if (loading) {
    return <Loader label="loading user" />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main
        className={['flex-grow mx-auto w-full', maxWidth, padded ? 'px-8 pt-16' : ''].join(' ')}
      >
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  )
}
