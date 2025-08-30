export const Terms = () => (
  <div className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <p className="mb-4 text-gray-700">Last updated: {new Date().toLocaleDateString()}</p>
    <p className="mb-4 text-gray-700">By using Typation, you agree to the following terms:</p>
    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
      <li>Typation is currently in beta. Features may change or be removed at any time.</li>
      <li>
        You agree not to misuse Typation (e.g., attempting to hack, spam, or disrupt the service).
      </li>
      <li>
        Typation is provided “as is” without warranties of any kind. We are not liable for damages
        that may arise from use of the service.
      </li>
    </ul>
    <p className="text-gray-700">These terms may be updated as Typation evolves.</p>
  </div>
)
