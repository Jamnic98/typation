import { useState } from 'react'
import { Link } from 'react-router-dom'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Failed to send reset link')

      setSubmitted(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    }
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <h1 className="text-2xl font-semibold text-center mb-6">Forgot Password</h1>

      {submitted ? (
        <p className="text-green-600 text-center">
          If this email is registered, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

      <div className="text-center mt-6 text-sm">
        <Link to="/auth/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
