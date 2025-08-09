import { useUser } from 'api/context/UserContext'

export const Profile = () => {
  const { user } = useUser()

  return (
    <>
      <div>
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-semibold">Profile</h1>
          <hr className="w-full" />
        </header>

        <div className="space-y-12">
          {/* <h2 className="text-2xl mb-4">User</h2> */}
          <div className="space-y-2">
            <div>
              Username: <span>{user?.user_name ?? ''}</span>
            </div>
            <div>
              Email: <span>{user?.email ?? ''}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
