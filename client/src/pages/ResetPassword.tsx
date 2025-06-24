import { useState } from 'react'
import { useParams } from 'react-router-dom'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

export const ResetPassword = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    })

    if (res.ok) setSuccess(true)
    else alert('Reset failed')
  }

  return success ? (
    <p>
      Password updated successfully. You can now <a href="/auth/login">log in</a>.
    </p>
  ) : (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  )
}
