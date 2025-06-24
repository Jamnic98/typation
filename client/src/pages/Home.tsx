import { /*  StopWatch,  */ TypingWidget } from 'components'
import { useUser } from 'context/UserContext'

export const Home = () => {
  const { user } = useUser()
  return (
    <article className="justify-center items-center flex flex-col">
      <div>{user?.user_name || 'N/A'}</div>
      <TypingWidget />
    </article>
  )
}
