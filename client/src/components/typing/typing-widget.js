import React, { useState, useEffect, useCallback } from 'react';
import TypingWidgetText from './typing-widget-text.js';
import StringGenerator from '../../stringGenerator.js';
import './typing-widget.css';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_ARRAY = (' ' + ALPHABET).split('');
// create an array of all possible char pair combinations from CHAR_ARRAY
const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
  return CHAR_ARRAY.map((char2) => {
    const charPair = char1 + char2;
    return { charPair: charPair, score: 0 };
  });
});

const WORD_COUNT = 2;
const TYPED_STATUS = {
  HIT: 'hit',
  MISS: 'miss',
  NONE: 'none',
};

const stringGenerator = new StringGenerator();

function TypingWidget() {
  const [charObjArray, setCharObjArray] = useState([]);
  const [charArrayPairScores, setCharArrayPairScores] = useState([]);

  const handleKeyPressed = async (e) => {
    const stringArray = charObjArray.map((charObj) => charObj.character);
    const cursorPosition = getCursorPosition();
    const key = e.key;
    if (CHAR_ARRAY.indexOf(key) !== -1) {
      // correct key hit
      if (key === stringArray[cursorPosition]) {
        setCharObjArray(
          await updateCharObjArray(TYPED_STATUS.HIT, cursorPosition)
        );
      } else {
        // incorrect key hit
        setCharObjArray(
          await updateCharObjArray(TYPED_STATUS.MISS, cursorPosition)
        );
      }
    }
  };

  const updateCharObjArray = async (typedStatus, cursorPosition) => {
    // if cursor is at the end, create new string
    if (cursorPosition === Object.values(charObjArray).length - 1) {
      return strToCharObjArray(await getNewString(WORD_COUNT));
    } else {
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
    }
  };

  const getNewString = async (wordCount) => {
    return await stringGenerator.generateString(wordCount);
  };

  const strToCharObjArray = useCallback((string) => {
    return string.split('').map((character, index) => {
      return {
        character,
        typedStatus: TYPED_STATUS.NONE,
        highlighted: index === 0,
      };
    });
  }, []);

  const getCursorPosition = useCallback(() => {
    return charObjArray
      .map((charObj) => {
        return charObj.highlighted;
      })
      .indexOf(true);
  }, [charObjArray]);

  useEffect(() => {
    try {
      (async () => {
        const string = await getNewString(WORD_COUNT);
        setCharObjArray(strToCharObjArray(string));
      })();
    } catch (error) {
      console.error(error);
    }
  }, [strToCharObjArray]);

  return (
    <div id='typing-widget' tabIndex='0' onKeyDown={(e) => handleKeyPressed(e)}>
      <TypingWidgetText displayText={charObjArray} />
    </div>
  );
}

export default TypingWidget;
