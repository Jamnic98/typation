import { Link } from 'react-router-dom'
import { useState } from 'react'

import { useUser } from 'api/context/UserContext'

export const Login = () => {
  const { authError, login } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await login({ email, password })
  }

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-sm text-center text-gray-600 space-y-2">
          <div>
            Don’t have an account?{' '}
            <Link to="/auth/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
          <div>
            <Link to="/auth/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      {authError && <div className="mt-4 text-sm text-center text-red-600">{authError}</div>}
    </>
  )
}
