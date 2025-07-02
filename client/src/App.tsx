import { Route, Routes } from 'react-router-dom'

import { Layout } from 'components'
import { Home, Login, ForgotPassword, Register, ResetPassword } from 'pages'
import { UserProvider } from 'api/context/UserContext'
import { AlertProvider } from 'components/AlertContext'
import { AlertBanner } from 'components/AlertBanner'

const App = () => {
  return (
    <AlertProvider>
      <AlertBanner position="bottom-right" />
      <UserProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>
            {/* TODO: make actual page */}
            {/* <Route path="*" element={<NotFound />} /> */}
            <Route path="*" element={<div>Not Found</div>} />
          </Route>
        </Routes>
      </UserProvider>
    </AlertProvider>
  )
}

export default App
