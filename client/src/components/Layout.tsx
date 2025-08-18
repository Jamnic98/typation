import { Outlet } from 'react-router-dom'
import { Header, Footer } from 'components'
import { useUser } from 'api/context/UserContext'

export const Layout = () => {
  const { user } = useUser()

  return (
    <div className="min-h-screen min-w-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-8 py-20">
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  )
}
