import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidget, type TypingWidgetProps } from 'components'

const renderTypingWidget = (props: TypingWidgetProps) => {
  const typingWidget = <TypingWidget {...props} />
  render(typingWidget)
}

describe('Test Typing Widget Functionality', () => {
  test('Renders correctly ', async () => {
    screen.debug()
    const user = userEvent.setup()
    const textToType = 'hello world'
    renderTypingWidget({ textToType })

    const text = screen.getAllByTestId('character')
    const typingWidget = screen.getByTestId('typing-widget')

    expect(typingWidget).not.toHaveFocus()
    await user.click(typingWidget)

    const firstChar = text[0]

    expect(typingWidget).toHaveFocus()
    expect(firstChar).toHaveClass('text-black')

    await user.keyboard('h')
    expect(firstChar).toHaveClass('text-green-500')

    const secondChar = text[1]
    await user.keyboard('a')
    expect(secondChar).toHaveClass('text-red-500')
  })
})
