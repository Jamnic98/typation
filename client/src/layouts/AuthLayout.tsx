import { Outlet } from 'react-router-dom'

export const AuthLayout = () => {
  return (
    <div className="flex justify-center items-center py-36">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
