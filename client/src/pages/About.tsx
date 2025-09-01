import { Link } from 'react-router-dom'

import { LegalLayout } from 'layouts'
import { trackEvent } from 'hooks'

export const About = () => (
  <LegalLayout title="About Typation">
    <p className="mb-4 text-gray-700">
      Typation helps you type faster and more accurately with personalised practice.
    </p>

    <p className="mb-4 text-gray-700">
      Typation is currently in alpha, crafted by a solo indie developer. Features may change as we
      learn from real-world use, but the core will always remain clean and distraction-free.
    </p>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">What Typation aims to do</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>
        <span className="font-medium">A clean interface: </span>designed to imitate typing on a
        typewriter. <span className="text-gray-500">(available now)</span>
      </li>
      <li>
        <span className="font-medium">Adaptive practice:</span> sessions that target weaker keys and
        patterns so you improve faster. <span className="text-gray-500">(coming in beta)</span>
      </li>
      <li>
        <span className="font-medium">Useful analytics:</span> insights into accuracy, speed, and
        tricky key combinations you can actually act on.{' '}
        <span className="text-gray-500">(coming in beta)</span>
      </li>
    </ul>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">Principles</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>
        <span className="font-medium">User-first design</span> and clear, honest communication.
      </li>
      <li>
        <span className="font-medium">Privacy-minded by default</span>; we collect only what’s
        necessary.
      </li>
      <li>
        <span className="font-medium">No gimmicks</span> — progress you can measure and feel.
      </li>
    </ul>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">Roadmap (high level)</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>Refining adaptive text generation and session flows.</li>
      <li>Richer progress insights and history.</li>
      <li>Optional premium features once the core is solid.</li>
    </ul>

    <p className="text-gray-700 mb-4">
      Want more detail on planned features? See the{' '}
      <Link to="/roadmap" className="text-blue-600 font-medium hover:underline">
        full roadmap
      </Link>
      .
    </p>

    <p className="mb-4 text-gray-700">
      Want the nitty-gritty? Read our{' '}
      <Link to="/terms" className="text-blue-600 font-medium hover:underline">
        Terms
      </Link>{' '}
      and{' '}
      <Link to="/privacy" className="text-blue-600 font-medium hover:underline">
        Privacy Policy
      </Link>
      .
    </p>

    <p className="text-gray-700">
      Got questions or ideas? Drop us a line at{' '}
      <a
        href="mailto:contact@typation.co.uk"
        onClick={() =>
          trackEvent('mailto_click', {
            page: window.location.pathname,
          })
        }
        className="text-blue-600 font-medium hover:underline"
      >
        contact@typation.co.uk
      </a>
      .
    </p>
  </LegalLayout>
)
