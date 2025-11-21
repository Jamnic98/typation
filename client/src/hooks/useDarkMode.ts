import { useEffect, useState } from 'react'

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev
      if (newMode) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', newMode ? 'dark' : 'light')
      return newMode
    })
  }

  return { darkMode, toggleDarkMode }
}
