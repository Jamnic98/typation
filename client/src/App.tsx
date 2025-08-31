import { Route, Routes } from 'react-router-dom'

import {
  Home,
  About,
  NotFound,
  Waitlist,
  Privacy,
  Terms,
  Contact,
  Roadmap,
  // ForgotPassword,
  // Login,
  // Profile,
  // Register,
  // ResetPassword,
  // Statistics,
  // Unigraph,
} from 'pages'
import { AlertBanner } from 'components'
import { AppLayout } from 'layouts'
import { AlertProvider, UserProvider } from 'api'
import { usePageTracking } from 'hooks'
import { GlobalModalProvider } from 'providers'

const App = () => {
  usePageTracking()

  return (
    <AlertProvider>
      <AlertBanner position="bottom-right" />
      <UserProvider>
        <GlobalModalProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="contact" element={<Contact />} />

              {/* <Route path="profile" element={<Profile />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="statistics/unigraphs/:id" element={<Unigraph />} />
            <Route path="auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route> */}

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </GlobalModalProvider>
      </UserProvider>
    </AlertProvider>
  )
}

export default App
