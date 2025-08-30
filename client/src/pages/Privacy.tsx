import { LegalLayout } from 'layouts'

export const Privacy = () => (
  <LegalLayout title="Privacy Policy">
    <p className="mb-4 text-gray-700">Last updated: {new Date().toLocaleDateString()}</p>
    <p className="mb-4 text-gray-700">
      Typation respects your privacy. We only collect information you provide directly (such as your
      email address when you join the waitlist).
    </p>
    <p className="mb-4 text-gray-700">
      This information is used solely to notify you about Typation updates and related features. We
      do not sell, rent, or share your information with third parties.
    </p>
    <p className="mb-4 text-gray-700">
      You may request removal of your data at any time by contacting us.
    </p>
    <p className="text-gray-700">
      As Typation evolves, this policy may be updated to reflect new features and practices.
    </p>
  </LegalLayout>
)
