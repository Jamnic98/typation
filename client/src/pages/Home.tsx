import { TypingWidget } from 'components'
import { useUser } from 'api/context/UserContext'
import { useNavigate } from 'react-router-dom'

export const Home = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  // TODO: remove this console log in production
  console.log('[Home] user:', user)
  return (
    <article className="justify-center items-center flex flex-col">
      <div data-testid="home-user-name">{user?.user_name ?? 'n/a'}</div>
      <TypingWidget />
      {user ? (
        <button
          onClick={logout}
          disabled={!user}
          data-testid="logout-button"
          type="button"
          aria-label="Logout"
          aria-disabled={!user}
          tabIndex={0}
          role="button"
          className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => navigate('/auth/login')}
          type="button"
          tabIndex={0}
          role="button"
          className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors"
        >
          Login
        </button>
      )}
    </article>
  )
}
