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

    const text = screen.getByText('h')
    expect(text).toBeInTheDocument()

    const typingWidget = screen.getByTestId('typing-widget')
    await user.click(typingWidget)

    expect(typingWidget).toHaveFocus()

    await user.type(text, 'h')
    expect(text).toHaveClass('text-green-500')

    // await user.keyboard('a')
    // expect(screen.getByText('e')).toHaveClass('text-red-500')
  })
})
