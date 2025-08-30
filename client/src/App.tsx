import { Route, Routes } from 'react-router-dom'

import {
  Home,
  NotFound,
  Waitlist,
  Privacy,
  Terms,
  Contact,
  // ForgotPassword,
  // Login,
  // Profile,
  // Register,
  // ResetPassword,
  // Statistics,
  // Unigraph,
} from 'pages'
import { AlertBanner, Layout } from 'components'
import { UserProvider } from 'api/context/UserContext'
import { AlertProvider } from 'api/context/AlertContext'
import { usePageTracking } from './hooks/usePageTracking'

const App = () => {
  usePageTracking()

  return (
    <AlertProvider>
      <AlertBanner position="bottom-right" />
      <UserProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
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
      </UserProvider>
    </AlertProvider>
  )
}

export default App
