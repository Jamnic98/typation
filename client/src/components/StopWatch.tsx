import { /* useEffect,  */ useState } from 'react'

export const StopWatch = () => {
  const [time /* setTime */] = useState(new Date().toISOString())

  // useEffect(() => {
  //   setTimeout(() => {
  //     setTime(new Date().toISOString())
  //     console.log('time', time)
  //   }, 5000)
  // }, [])

  return <>{time}</>
}
