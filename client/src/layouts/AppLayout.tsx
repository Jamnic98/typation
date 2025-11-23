import { Outlet } from 'react-router-dom'

import { Header, Footer } from 'components'
import { useUser } from 'api/context'

export const AppLayout = () => {
  const { user } = useUser()

  return (
    <div className="min-h-screen flex flex-col bg-white transition-colors">
      <Header />

      <main className="grow mx-auto w-full max-w-4xl px-4">
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  )
}
