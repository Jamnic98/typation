import { LegalLayout } from 'layouts'

export const Contact = () => (
  <LegalLayout title="Contact Us">
    <p className="mb-4 text-gray-700">
      Got questions, feedback, or suggestions? We’d love to hear from you.
    </p>
    <p className="mb-4 text-gray-700">You can reach us directly at:</p>
    <p className="mb-4 text-blue-600 font-medium">
      <a href="mailto:contact@typation.co.uk" className="hover:underline">
        contact@typation.co.uk
      </a>
    </p>
    <p className="text-gray-700">We do our best to respond within a couple of days.</p>
  </LegalLayout>
)
