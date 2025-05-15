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
      <Home />
      {/* <Header /> */}
      {/* <Footer /> */}
    </div>
  )
}

export default App
