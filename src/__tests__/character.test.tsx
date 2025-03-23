import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Character } from 'components'
import { TypedStatus } from 'types'

const defaultProps = { char: 'a', highlighted: true, typedStatus: TypedStatus.MISS }

// Function to render the Character component, allowing specific props to be overwritten
const renderCharacter = (props = {}) => {
  const component = <Character {...defaultProps} {...props} />
  render(component)
}

describe('Character component tests', () => {
  test('should render with default props', () => {
    const testChar = 'a'
    renderCharacter({ char: testChar })
    const character = screen.getByText(testChar)
    expect(character).toBeInTheDocument()
  })

  test('should render with different props', () => {
    const charObj = { char: 'b', highlighted: false, typedStatus: TypedStatus.HIT }
    renderCharacter(charObj)
    const character = screen.getByText(charObj.char)
    expect(character).toBeInTheDocument()
  })

  test('should update styles correctly', () => {
    const initialProps = { char: 'b', highlighted: false, typedStatus: TypedStatus.HIT }

    // First render with initialProps
    renderCharacter(initialProps)

    // Get the character element and check the initial style
    const character = screen.getByText(initialProps.char)
    expect(character).toHaveClass('text-green-500')

    // Now update props (rerender with different props)
    const updatedProps = { char: 'c', highlighted: true, typedStatus: TypedStatus.MISS }
    renderCharacter(updatedProps)

    // Check the updated character and style after rerender
    const updatedCharacter = screen.getByText(updatedProps.char)
    expect(updatedCharacter).toBeInTheDocument()
    expect(updatedCharacter).toHaveClass('text-red-500')
  })
})
