import { useState } from 'react'

import { FeaturesCarousel } from 'components'
import { useAlert } from 'api'
import { AlertType } from 'types/global'

const baseUrl = import.meta.env.VITE_SERVER_BASE_URL
const waitlistUrl = `${baseUrl}/waitlist`

export const Waitlist = () => {
  const { showAlert } = useAlert()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(waitlistUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('API error')

      setEmail('')
      showAlert({
        type: AlertType.SUCCESS,
        title: 'Success',
        message: '🎉 You’re on the waitlist!',
      })
    } catch (err) {
      console.error(err)
      showAlert({
        type: AlertType.ERROR,
        title: 'Error',
        message: '❌ Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white py-16 pb-12">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Typation</h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
          A smarter way to practise typing. Track your progress, focus on your weak spots, and
          improve faster with personalised training.
        </p>
      </div>

      {/* Features */}
      <div className="mb-12 px-6">
        <div className="bg-gray-50 rounded-lg shadow-sm pb-6">
          <FeaturesCarousel />
        </div>
      </div>

      {/* <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sneak Peek</h2>
        <p className="text-gray-600 mb-6">
          Typation is more than just a typing interface. Here’s a glimpse of the advanced features
          being developed. These will be included and expanded when the full app launches.
        </p>

        <ImageGallery
          screenshots={[
            {
              src: '/images/stats_summary.webp',
              caption: 'All time statistics showing speed, accuracy, and keystroke data.',
            },
            {
              src: '/images/statistical_trends.webp',
              caption: 'Trends over time to track progress with moving averages and baselines.',
            },
            {
              src: '/images/stats_graph.webp',
              caption: 'Interactive graphs for speed, accuracy, and keystroke analysis.',
            },
            {
              src: '/images/typing_widget.webp',
              caption: 'Practice text that evolves with your typing trends.',
            },
          ]}
        />
      </section> */}

      {/* Waitlist Form */}
      <div className="max-w-lg mx-auto px-6">
        <div className="bg-white border rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
          <p className="mb-6 text-gray-600">Be first to know when Typation launches 🚀</p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !email}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Joining…' : 'Join'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
