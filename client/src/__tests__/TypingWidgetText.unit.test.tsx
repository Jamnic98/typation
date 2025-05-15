import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { SpaceSymbol, spaceSymbolMap } from 'types/global'

const defaultTextToType = 'hi'
const defaultFetchNewStringFunc = vi.fn().mockResolvedValue('mock text')

const defaultProps: TypingWidgetTextProps = {
  textToType: defaultTextToType,
  fetchNewString: defaultFetchNewStringFunc,
}

const renderTypingWidgetText = (props?: TypingWidgetTextProps) => {
  const typingWidget = <TypingWidgetText {...defaultProps} {...props} />
  render(typingWidget)
}

describe('Test Rendering', () => {
  test('Renderes with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test('Renderes characters', () => {
    renderTypingWidgetText()
    const text = screen.getAllByTestId('character')
    expect(text).toHaveLength(defaultTextToType.length)
    expect(text[0]).toHaveTextContent(defaultTextToType[0])
    expect(text[1]).toHaveTextContent(defaultTextToType[1])
    expect(text[0]).toHaveClass('text-black')
    expect(text[1]).toHaveClass('text-black')
  })

  test('Renders characters with spaces', () => {
    const textToType = 'hi me'
    renderTypingWidgetText({
      textToType,
      fetchNewString: async () => textToType,
      fontSettings: { spaceSymbol: SpaceSymbol.UNDERSCORE },
    })
    const text = screen.getAllByTestId('character')
    expect(text).toHaveLength(textToType.length)
    expect(text[0]).toHaveTextContent(textToType[0])
    expect(text[1]).toHaveTextContent(textToType[1])
    expect(text[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbol.UNDERSCORE])
    expect(text[3]).toHaveTextContent(textToType[3])
    expect(text[4]).toHaveTextContent(textToType[4])
  })

  test('Renders characters and updates styles on key press', async () => {
    const user = userEvent.setup()
    const textToType = 'heya'
    renderTypingWidgetText({
      textToType,
      fetchNewString: async () => textToType,
      fontSettings: { textColor: 'black' },
    })

    const characters = screen.getAllByTestId('character')
    const characterCursors = screen.getAllByTestId('character-cursor')
    const TypingWidgetText = screen.getByTestId('typing-widget-text')
    // focus on the typing widget
    await user.click(TypingWidgetText)
    expect(TypingWidgetText).toHaveFocus()

    // check initial state
    const firstChar = characters[0]
    expect(firstChar).toHaveClass('text-black')
    expect(characterCursors[0]).toHaveClass('animate-flash-block')

    // 1st hit
    await user.keyboard(textToType[0])
    expect(firstChar).toHaveClass('text-green-500')
    expect(characterCursors[1]).toHaveClass('animate-flash-block')

    // 2nd hit
    await user.keyboard(textToType[1])
    expect(characters[1]).toHaveClass('text-green-500')
    expect(characterCursors[2]).toHaveClass('animate-flash-block')

    // 1st miss
    await user.keyboard('z')
    expect(characters[2]).toHaveClass('text-red-500')
    // no cursor shift
    expect(characterCursors[2]).toHaveClass('animate-flash-block')

    // subsequent hit after miss
    await user.keyboard(textToType[2])
    expect(characters[2]).toHaveClass('text-red-500')
    expect(characterCursors[3]).toHaveClass('animate-flash-block')
  })

  test('Calls fetchNewString on complete', async () => {
    renderTypingWidgetText()
    const user = userEvent.setup()

    // focus on the typing widget
    const TypingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(TypingWidgetText)
    expect(TypingWidgetText).toHaveFocus()

    // type correct characters and expect fetchNewString to be called
    await user.keyboard(defaultTextToType[0])
    await user.keyboard(defaultTextToType[1])

    expect(defaultFetchNewStringFunc.mock.calls.length).toEqual(1)
  })
})
