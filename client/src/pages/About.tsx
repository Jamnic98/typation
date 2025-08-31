import { Link } from 'react-router-dom'

import { LegalLayout } from 'layouts'

export const About = () => (
  <LegalLayout title="About Typation">
    <p className="mb-4 text-gray-700">
      Typation helps you get faster and more accurate at typing through focused practice and clear,
      motivating feedback.
    </p>

    <p className="mb-4 text-gray-700">
      We’re building Typation as a careful, user-centred product — currently in alpha — so features
      may change as we learn from real-world use. Typation is crafted by a solo indie developer, and
      we’re committed to keeping the core experience clean and distraction-free.
    </p>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">What Typation does</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>
        <span className="font-medium">Adaptive practice:</span> sessions target weaker keys and
        patterns so you improve faster.
      </li>
      <li>
        <span className="font-medium">Useful analytics:</span> accuracy, speed, and tricky key
        combinations you can actually act on.
      </li>
      <li>
        <span className="font-medium">A clean interface:</span> a focused environment with no noise.
      </li>
    </ul>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">Principles</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>User-first design and clear, honest communication.</li>
      <li>Privacy-minded by default; we collect only what’s necessary.</li>
      <li>No gimmicks — progress you can measure and feel.</li>
    </ul>

    <h2 className="mt-6 mb-2 font-semibold text-gray-900">Roadmap (high level)</h2>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>Refining adaptive text generation and session flows.</li>
      <li>Richer progress insights and history.</li>
      <li>Optional premium features once the core is solid.</li>
    </ul>

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
      Questions or ideas? Email us at{' '}
      <a href="mailto:contact@typation.co.uk" className="text-blue-600 font-medium hover:underline">
        contact@typation.co.uk
      </a>
      .
    </p>
  </LegalLayout>
)
