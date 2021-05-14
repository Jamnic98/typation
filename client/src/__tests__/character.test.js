import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  getByTestId,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Character from '../components/typing/character';

test('should render', () => {
  const charObj = { character: 'f', highlighted: true, typedStatus: 'none' };
  render(<Character charObj={charObj} />);
  const node = screen.getByTestId('character');
  expect(node).toHaveTextContent('f');
});
