import React, { useState, useEffect, useCallback } from 'react';
import TypingWidgetText from './typing-widget-text.js';
import StringGenerator from '../../stringGenerator.js';
import './typing-widget.css';

const stringGenerator = new StringGenerator();

const WORD_COUNT = 2;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_ARRAY = (' ' + ALPHABET).split('');
// create an array of all possible char pair combinations from CHAR_ARRAY
const CHAR_ARRAY_PAIRS = CHAR_ARRAY.map((char1) => {
  return CHAR_ARRAY.map((char2) => {
    const charPair = char1 + char2;
    return { charPair: charPair, score: 0 };
  });
});
const TYPED_STATUS = {
  HIT: 'hit',
  MISS: 'miss',
  NONE: 'none',
};

function TypingWidget() {
  const [charObjArray, setCharObjArray] = useState([]);
  const [charArrayPairs, setCharArrayPairs] = useState(CHAR_ARRAY_PAIRS);

  const handleKeyPressed = async (e) => {
    const { key } = e;
    if (CHAR_ARRAY.indexOf(key) !== -1) {
      const cursorPosition = getCursorPosition(charObjArray);
      const stringArray = charObjArray.map((charObj) => charObj.character);
      // was the correct key hit?
      const typedStatus =
        key === stringArray[cursorPosition]
          ? TYPED_STATUS.HIT
          : TYPED_STATUS.MISS;
      if (
        charObjArray.map((obj) => obj.typedStatus)[cursorPosition] ===
        TYPED_STATUS.NONE
      ) {
        updateStats(typedStatus);
      }

      setCharObjArray(await updateCharObjArray(charObjArray, typedStatus));
    }
  };

  const updateStats = (typedStatus) => {
    console.log(typedStatus);
  };

  const updateCharObjArray = async (charObjArray, typedStatus) => {
    const cursorPosition = getCursorPosition(charObjArray);
    const stringArray = charObjArray.map((obj) => obj.character);
    const currentTypedStatus = charObjArray[cursorPosition].typedStatus;
    // update the array of character objects
    if (cursorPosition === stringArray.length - 1) {
      if (typedStatus === TYPED_STATUS.HIT) {
        return strToCharObjArray(await getNewString(WORD_COUNT));
      } else if (typedStatus === TYPED_STATUS.MISS) {
        if (currentTypedStatus === TYPED_STATUS.MISS) {
          return charObjArray;
        } else {
          return charObjArray.map((obj, index) => {
            if (index === cursorPosition) {
              obj.typedStatus = TYPED_STATUS.MISS;
            }
            return obj;
          });
        }
      }
    } else {
      if (typedStatus === TYPED_STATUS.HIT) {
        return charObjArray.map((obj, index) => {
          if (index === cursorPosition) {
            if (obj.typedStatus === TYPED_STATUS.NONE) {
              obj.typedStatus = TYPED_STATUS.HIT;
            }
          }
          obj.highlighted = index === cursorPosition + 1;
          return obj;
        });
      } else if (typedStatus === TYPED_STATUS.MISS) {
        if (currentTypedStatus === TYPED_STATUS.MISS) {
          return charObjArray;
        } else {
          return charObjArray.map((obj, index) => {
            if (index === cursorPosition) {
              obj.typedStatus = TYPED_STATUS.MISS;
            }
            return obj;
          });
        }
      }
    }
    return charObjArray;
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

  const getCursorPosition = useCallback((charObjArray) => {
    return charObjArray
      .map((charObj) => {
        return charObj.highlighted;
      })
      .indexOf(true);
  }, []);

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

  const setOutput = () => {
    //console.log('object');
    return (
      <div
        id='typing-widget'
        tabIndex='0'
        onKeyDown={(e) => handleKeyPressed(e)}
      >
        <TypingWidgetText displayText={charObjArray} />
      </div>
    );
  };

  return setOutput();
}

export default TypingWidget;
