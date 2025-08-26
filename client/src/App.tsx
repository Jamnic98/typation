import { Route, Routes } from 'react-router-dom'

import {
  // ForgotPassword,
  // Login,
  // Profile,
  // Register,
  // ResetPassword,
  // Statistics,
  // Unigraph,
  Home,
  NotFound,
} from 'pages'
import { AlertProvider, AlertBanner, Layout } from 'components'
import { UserProvider } from 'api/context/UserContext'

const App = () => {
  return (
    <AlertProvider>
      <AlertBanner position="bottom-right" />
      {/* Move UserProvider higher, so Layout and all routes get it */}
      <UserProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
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
