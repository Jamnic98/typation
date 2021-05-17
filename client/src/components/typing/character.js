import React from 'react';
import './character.css';

const ID = 'character';

const Character = (props) => {
  const { charObj } = props;

  const setOutput = (charObj) => {
    const { character, typedStatus, highlighted } = charObj;
    return (
      <span
        id={ID}
        data-testid={ID}
        className={`${typedStatus} ${highlighted ? 'flash' : ''}`}
      >
        {/* {character === ' ' ? '_' : character} */}
        {character === ' ' ? '⎵' : character}
      </span>
    );
  };

  return setOutput(charObj);
};

export default Character;
