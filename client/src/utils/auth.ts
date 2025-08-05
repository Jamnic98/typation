import { type User, type UserLogin } from 'types'
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from 'utils/constants'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
const authEndpoint = `${baseUrl}/auth`

export const loginUser = async (userLogin: UserLogin): Promise<User> => {
  const res = await fetch(`${authEndpoint}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userLogin.email, password: userLogin.password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Login failed')
  }
  // save token to localStorage
  const { access_token } = await res.json()
  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, access_token)

  // fetch user profile
  const meRes = await fetch(`${authEndpoint}/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!meRes.ok) throw new Error('Failed to fetch user profile')

  const userData = await meRes.json()
  return userData
}

export const logoutUser = () => {
  localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
  window.location.reload()
}
