import { vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { CursorStyles, SpaceSymbols, spaceSymbolMap } from 'types'
import { STYLE_HIT, STYLE_MISS, STYLE_NONE } from 'utils'

const textToType = 'hi me'

const defaultOnStartFunc = vi.fn().mockResolvedValue(null)

// Updated onComplete mock to simulate fetching new text by resetting textToType
const defaultOnCompleteFunc = vi.fn().mockImplementation(async () => {
  // simulate fetch / reset
  renderTypingWidgetText({ textToType: textToType } as TypingWidgetTextProps)
})

const defaultOnTypeFunc = vi.fn().mockResolvedValue(null)

let currentProps: TypingWidgetTextProps

const renderTypingWidgetText = (props?: TypingWidgetTextProps) => {
  currentProps = {
    textToType: textToType,
    onStart: defaultOnStartFunc,
    onComplete: defaultOnCompleteFunc,
    onType: defaultOnTypeFunc,
    reset: props && typeof props.reset === 'function' ? props.reset : () => {},
    ...props,
    typable: true,
  }
  const typingWidget = <TypingWidgetText {...currentProps} />
  render(typingWidget)
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('Test Rendering', () => {
  test('Renders with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test("Doesn't render with no text to type", async () => {
    renderTypingWidgetText({
      textToType: '',
      typingWidgetSettings: {
        spaceSymbol: SpaceSymbols.UNDERSCORE,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: false,
        testDuration: 60,
      },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: (): void => {},
      typable: true,
    })
    const typingWidget = screen.queryByTestId('typing-widget-text')
    expect(typingWidget).not.toBeInTheDocument()
  })

  test('Renders characters with spaces', () => {
    renderTypingWidgetText({
      textToType: textToType,
      typingWidgetSettings: {
        spaceSymbol: SpaceSymbols.UNDERSCORE,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: false,
        testDuration: 60,
      },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: (): void => {},
      typable: true,
    })

    // test background text
    const backgroundText = screen.getAllByTestId('background-character')
    expect(backgroundText).toHaveLength(textToType.length)
    expect(backgroundText[0]).toHaveTextContent(textToType[0])
    expect(backgroundText[1]).toHaveTextContent(textToType[1])
    expect(backgroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(backgroundText[3]).toHaveTextContent(textToType[3])
    expect(backgroundText[4]).toHaveTextContent(textToType[4])

    // test foreground text
    const foregroundText = screen.getAllByTestId('foreground-character')
    expect(foregroundText).toHaveLength(textToType.length)
    expect(foregroundText[0]).toHaveTextContent(textToType[0])
    expect(foregroundText[1]).toHaveTextContent(textToType[1])
    expect(foregroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(foregroundText[3]).toHaveTextContent(textToType[3])
    expect(foregroundText[4]).toHaveTextContent(textToType[4])
  })
})

describe('Test functionality', () => {
  test('Updates text style on key press', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: textToType,
      typingWidgetSettings: {
        textColor: 'black',
        cursorStyle: CursorStyles.BLOCK,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: true,
        testDuration: 60,
      },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: (): void => {},
      typable: true,
    })

    const characters = screen.getAllByTestId('background-character')
    const typingWidgetText = screen.getByTestId('typing-widget-text')

    // focus on the typing widget
    await user.click(typingWidgetText)
    expect(typingWidgetText).toHaveFocus()

    // check initial state
    expect(characters[0]).toHaveClass(STYLE_NONE)

    // 1st hit
    await user.keyboard(textToType[0])
    expect(characters[0]).toHaveClass(STYLE_HIT)

    // 2nd hit
    await user.keyboard(textToType[1])
    expect(characters[1]).toHaveClass(STYLE_HIT)

    // 1st miss
    await user.keyboard('z')

    // background characters carry the status styles
    const backgroundChars = screen.getAllByTestId('background-character')

    // index 2 (the space position) should now be marked MISS
    expect(backgroundChars[2]).toHaveClass(STYLE_MISS)

    // index 3 should still be untouched
    expect(backgroundChars[3]).toHaveClass(STYLE_NONE)
  })

  test('Updates cursor position correctly', async () => {
    const user = userEvent.setup()

    renderTypingWidgetText({
      textToType,
      typingWidgetSettings: {
        textColor: 'black',
        cursorStyle: CursorStyles.BLOCK,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: true,
        testDuration: 60,
      },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: () => {},
      typable: true,
    })

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // cursor starts at index 0
    let cursor = await screen.findByTestId('character-cursor')
    expect(cursor).toBeInTheDocument()
    expect(cursor.parentElement).toHaveTextContent('h') // first char

    // type first char → cursor should move to 'i'
    await user.keyboard(textToType[0])
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent('i')

    // type wrong char → cursor should move to space
    await user.keyboard('z')
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent('_') // underscore symbol for space

    // backspace → cursor moves back to 'i'
    await user.keyboard('{backspace}')
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent('i')
  })

  test('Calls onType function for valid keystrokes ', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText()
    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(0)

    await user.keyboard(textToType[0])
    await user.keyboard(textToType[1])
    await user.keyboard(textToType[2])
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(3)

    await user.keyboard(' ')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(4)

    await user.keyboard('{backspace}')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(5)
  })

  test('Calls onComplete upon text completion on correct final char and refreshes text correctly', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText()

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string (textToType)
    for (const char of textToType) {
      await user.keyboard(char)
    }

    // expect onComplete function to have been called once
    expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1)

    // type each character in the string (textToType)
    for (const char of textToType) {
      await user.keyboard(char)
    }
  })

  test('Calls onComplete upon text completion on incorrect final char and refreshes text correctly', async () => {
    const user = userEvent.setup()

    renderTypingWidgetText()

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string correct except for last key
    for (const char of textToType.slice(0, textToType.length - 1)) {
      await user.keyboard(char)
    }
    await user.keyboard('z')

    // Wait for onComplete to be called
    await waitFor(() => expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1))
  })
})
