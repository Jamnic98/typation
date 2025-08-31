import { Link } from 'react-router-dom'

import { DonateButton } from 'components'

export const Footer = () => (
  <footer
    id="footer"
    className="border-t border-gray-200 py-6 text-center text-gray-500 text-sm select-none"
    aria-label="footer"
  >
    <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
      <p className="mb-4 md:mb-0">© {new Date().getFullYear()} Typation. All rights reserved.</p>
      <nav className="flex items-center space-x-6">
        {/* Informational */}
        <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">
          About
        </Link>
        <Link to="/roadmap" className="text-gray-700 hover:text-gray-900 font-medium">
          Roadmap
        </Link>

        <DonateButton />

        {/* Divider */}
        <span className="mx-3 text-gray-300">|</span>

        {/* Legal */}
        <Link to="/privacy" className="hover:text-gray-500">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-gray-500">
          Terms
        </Link>
        <Link to="/contact" className="hover:text-gray-500">
          Contact
        </Link>
      </nav>

      {/* <DonateButton /> */}
    </div>
  </footer>
)
