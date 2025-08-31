import { LegalLayout } from 'layouts'
import { Link } from 'react-router-dom'

export const Roadmap = () => (
  <LegalLayout title="Feature Roadmap">
    {/* Intro / disclaimer */}
    <p className="mb-6 text-gray-700">
      This roadmap outlines the major milestones for Typation. It’s a rough guide, not a contract —
      priorities may shift as feedback comes in and the project evolves.
    </p>
    {/* ALPHA */}
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Public Alpha (Available Now)</h2>
      <p className="text-sm text-gray-500 mb-4">
        Focus: core functionality, stability, and gathering early feedback.
      </p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>🧱 Bug fixes, performance tweaks, and UI polish.</li>
      </ul>

      {/* Feedback in Alpha */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Feedback in Alpha</h3>
        <p className="text-gray-700">
          The Alpha is all about learning. If something feels off, missing, or confusing, let us
          know via the{' '}
          <Link to="/contact" className="text-blue-600 font-medium hover:underline">
            contact page
          </Link>
          . Your input helps us focus on what matters most.
        </p>
      </div>
    </section>

    {/* BETA */}
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Public Beta (Winter 2025/26)</h2>
      <p className="text-sm text-gray-500 mb-4">
        Focus: insight, motivation, and expanding practice options.
      </p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>🔐 User accounts and login</li>
        <li>📊 Simple analytics dashboard (WPM, accuracy, history graphs).</li>
        <li>🧩 Weak-pattern practice for tricky keys and digraphs.</li>
        <li>👻 Ghost racing against your average or personal best.</li>
        <li>⚙️ Basic user settings for the typing interface.</li>
        <li>🕶️ Dark mode and core accessibility improvements.</li>
      </ul>
    </section>

    {/* FULL RELEASE */}
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Full Release (2026)</h2>
      <p className="text-sm text-gray-500 mb-4">
        Focus: identity, reliability, and deeper insight.
      </p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>🏆 Personal achievements.</li>
        <li>📊 Advanced analytics (comparisons, streaks, progress over time).</li>
        <li>🧠 Smarter text generation using per-user stats.</li>
        <li>⌨️ Live session keyboard heatmap.</li>
        <li>📝 Custom text mode (paste your own text).</li>
        <li>⚙️ Rich user settings (themes, layouts, preferences).</li>
        <li>🚀 Stability, scaling, and polish for general release</li>
      </ul>
    </section>

    {/* FUTURE */}
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Future (2026 and beyond)</h2>
      <p className="text-sm text-gray-500 mb-4">Focus: personalisation at scale and social play.</p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>🧪 Multiplayer and leaderboards (experimental).</li>
        <li>📱 Mobile support.</li>
      </ul>
    </section>

    {/* Feedback */}
    <section className="mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Ideas for the future?</h3>
      <p className="text-gray-700">
        Beyond Alpha, we’re shaping Typation’s direction with your ideas. Share suggestions any time
        via the{' '}
        <Link to="/contact" className="text-blue-600 font-medium hover:underline">
          contact page
        </Link>
        .
      </p>
    </section>

    {/* Perks note */}
    <p className="mt-4 text-sm text-gray-500">
      Early supporters and waitlist members may receive “Founding Member” perks when premium
      features arrive.
    </p>
  </LegalLayout>
)
