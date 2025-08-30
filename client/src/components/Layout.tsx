import { Outlet } from 'react-router-dom'

import { Header, Footer } from 'components'
import { useUser } from 'api/context/UserContext'

export const Layout = () => {
  const { user } = useUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-8 pt-16 w-full">
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  )
}
