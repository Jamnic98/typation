import { createContext, useContext, useState, useEffect } from 'react'

import { useAlert } from 'components'
import { fetchUserStatsSummary, fetchUserSessionsByDateRange } from 'api'
import { loginUser } from 'utils/auth'
import {
  LOCAL_STORAGE_TEXT_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USER_KEY,
} from 'utils/constants'
import {
  AlertType,
  type TypingSessionStats,
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
  const { showAlert } = useAlert()

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
      const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
      if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser))
      if (savedToken) setToken(savedToken)
    } catch (err) {
      console.warn('Failed to parse saved user from localStorage:', err)
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    }
  }, [])

  const login = async (userLogin: UserLogin) => {
    try {
      const { email, password } = userLogin
      if (!email || !password) throw new Error('Email and password are required')

      const userData = await loginUser(userLogin)
      setUser(userData)

      // **also set token state here from localStorage or return token from loginUser**
      const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
      if (savedToken) setToken(savedToken)

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData))
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
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
    localStorage.removeItem(LOCAL_STORAGE_TEXT_KEY)
    setUser(null)
    setToken(null)
  }

  const statsSummary = async (): Promise<StatsSummary | undefined> => {
    try {
      if (token) {
        return await fetchUserStatsSummary(token)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats summary'
      showAlert({
        type: AlertType.ERROR,
        title: 'Fetch Stats Summary Failed',
        message,
      })
    }
  }

  const sessionsByDateRange = async (
    startDate: Date,
    endDate: Date
  ): Promise<TypingSessionStats[] | undefined> => {
    try {
      if (token) {
        return await fetchUserSessionsByDateRange(startDate, endDate, token)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions'
      showAlert({
        type: AlertType.ERROR,
        title: 'Fetch Sessions Failed',
        message,
      })
    }
  }

  return (
    <UserContext.Provider
      value={{ user, token, login, logout, statsSummary, sessionsByDateRange, authError: null }}
    >
      {children}
    </UserContext.Provider>
  )
}
