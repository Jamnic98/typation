import { LegalLayout } from 'layouts'
import { Link } from 'react-router-dom'

export const Roadmap = () => (
  <LegalLayout title="Feature Roadmap">
    {/* Intro / disclaimer */}
    <p className="mb-6 text-gray-700">
      This roadmap outlines the major milestones for Typation. It’s a rough guide, not a contract.
      Priorities may shift as feedback comes in and the project evolves.
    </p>

    {/* BETA */}
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Upcoming Developments (Winter 2025/26)
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Focus: insight, motivation, and expanding practice options.
      </p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>⚙️ Improved user settings and persistence across sessions.</li>
        <li>🕶️ Dark mode and core accessibility improvements.</li>
        <li>📊 Advanced analytics dashboard with single letter and letter combination stats.</li>

        {/* <li>🔐 User accounts and login</li> */}
        {/* <li>🧩 Weak-pattern practice for tricky keys and digraphs.</li> */}
        {/* <li>🧠 Smarter text generation using per-user stats.</li> */}
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
        <li>⌨️ Live session keyboard heatmap.</li>
        <li>🚀 Stability, scaling, and polish for general release</li>
        <li>👻 Ghost racing against your average or personal best.</li>
        {/* <li>📊 Advanced analytics (comparisons, streaks, progress over time).</li> */}
        {/* <li>📝 Custom text mode (paste your own text).</li */}
        {/* <li>⚙️ Rich user settings (themes, layouts, preferences).</li> */}
      </ul>
    </section>

    {/* FUTURE */}
    {/* <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Future (2026 and beyond)</h2>
      <p className="text-sm text-gray-500 mb-4">Focus: personalisation at scale and social play.</p>
      <ul className="space-y-2 text-gray-700 list-disc pl-6">
        <li>🧪 Multiplayer and leaderboards (experimental).</li>
        <li>📱 Mobile support.</li>
      </ul>
    </section> */}

    {/* Feedback */}
    <section className="mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Ideas for the future?</h3>
      <p className="text-gray-700">
        We’re shaping Typation’s direction with your ideas. Share suggestions any time via the{' '}
        <Link to="/contact" className="text-blue-600 font-medium hover:underline">
          contact page
        </Link>
        .
      </p>
    </section>

    {/* Perks note */}
    {/* <p className="mt-4 text-sm text-gray-500">
      Early supporters and waitlist members may receive “Founding Member” perks when premium
      features arrive.
    </p> */}
  </LegalLayout>
)
