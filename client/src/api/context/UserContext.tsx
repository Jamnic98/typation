import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAlert } from 'components'
import { fetchUserStatsSummary } from 'api'
import { loginUser } from 'utils/auth'
import {
  AlertType,
  type StatsSummary,
  type User,
  type UserContextType,
  type UserLogin,
} from 'types'

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
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser))
      if (savedToken) setToken(savedToken)
    } catch (err) {
      console.warn('Failed to parse saved user from localStorage:', err)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }, [])

  const login = async (userLogin: UserLogin) => {
    try {
      const { email, password } = userLogin
      if (!email || !password) throw new Error('Email and password are required')

      const userData = await loginUser(userLogin)
      setUser(userData)

      // **also set token state here from localStorage or return token from loginUser**
      const savedToken = localStorage.getItem('token')
      if (savedToken) setToken(savedToken)

      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected login error'
      showAlert({
        type: AlertType.ERROR,
        title: 'Login Failed',
        message,
      })
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    window.location.reload()
    navigate('/')
  }

  const statsSummary = async (): Promise<StatsSummary | undefined> => {
    try {
      if (token) {
        return await fetchUserStatsSummary(token)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <UserContext.Provider value={{ user, token, login, logout, statsSummary, authError: null }}>
      {children}
    </UserContext.Provider>
  )
}
