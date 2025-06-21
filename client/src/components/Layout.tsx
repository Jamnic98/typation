import { Outlet } from 'react-router-dom'

import { Header, Footer } from 'components'

export const Layout = () => (
  <div className="w-full min-h-screen">
    <Header />
    <main className="container max-w-(--breakpoint-xl) mx-auto px-8 py-20">
      <Outlet />
    </main>
    <Footer />
  </div>
)
