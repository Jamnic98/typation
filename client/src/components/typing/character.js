import React from 'react';
import './character.css';

const Character = (props) => {
  const { charObj } = props;

  const setOutput = (charObj) => {
    const { character, typedStatus, highlighted } = charObj;
    return (
      <span
        id='character'
        data-testid='character'
        className={`${typedStatus} ${highlighted ? 'flash' : ''}`}
      >
        {character === ' ' ? <>&#95;</> : character}
      </span>
    );
  };

  return setOutput(charObj);
};

export default Character;
