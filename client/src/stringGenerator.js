import FileReader from './fileReader.js';

const fileReader = new FileReader();

const getWords = (async () => {
  try {
    const text = await fileReader.readTextFile('./text.txt');
    return text.split('\r\n').map((word) => {
      return word.trim();
    });
  } catch (error) {
    console.error(error);
  }
})();

class StringGenerator {
  /**
   * Generates a string of space separated words
   * @param {integer} wordCount - the number of words in the string
   * @returns {string} - space separated string of words drawn from an array of words
   */
  async generateString(wordCount) {
    try {
      const wordsArray = await getWords;
      const randomInt = Math.ceil(
        Math.random() * (wordsArray.length - wordCount)
      );
      return await wordsArray.slice(randomInt, randomInt + wordCount).join(' ');
    } catch (error) {
      console.error(error);
    }
  }
}

export default StringGenerator;
