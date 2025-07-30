import { Route, Routes } from 'react-router-dom'

import { Home, Login, ForgotPassword, Register, ResetPassword, Profile } from 'pages'
import { AlertProvider, AlertBanner, Layout } from 'components'
import { UserProvider } from 'api/context/UserContext'

const App = () => {
  return (
    <AlertProvider>
      <AlertBanner position="bottom-right" />
      <UserProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
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
