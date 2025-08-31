import { lazy, Suspense } from 'react'

import { Loader } from 'components'

const TypingWidget = lazy(() => import('components').then((m) => ({ default: m.TypingWidget })))

export const Home = () => {
  return (
    <Suspense fallback={<Loader />}>
      <article className="justify-center items-center flex flex-col select-none">
        <TypingWidget />
      </article>
    </Suspense>
  )
}
