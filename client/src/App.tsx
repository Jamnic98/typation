import { TypingWidget } from 'components'

const App = () => {
  return (
    <div className="w-full min-h-screen">
      {/* <Header /> */}
      <main className="container mx-auto">
        <TypingWidget textToType="Hello World" />
      </main>
      {/* <Footer /> */}
    </div>
  )
}

export default App
