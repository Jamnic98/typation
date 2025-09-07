import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Character, type CharacterProps } from 'components'
import { CursorStyles, FontSizes, SpaceSymbols, spaceSymbolMap, TypedStatus } from 'types'
import { STYLE_HIT, STYLE_MISS, STYLE_NONE } from 'utils'

// const dataTestId = 'character'
const defaultProps: CharacterProps = {
  char: 'a',
  isActive: false,
  typedStatus: TypedStatus.NONE,
  typingWidgetSettings: {
    textColor: 'black',
    fontSize: FontSizes.XL,
    spaceSymbol: SpaceSymbols.DOT,
    cursorStyle: CursorStyles.BLOCK,
    showCurrentLetter: true,
    characterAnimationEnabled: false,
    showBigKeyboard: false,
    testDuration: 60,
  },
}

const getTestCharacter = (props: Partial<CharacterProps> = {}) => (
  <Character {...defaultProps} {...props} />
)

const renderCharacter = (props: Partial<CharacterProps> = {}) => {
  return render(getTestCharacter(props))
}

describe('Character render tests', () => {
  test('should render with undefined props', () => {
    renderCharacter({})
    const character = screen.getByTestId('background-character')
    expect(character).toBeInTheDocument()
  })

  test('should display spaces correctly', () => {
    const { rerender } = renderCharacter({ char: ' ' })
    const character = screen.getByTestId('background-character')
    expect(character.innerHTML).toBe(
      spaceSymbolMap[defaultProps.typingWidgetSettings?.spaceSymbol || SpaceSymbols.DOT]
    )

    // Re-render with spaceSymbol
    rerender(
      getTestCharacter({
        char: ' ',
        typingWidgetSettings: {
          spaceSymbol: SpaceSymbols.DOT,
          cursorStyle: CursorStyles.BLOCK,
          showCurrentLetter: true,
          characterAnimationEnabled: false,
          showBigKeyboard: false,
          testDuration: 60,
        },
      })
    )

    expect(character).toHaveTextContent(spaceSymbolMap[SpaceSymbols.DOT])
  })
})

describe('Character displays correct styles', () => {
  test('should display hit style', () => {
    renderCharacter({ typedStatus: TypedStatus.HIT })
    const character = screen.getByTestId('background-character')
    expect(character).toHaveClass(STYLE_HIT)
  })

  test('should display miss style', () => {
    renderCharacter({ typedStatus: TypedStatus.MISS })
    const character = screen.getByTestId('foreground-character')
    expect(character).toHaveClass(STYLE_MISS)
  })

  test('should display none style', () => {
    renderCharacter()
    const character = screen.getByTestId('foreground-character')
    expect(character).toHaveClass(STYLE_NONE)
  })

  test('should display highlighted style', () => {
    renderCharacter({ isActive: true })
    const characterCursor = screen.getByTestId('character-cursor')
    expect(characterCursor).toHaveClass('animate-flash-block')
  })
})
