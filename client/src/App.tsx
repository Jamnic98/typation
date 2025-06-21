import { Route, Routes } from 'react-router-dom'

import { Layout } from 'components'
import { Home, Login, Register } from 'pages'

// user authentication

// window.addEventListener('keydown', function (e) {
//   if (e.key == 'Space' && e.target == document.body) {
//     e.preventDefault()
//   }
// })

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* Add more pages here */}
      </Route>
    </Routes>
  )
}

export default App
