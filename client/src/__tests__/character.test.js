import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Character from '../components/typing/character';

describe('test the Character component', () => {
  const charObj = { character: ' ', highlighted: true, typedStatus: 'miss' };
  render(<Character charObj={charObj} />);
  const character = screen.getByTestId('character');

  test('should render', () => {
    expect(character).toBeInTheDocument();
  });

  test('should have correct class', () => {
    expect(character).toHaveClass(
      `${charObj.typedStatus}`,
      `${charObj.highlighted ? 'flash' : ''}`
    );
  });

  test('should have correct text content', () => {
    const char = charObj.character;
    expect(character).toHaveTextContent(`${char === ' ' ? '⎵' : char}`);
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<Character charObj={charObj} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
