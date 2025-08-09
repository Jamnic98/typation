import { Outlet } from 'react-router-dom'
import { Header, Footer } from 'components'
import { useUser } from 'api/context/UserContext'

export const Layout = () => {
  const { user } = useUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 py-20">
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  )
}
