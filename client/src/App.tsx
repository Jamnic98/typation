import { Home } from 'pages/Home'

// user authentication

window.addEventListener('keydown', function (e) {
  if (e.key == 'Space' && e.target == document.body) {
    e.preventDefault()
  }
})

const App = () => {
  return (
    <div className="w-full min-h-screen">
      <main className="container max-w-(--breakpoint-xl) mx-auto px-8 py-20">
        <Home />
      </main>
      {/* <Header /> */}
      {/* <Footer /> */}
    </div>
  )
}

export default App
