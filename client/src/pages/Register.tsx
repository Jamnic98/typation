import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAlert, useUser } from 'api'
import { AlertType } from 'types/global'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL

export const Register = () => {
  const navigate = useNavigate()

  const { showAlert } = useAlert()
  const { login } = useUser()

  const [form, setForm] = useState({
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        // try to parse error JSON
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || 'Registration failed, please try again.')
      }

      // login using credentials
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        showAlert({
          title: 'Registration Error',
          message: err.message,
          type: AlertType.ERROR,
        })
      } else {
        showAlert({
          title: 'Registration Error',
          message: 'An unexpected error occurred',
          type: AlertType.ERROR,
        })
      }
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <form onSubmit={handleRegistration} className="space-y-4">
        <input
          type="text"
          name="user_name"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={form.user_name}
          onChange={handleChange}
          required
        />

        {/* <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="w-full border p-2 rounded"
          value={form.first_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="w-full border p-2 rounded"
          value={form.last_name}
          onChange={handleChange}
        /> */}

        {/* TODO> update styles */}
        <br />
        <br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
