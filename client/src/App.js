import React, { useEffect, useState } from 'react';
import TypingWidget from './components/typing/typing-widget.js';
import FileLoader from './fileLoader.js';
import './App.css';

const fileLoader = new FileLoader();

function App() {
  const [wordsArray, setWordsArray] = useState([]);

  useEffect(() => {
    // load text file as string then convert to array of words
    fileLoader.loadTextFile('./text.txt').then((text) =>
      setWordsArray(
        text.split('\r\n').map((word) => {
          return word.trim();
        })
      )
    );
  }, []);

  return (
    <div className='App'>
      <TypingWidget wordsArray={wordsArray} />
    </div>
  );
}

export default App;
