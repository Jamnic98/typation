import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { loginUser, logoutUser } from 'utils/auth'
import { type User, type UserContextType, type UserLogin } from 'types/global'
import { useAlert } from 'components/AlertContext'

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [user, setUser] = useState<User | null>(null)
  const [authError] = useState<string | null>(null)
  // const [isLoading, setIsLoading] = useState<boolean>(false)
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser))
    } catch (err) {
      console.warn('Failed to parse saved user from localStorage:', err)
      localStorage.removeItem('user')
    }
  }, [])

  const login = async (userLogin: UserLogin) => {
    try {
      const { email, password } = userLogin
      if (!email || !password) throw new Error('Email and password are required')

      // Attempt to login the user
      const userData = await loginUser(userLogin)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected login error'
      showAlert({
        type: 'error',
        title: 'Login Failed',
        message,
      })
    }
  }

  const logout = () => logoutUser()

  return (
    <UserContext.Provider value={{ user, login, logout, authError }}>
      {children}
    </UserContext.Provider>
  )
}
