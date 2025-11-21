import { FaSun, FaMoon } from 'react-icons/fa'

interface DarkModeToggleProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <div
      onClick={toggleDarkMode}
      className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        darkMode ? 'bg-gray-700' : 'bg-yellow-300'
      }`}
    >
      {/* Slider circle */}
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center transform transition-transform ${
          darkMode ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {darkMode ? <FaMoon size={14} /> : <FaSun size={14} />}
      </div>
    </div>
  )
}
