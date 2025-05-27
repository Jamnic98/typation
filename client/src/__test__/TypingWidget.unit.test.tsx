// import { render } from '@testing-library/react'
// import { userEvent } from '@testing-library/user-event'

// import { TypingWidget, type TypingWidgetProps } from 'components'

// const renderTypingWidget = (props: TypingWidgetProps) => {
//   const typingWidget = <TypingWidget {...props} />
//   render(typingWidget)
// }

test('test test', () => {
  expect(true).toBe(true)
})
// describe('Test Rendering', () => {
//   // test('Renders characters with spaces', () => {
//   //   const textToType = 'hi there'
//   //   renderTypingWidget({ textToType })
//   //   const text = screen.getAllByTestId('character')
//   //   expect(text).toHaveLength(textToType.length)
//   //   expect(text[0]).toHaveTextContent(textToType[0])
//   //   expect(text[1]).toHaveTextContent(textToType[1])
//   //   expect(text[2]).toHaveTextContent(textToType[2])
//   //   expect(text[3]).toHaveTextContent(textToType[3])
//   //   expect(text[4]).toHaveTextContent(textToType[4])
//   //   expect(text[5]).toHaveTextContent(textToType[5])
//   //   expect(text[6]).toHaveTextContent(textToType[6])
//   //   expect(text[7]).toHaveTextContent(textToType[7])
//   // })
//   // test('Renders characters and updates styles on key press', async () => {
//   //   const user = userEvent.setup()
//   //   const textToType = 'hi'
//   //   renderTypingWidget({ textToType })
//   //   const text = screen.getAllByTestId('character')
//   //   const typingWidget = screen.getByTestId('typing-widget')
//   //   // focus on the typing widget
//   //   await user.click(typingWidget)
//   //   const firstChar = text[0]
//   //   expect(firstChar).toHaveClass('text-black')
//   //   await user.keyboard(textToType[0])
//   //   expect(firstChar).toHaveClass('text-green-500')
//   //   await user.keyboard(textToType[1])
//   //   expect(text[1]).toHaveClass('text-green-500')
//   // })
// })

// describe('Test Typing Widget Functionality', () => {
//   // test('TypingWidget focus on click', async () => {
//   //   const user = userEvent.setup()
//   //   renderTypingWidget({ textToType: '' })
//   //   const typingWidget = screen.getByTestId('typing-widget')
//   //   await user.click(typingWidget)
//   //   expect(typingWidget).toHaveFocus()
//   // })
//   // test('Test ', async () => {
//   //   const user = userEvent.setup()
//   //   const textToType = 'hi'
//   //   renderTypingWidget({ textToType })
//   //   const text = screen.getAllByTestId('character')
//   //   const typingWidget = screen.getByTestId('typing-widget')
//   //   await user.click(typingWidget)
//   //   expect(typingWidget).toHaveFocus()
//   //   const firstChar = text[0]
//   //   expect(firstChar).toHaveClass('text-black')
//   //   await user.keyboard('h')
//   //   expect(firstChar).toHaveClass('text-green-500')
//   //   const secondChar = text[1]
//   //   await user.keyboard('a')
//   //   expect(secondChar).toHaveClass('text-red-500')
//   // })
// })
