import { LegalLayout } from 'layouts'

export const Terms = () => (
  <LegalLayout title="Terms of Service">
    <p className="mb-4 text-gray-700">Last updated: 31/08/2025</p>

    <p className="mb-4 text-gray-700">By using Typation, you agree to the following terms:</p>

    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>
        Typation is currently in alpha. Features may change, break, or be removed without notice.
      </li>
      <li>
        You agree not to misuse Typation (for example, attempting to hack, spam, overload, or
        disrupt the service).
      </li>
      <li>
        Accounts or data may be removed if we believe there’s misuse or activity that harms other
        users.
      </li>
      <li>
        Typation is provided “as is” without warranties of any kind. We do not guarantee
        uninterrupted or error-free operation.
      </li>
      <li>
        We are not liable for any damages, data loss, or issues arising from use of the service.
      </li>
      <li>
        Any feedback or suggestions you provide may be used to improve Typation without obligation
        to compensate you.
      </li>
      <li>
        These terms may be updated at any time as Typation evolves. Continued use means you accept
        the latest version.
      </li>
    </ul>

    <p className="text-gray-700">
      If you have questions about these terms, please email{' '}
      <a href="mailto:contact@typation.co.uk" className="text-blue-600 font-medium hover:underline">
        contact@typation.co.uk
      </a>{' '}
      before using Typation.
    </p>
  </LegalLayout>
)
