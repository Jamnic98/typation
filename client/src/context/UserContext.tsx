import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { type User, type UserContextType, type UserLogin } from 'types/global'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
const authEndpoint = `${baseUrl}/auth`

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

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

      const res = await fetch(`${authEndpoint}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Login failed')

      const { access_token } = await res.json()
      localStorage.setItem('token', access_token)

      // fetch user profile
      const meRes = await fetch(`${authEndpoint}/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      if (!meRes.ok) throw new Error('Failed to fetch user profile')

      const userData = await meRes.json()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message)
      else alert('Unexpected login error')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
}
