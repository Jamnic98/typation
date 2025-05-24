import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { CursorStyles, SpaceSymbols, spaceSymbolMap } from 'types/global'

const defaultTextToType = 'hi'
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

describe('Test Rendering', () => {
  test('Renderes with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test('Renderes characters', () => {
    renderTypingWidgetText()
    const backgroundText = screen.getAllByTestId('background-character')
    expect(backgroundText).toHaveLength(defaultTextToType.length)
    expect(backgroundText[0]).toHaveTextContent(defaultTextToType[0])
    expect(backgroundText[1]).toHaveTextContent(defaultTextToType[1])
    expect(backgroundText[0]).toHaveClass('text-black')
    expect(backgroundText[1]).toHaveClass('text-black')

    const foregroundText = screen.getAllByTestId('foreground-character')
    expect(foregroundText).toHaveLength(defaultTextToType.length)
    expect(foregroundText[0]).toHaveTextContent(defaultTextToType[0])
    expect(foregroundText[1]).toHaveTextContent(defaultTextToType[1])
    expect(foregroundText[0]).toHaveClass('text-black')
    expect(foregroundText[1]).toHaveClass('text-black')
  })

  test('Renders characters with spaces', () => {
    const textToType = 'hi me'
    renderTypingWidgetText({
      textToType,
      // fetchNewString: async () => textToType,
      fontSettings: { spaceSymbol: SpaceSymbols.UNDERSCORE },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })
    const backgroundText = screen.getAllByTestId('background-character')
    expect(backgroundText).toHaveLength(textToType.length)
    expect(backgroundText[0]).toHaveTextContent(textToType[0])
    expect(backgroundText[1]).toHaveTextContent(textToType[1])
    expect(backgroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(backgroundText[3]).toHaveTextContent(textToType[3])
    expect(backgroundText[4]).toHaveTextContent(textToType[4])

    const foregroundText = screen.getAllByTestId('foreground-character')
    expect(foregroundText).toHaveLength(textToType.length)
    expect(foregroundText[0]).toHaveTextContent(textToType[0])
    expect(foregroundText[1]).toHaveTextContent(textToType[1])
    expect(foregroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(foregroundText[3]).toHaveTextContent(textToType[3])
    expect(foregroundText[4]).toHaveTextContent(textToType[4])
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

    expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1)
  })
})

describe('Test functionality', () => {
  test('Updates styles on key press', async () => {
    const user = userEvent.setup()
    const textToType = 'heya'
    renderTypingWidgetText({
      textToType,
      // fetchNewString: async () => textToType,
      fontSettings: { textColor: 'black', cursorStyle: CursorStyles.BLOCK },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
    })

    const characters = screen.getAllByTestId('background-character')
    const characterCursors = screen.getAllByTestId('character-cursor')
    const TypingWidgetText = screen.getByTestId('typing-widget-text')
    // focus on the typing widget
    await user.click(TypingWidgetText)
    expect(TypingWidgetText).toHaveFocus()

    // check initial state
    expect(characters[0]).toHaveClass('text-black')
    await waitFor(() => {
      expect(characterCursors[0]).toHaveClass('animate-flash-block')
    })

    // 1st hit
    await user.keyboard(textToType[0])
    expect(characters[0]).toHaveClass('text-green-500')
    await waitFor(() => {
      expect(characterCursors[1]).toHaveClass('animate-flash-block')
    })

    // 2nd hit
    await user.keyboard(textToType[1])
    expect(characters[1]).toHaveClass('text-green-500')
    await waitFor(() => {
      expect(characterCursors[2]).toHaveClass('animate-flash-block')
    })

    // 1st miss
    await user.keyboard('z')
    expect(characters[2]).toHaveClass('text-red-500')
    // no cursor shift
    expect(characterCursors[2]).toHaveClass('animate-flash-block')

    // subsequent hit after miss
    await user.keyboard(textToType[2])
    expect(characters[2]).toHaveClass('text-red-500')
    await waitFor(() => {
      expect(characterCursors[3]).toHaveClass('animate-flash-block')
    })

    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(2)
  })
})
