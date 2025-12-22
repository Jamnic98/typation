import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaChartBar, FaSignOutAlt } from 'react-icons/fa'

import { trackEvent } from 'hooks'
import { useUser } from 'api'

export const Header = () => {
  const { user, logout, loading } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // const darkState = localStorage.getItem('theme') === 'dark'
  // console.log('darkState in Header:', darkState)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
  }

  return (
    <div className="sticky top-0 z-10 h-20 border-b bg-white border-gray-200 flex justify-between items-center px-8 select-none">
      {/* Logo + Text */}
      <Link
        to="/"
        className="flex items-center gap-3 focus:outline-none cursor-pointer"
        tabIndex={-1}
      >
        <img
          src="/images/logos/typation_logo_dark.png"
          alt="Typation logo"
          className="h-10 w-10 object-contain"
        />

        <div className="flex flex-col justify-center text-left leading-tight">
          <span className="text-2xl font-bold text-black transition-colors">Typation</span>
          <span className="text-xs text-gray-500">(Public Alpha)</span>
        </div>
      </Link>

      {/* Right section */}
      <div className="relative flex items-center gap-6">
        <Link
          to="/waitlist"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          tabIndex={-1}
          onClick={() =>
            trackEvent('donate_button_click', {
              location: 'header',
              page: window.location.pathname,
            })
          }
        >
          Join Waitlist
        </Link>

        {loading ? (
          // Only replace the user icon with a skeleton while loading
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            {/* Circular avatar button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black font-semibold focus:outline-none hover:bg-gray-300"
            >
              {user.user_name[0].toUpperCase()}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                {/* Full username */}
                <div className="px-4 py-2 font-medium text-gray-800 border-b border-gray-200">
                  {user.user_name}
                </div>

                {/* Options */}
                {/* <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaUser className="w-4 h-4" /> Profile
                </Link> */}
                <Link
                  to="/statistics"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaChartBar className="w-4 h-4" /> Statistics
                </Link>

                <hr className="border-gray-200 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth/login" className="text-black hover:underline">
            Login
          </Link>
        )}
      </div>
    </div>
  )
}
