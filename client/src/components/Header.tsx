import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Header = () => {
  const navigate = useNavigate()
  // const { user, logout } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // const handleLogout = () => {
  //   logout()
  //   setMenuOpen(false)
  //   navigate('/')
  // }

  return (
    <div className="sticky top-0 z-10 h-20 bg-white border-b border-gray-200 flex justify-between items-center px-8">
      {/* Logo */}
      <h1
        onClick={() => navigate('/')}
        className="text-xl font-bold cursor-pointer text-black hover:text-gray-800 hover:scale-105 transition-transform duration-200"
      >
        Typation (beta)
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Join Waitlist CTA */}
        <Link to="/waitlist" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Join Waitlist
        </Link>

        {/* User / Auth */}
        {/* <div className="relative">
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
        </div> */}
      </div>
    </div>
  )
}
