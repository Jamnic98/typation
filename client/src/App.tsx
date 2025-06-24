import { Route, Routes } from 'react-router-dom'

import { Layout } from 'components'
import { Home, Login, ForgotPassword, Register, ResetPassword } from 'pages'
import { UserProvider } from 'context/UserContext'

const App = () => {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/auth" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </UserProvider>
  )
}

export default App
