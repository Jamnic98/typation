import { TypingWidget } from 'components'
import { useUser } from 'context/UserContext'

export const Home = () => {
  const { user } = useUser()
  return (
    <article className="justify-center items-center flex flex-col">
      <div data-testid="home-user-name">{user?.user_name ?? 'n/a'}</div>
      <TypingWidget />
    </article>
  )
}
