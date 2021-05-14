import React from 'react';
import Character from './character.js';
import './typing-widget-text.css';

function TypingWidgetText(props) {
  const { displayText } = props;

  // index of the first space char halfway past the middle of the display text
  const spaceIndex =
    displayText
      .map((charObj) => {
        return charObj.character;
      })
      .indexOf(' ', Object.values(displayText).length / 2) + 1;

  return (
    <>
      {displayText.slice(0, spaceIndex).map((charObj, index) => (
        <Character key={index} charObj={charObj} />
      ))}
      <wbr />
      {displayText
        .slice(spaceIndex, Object.values(displayText).length)
        .map((charObj, index) => (
          <Character key={index} charObj={charObj} />
        ))}
    </>
  );
}

export default TypingWidgetText;
