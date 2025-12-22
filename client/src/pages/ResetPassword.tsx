import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAlert } from 'api/context'
import { AlertType } from 'types'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

export const ResetPassword = () => {
  const { showAlert } = useAlert()
  const { token } = useParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      showAlert({
        title: 'Please fill out all fields',
        type: AlertType.ERROR,
      })
      return
    }

    const res = await fetch(`${baseUrl}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      showAlert({
        title: 'Password reset failed, please try again',
        type: AlertType.ERROR,
      })
    }
  }

  return (
    <div className="max-w-md mx-auto px-">
      {success ? (
        <p className="text-center text-green-600">
          Password updated successfully. You can now{' '}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            log in
          </Link>
          .
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full border p-2 rounded"
              placeholder="Confirm your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border p-2 rounded"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Reset Password
            </button>
          </form>
        </>
      )}
    </div>
  )
}
