import { vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { CursorStyles, SpaceSymbols, spaceSymbolMap } from 'types/global'

const defaultTextToType = 'hi me'
const defaultOnStartFunc = vi.fn().mockResolvedValue(null)
const defaultOnCompleteFunc = vi.fn().mockResolvedValue(null)
const defaultOnTypeFunc = vi.fn().mockResolvedValue(null)

const defaultProps: TypingWidgetTextProps = {
  textToType: defaultTextToType,
  onStart: defaultOnStartFunc,
  onComplete: defaultOnCompleteFunc,
  onType: defaultOnTypeFunc,
}

const renderTypingWidgetText = (props?: TypingWidgetTextProps) => {
  const typingWidget = <TypingWidgetText {...defaultProps} {...props} />
  render(typingWidget)
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('Test Rendering', () => {
  test('Renderes with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test("Doesn't render with no text to type", async () => {
    renderTypingWidgetText({
      textToType: '',
      fontSettings: { spaceSymbol: SpaceSymbols.UNDERSCORE },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })
    const typingWidget = screen.queryByTestId('typing-widget-text')
    expect(typingWidget).not.toBeInTheDocument()
  })

  test('Renders characters with spaces', () => {
    renderTypingWidgetText({
      textToType: defaultTextToType,
      fontSettings: { spaceSymbol: SpaceSymbols.UNDERSCORE },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })

    // test background text
    const backgroundText = screen.getAllByTestId('background-character')
    expect(backgroundText).toHaveLength(defaultTextToType.length)
    expect(backgroundText[0]).toHaveTextContent(defaultTextToType[0])
    expect(backgroundText[1]).toHaveTextContent(defaultTextToType[1])
    expect(backgroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(backgroundText[3]).toHaveTextContent(defaultTextToType[3])
    expect(backgroundText[4]).toHaveTextContent(defaultTextToType[4])

    // test foreground text
    const foregroundText = screen.getAllByTestId('foreground-character')
    expect(foregroundText).toHaveLength(defaultTextToType.length)
    expect(foregroundText[0]).toHaveTextContent(defaultTextToType[0])
    expect(foregroundText[1]).toHaveTextContent(defaultTextToType[1])
    expect(foregroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(foregroundText[3]).toHaveTextContent(defaultTextToType[3])
    expect(foregroundText[4]).toHaveTextContent(defaultTextToType[4])
  })
})

describe('Test functionality', () => {
  test('Updates text style on key press', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: defaultTextToType,
      fontSettings: { textColor: 'black', cursorStyle: CursorStyles.BLOCK },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })

    const characters = screen.getAllByTestId('background-character')
    const typingWidgetText = screen.getByTestId('typing-widget-text')

    // focus on the typing widget
    await user.click(typingWidgetText)
    expect(typingWidgetText).toHaveFocus()

    // check initial state
    expect(characters[0]).toHaveClass('text-black')

    // 1st hit
    await user.keyboard(defaultTextToType[0])
    expect(characters[0]).toHaveClass('text-green-500')

    // 2nd hit
    await user.keyboard(defaultTextToType[1])
    expect(characters[1]).toHaveClass('text-green-500')

    // 1st miss
    await user.keyboard('z')
    const character = screen.getAllByText('z')[1]
    expect(character).toHaveClass('text-red-500 line-through')
    expect(characters[3]).toHaveClass('text-black')

    // subsequent hit after miss
    await user.keyboard(defaultTextToType[3])
    expect(characters[3]).toHaveClass('text-green-500')
  })

  test('Updates cursor position correctly', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: defaultTextToType,
      fontSettings: { textColor: 'black', cursorStyle: CursorStyles.BLOCK },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })

    const characterCursors = screen.getAllByTestId('character-cursor')
    const typingWidgetText = screen.getByTestId('typing-widget-text')

    // not focused, no cursor
    await waitFor(() => expect(characterCursors[0]).not.toHaveClass('animate-flash-block'))

    // cursor appears when focused
    await user.click(typingWidgetText)
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // keystroke hit
    await user.keyboard(defaultTextToType[0])
    await waitFor(() => expect(characterCursors[1]).toHaveClass('animate-flash-block'))

    // keystroke miss
    await user.keyboard('z')
    await waitFor(() => expect(characterCursors[2]).toHaveClass('animate-flash-block'))

    // click off resets hides cursor and sets index to 0
    await user.click(document.body)
    await waitFor(() => {
      expect(characterCursors[2]).not.toHaveClass('animate-flash-block')
      expect(characterCursors[0]).not.toHaveClass('animate-flash-block')
    })

    // click back displays cursor at index 0
    await user.click(typingWidgetText)
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // backspace has no effect when cursor at index 0
    await user.keyboard('{backspace}')
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // move cursor forward to index 2 with 1 correct typed char and 1 incorrect typed char
    await user.keyboard(defaultTextToType[0])
    await user.keyboard('z')
    await waitFor(() => {
      expect(characterCursors[0]).not.toHaveClass('animate-flash-block')
      expect(characterCursors[2]).toHaveClass('animate-flash-block')
    })

    // backspace moves cursor back
    expect(characterCursors[1]).toHaveClass('animate-flash-block')
    await user.keyboard('{backspace}')
    await waitFor(() => expect(characterCursors[2]).toHaveClass('animate-flash-block'))

    // cursor doesnt overwrite correctly typed text
    expect(characterCursors[1]).toHaveClass('animate-flash-block')
    await user.keyboard('{backspace}')
    await waitFor(() => expect(characterCursors[2]).toHaveClass('animate-flash-block'))
  })

  test('Calls onType function for valid keystrokes ', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText()
    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(0)

    await user.keyboard(defaultTextToType[0])
    await user.keyboard(defaultTextToType[1])
    await user.keyboard(defaultTextToType[2])
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(3)

    await user.keyboard(' ')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(4)

    await user.keyboard('{backspace}')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(4)
  })

  test('Calls onComplete upon text completion on correct final char and refreshes text correctly', async () => {
    const user = userEvent.setup()

    // focus on the typing widget
    renderTypingWidgetText()
    const characterCursors = screen.getAllByTestId('character-cursor')
    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string
    for (const char of defaultTextToType) {
      await user.keyboard(char)
    }

    // expect on complete function to have been called
    expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1)

    // cursor behaves as expected after fetching new string
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-underscore'))
    await user.keyboard('a')
    await waitFor(() => expect(characterCursors[1]).toHaveClass('animate-flash-underscore'))
  })

  test('Calls onComplete upon text completion on incorrect final char and refreshes text correctly', async () => {
    const user = userEvent.setup()

    // focus on the typing widget
    renderTypingWidgetText()
    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string correct except for last key
    for (const char of defaultTextToType.slice(0, defaultTextToType.length - 1)) {
      await user.keyboard(char)
    }
    await user.keyboard('z')
    // expect on complete function to have been called
    expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1)

    // cursor behaves as expected after fetching new string
    const characterCursors = screen.getAllByTestId('character-cursor')
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-underscore'))

    await user.keyboard('a')
    await waitFor(() => expect(characterCursors[1]).toHaveClass('animate-flash-underscore'))
  })
})
