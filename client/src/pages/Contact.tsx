import { LegalLayout } from 'layouts'

export const Contact = () => (
  <LegalLayout title="Contact Us">
    <p className="mb-4 text-gray-700">
      Got questions, feedback, or suggestions? We’d love to hear from you.
    </p>
    <p className="mb-4 text-gray-700">
      You can reach us directly at{' '}
      <a href="mailto:contact@typation.co.uk" className="text-blue-600 font-medium hover:underline">
        contact@typation.co.uk
      </a>
      .
    </p>

    <p className="text-gray-700">We do our best to respond within a couple of days.</p>
  </LegalLayout>
)
