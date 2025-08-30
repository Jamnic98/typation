import { Link } from 'react-router-dom'
import { DonateButton } from './DonateButton'

export const Footer = () => (
  <footer
    id="footer"
    className="border-t border-gray-200 py-6 text-center text-gray-500 text-sm"
    aria-label="footer"
  >
    <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
      <p className="mb-4 md:mb-0">© {new Date().getFullYear()} Typation. All rights reserved.</p>
      <nav className="flex items-center space-x-6">
        <Link to="/waitlist" className="hover:text-gray-700">
          Waitlist
        </Link>
        <Link to="/privacy" className="hover:text-gray-700">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-gray-700">
          Terms
        </Link>
        <Link to="/contact" className="hover:text-gray-700">
          Contact
        </Link>
        <DonateButton />
      </nav>
    </div>
  </footer>
)
