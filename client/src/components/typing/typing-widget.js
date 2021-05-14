import React, { useState, useEffect, useCallback } from 'react';
import TypingWidgetText from './typing-widget-text.js';
import StringGenerator from '../../stringGenerator.js';
import './typing-widget.css';

const WORD_COUNT = 5;
const TYPED_STATUS = {
  HIT: 'hit',
  MISS: 'miss',
  NONE: 'none',
};

function TypingWidget(props) {
  const { wordsArray } = props;

  const [charObjArray, setCharObjArray] = useState([]);

  const handleKeyPressed = (e) => {
    const stringArray = charObjArray.map((charObj) => charObj.character);
    const cursorPosition = getCursorPosition();
    if (e.key === stringArray[cursorPosition]) {
      setCharObjArray(updateCharObjArray(TYPED_STATUS.HIT, cursorPosition));
    } else {
      setCharObjArray(updateCharObjArray(TYPED_STATUS.MISS, cursorPosition));
    }
  };

  const updateCharObjArray = (typedStatus, cursorPosition) => {
    return charObjArray.map((charObj, index) => {
      if (typedStatus === TYPED_STATUS.HIT) {
        charObj.highlighted = index === cursorPosition + 1;
      }
      if (charObj.typedStatus !== TYPED_STATUS.MISS) {
        if (index === cursorPosition) {
          charObj.typedStatus = typedStatus;
        }
      }
      return charObj;
    });
  };

  const newCharObjArray = useCallback(() => {
    const stringToType = new StringGenerator(wordsArray).generateString(
      WORD_COUNT
    );
    return stringToType.split('').map((character, index) => {
      return {
        character,
        typedStatus: TYPED_STATUS.NONE,
        highlighted: index === 0,
      };
    });
  }, [wordsArray]);

  const getCursorPosition = useCallback(() => {
    return charObjArray
      .map((charObj) => {
        return charObj.highlighted;
      })
      .indexOf(true);
  }, [charObjArray]);

  useEffect(() => {
    if (getCursorPosition() === -1) {
      setCharObjArray(newCharObjArray());
    }
  }, [charObjArray, getCursorPosition, newCharObjArray]);

  return (
    <div id='typing-widget' tabIndex='0' onKeyDown={(e) => handleKeyPressed(e)}>
      <TypingWidgetText displayText={charObjArray} />
    </div>
  );
}

export default TypingWidget;
