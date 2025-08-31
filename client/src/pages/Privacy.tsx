import { LegalLayout } from 'layouts'

export const Privacy = () => (
  <LegalLayout title="Privacy Policy">
    <p className="mb-4 text-gray-700">Last updated: 31/08/2025</p>

    <p className="mb-4 text-gray-700">
      Typation respects your privacy, that's why we only collect information you provide directly
      (such as your email address when you join the waitlist).
    </p>

    <p className="mb-4 text-gray-700">
      This information is only used to notify you about Typation updates and related features. We do
      not and will never sell, rent, or share your information with third parties.
    </p>

    <p className="mb-4 text-gray-700">
      You may request removal of your data at any time by emailing{' '}
      <a href="mailto:contact@typation.co.uk" className="text-blue-600 font-medium hover:underline">
        contact@typation.co.uk
      </a>
      .
    </p>

    <p className="text-gray-700">
      This policy may be updated as Typation develops, but our fundamental approach to data
      collection and protection will remain consistent.
    </p>
  </LegalLayout>
)
