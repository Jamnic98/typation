import { vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { CursorStyles, SpaceSymbols, spaceSymbolMap } from 'types'
import { STYLE_HIT, STYLE_MISS, STYLE_NONE } from 'utils'

const textToType = 'hi me'

const defaultOnTypeFunc = vi.fn().mockResolvedValue(null)

let currentProps: TypingWidgetTextProps

const renderTypingWidgetText = (props?: Partial<TypingWidgetTextProps>) => {
  currentProps = {
    textToType: textToType,
    inputRef: undefined,
    ...props,
  } as TypingWidgetTextProps
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
  test.skip('Renders with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test.skip("Doesn't render with no text to type", async () => {
    renderTypingWidgetText({
      textToType: '',
      widgetSettings: {
        spaceSymbol: SpaceSymbols.UNDERSCORE,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: false,
        testDuration: 60,
        minWordLength: 1,
        maxWordLength: 10,
        showProgressBar: false,
      },
      inputRef: undefined,
      lines: [],
      lineIndex: 0,
      colIndex: 0,
      loadingText: false,
      handleKeyDown: function (): void {
        throw new Error('Function not implemented.')
      },
      useAlwaysFocus: function (): void {
        throw new Error('Function not implemented.')
      },
    })
    const typingWidget = screen.queryByTestId('typing-widget-text')
    expect(typingWidget).not.toBeInTheDocument()
  })

  test.skip('Renders characters with spaces', () => {
    renderTypingWidgetText({
      textToType: textToType,
      widgetSettings: {
        spaceSymbol: SpaceSymbols.UNDERSCORE,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: false,
        testDuration: 60,
        minWordLength: 1,
        maxWordLength: 10,
        showProgressBar: false,
      },
      inputRef: undefined,
      lines: [],
      lineIndex: 0,
      colIndex: 0,
      loadingText: false,
      handleKeyDown: function (): void {
        throw new Error('Function not implemented.')
      },
      useAlwaysFocus: function (): void {
        throw new Error('Function not implemented.')
      },
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
  test.skip('Updates text style on key press', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: textToType,
      widgetSettings: {
        textColor: 'black',
        cursorStyle: CursorStyles.UNDERSCORE,
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: true,
        testDuration: 60,
        minWordLength: 1,
        maxWordLength: 10,
        showProgressBar: false,
      },
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

  test.skip('Updates cursor position correctly', async () => {
    const user = userEvent.setup()
    const spaceSymbol = SpaceSymbols.UNDERSCORE

    renderTypingWidgetText({
      textToType,
      widgetSettings: {
        textColor: 'black',
        cursorStyle: CursorStyles.UNDERSCORE,
        spaceSymbol, // make sure the component uses this
        showBigKeyboard: false,
        showCurrentLetter: false,
        characterAnimationEnabled: true,
        testDuration: 60,
        minWordLength: 1,
        maxWordLength: 10,
        showProgressBar: false,
      },
      inputRef: undefined,
      lines: [],
      lineIndex: 0,
      colIndex: 0,
      loadingText: false,
      handleKeyDown: function (): void {
        throw new Error('Function not implemented.')
      },
      useAlwaysFocus: function (): void {
        throw new Error('Function not implemented.')
      },
    })

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // cursor starts at index 0
    let cursor = await screen.findByTestId('character-cursor')
    expect(cursor).toBeInTheDocument()
    expect(cursor.parentElement).toHaveTextContent(textToType[0]) // first char

    // type first char → cursor should move to 'i'
    await user.keyboard(textToType[0])
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent(textToType[1])

    // type wrong char → cursor should move to space
    await user.keyboard('z')
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent(spaceSymbolMap[spaceSymbol])

    // backspace → cursor moves back to 'i'
    await user.keyboard('{backspace}')
    cursor = await screen.findByTestId('character-cursor')
    expect(cursor.parentElement).toHaveTextContent(textToType[1])
  })

  test.skip('Calls onType function for valid keystrokes ', async () => {
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
})
