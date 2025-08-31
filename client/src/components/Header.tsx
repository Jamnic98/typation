import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export const Header = () => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="sticky top-0 z-10 h-20 bg-white border-b border-gray-200 flex justify-between items-center px-8 select-none">
      {/* Logo + Text */}
      <Link
        to="/"
        className="flex items-center gap-3 focus:outline-none cursor-pointer"
        tabIndex={-1}
      >
        <img src="/typation_logo.svg" alt="Typation logo" className="h-10 w-10 object-contain" />

        <div className="flex flex-col justify-center text-left leading-tight">
          <span className="text-2xl font-bold text-black hover:text-gray-800 transition-colors">
            Typation
          </span>
          <span className="text-xs text-gray-500">(Public Alpha)</span>
        </div>
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-6">
        <Link
          to="/waitlist"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          tabIndex={-1}
        >
          Join Waitlist
        </Link>
      </div>
    </div>
  )
}

{
  /* User / Auth */
}
{
  /* <div className="relative">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="text-black hover:underline focus:outline-none cursor-pointer"
              >
                {user.user_name}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/statistics"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Statistics
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-b-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth/login" className="text-black hover:underline">
              Login
            </Link>
          )}
        </div> */
}
