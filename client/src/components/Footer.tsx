import { Link } from 'react-router-dom'
import { DonateButton } from 'components'

export const Footer = () => (
  <footer
    id="footer"
    className="border-t border-gray-200 py-6 text-gray-500 text-sm select-none"
    aria-label="footer"
  >
    <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Nav: wraps & centres on mobile, shows separators on desktop */}
      <nav
        className="order-1 md:order-none w-full md:w-auto
                   flex flex-wrap items-center justify-center md:justify-start
                   gap-x-4 gap-y-2"
        aria-label="footer navigation"
      >
        {/* Informational */}
        <Link
          to="/about"
          className="text-gray-700 hover:text-gray-500 font-medium whitespace-nowrap"
        >
          About
        </Link>
        <Link
          to="/roadmap"
          className="text-gray-700 hover:text-gray-500 font-medium whitespace-nowrap"
        >
          Roadmap
        </Link>

        {/* Keep the donate CTA from wrapping weirdly */}
        <span className="shrink-0">
          <DonateButton />
        </span>

        {/* Desktop-only divider, then legal links */}
        <span className="hidden md:inline text-gray-300">|</span>

        <Link to="/privacy" className="hover:text-gray-300 whitespace-nowrap">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-gray-300 whitespace-nowrap">
          Terms
        </Link>
        <Link to="/contact" className="hover:text-gray-300 whitespace-nowrap">
          Contact
        </Link>
      </nav>

      {/* Copyright: last & centred on mobile, left on desktop */}
      <p className="order-2 md:order-none w-full md:w-auto text-center md:text-left">
        © {new Date().getFullYear()} Typation. All rights reserved.
      </p>
    </div>
  </footer>
)
