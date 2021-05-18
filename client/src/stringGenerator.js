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

  getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  async generateString(wordCount) {
    try {
      const wordsArray = await getWords;
      const randomInt = Math.ceil(
        Math.random() * (wordsArray.length - wordCount - 1)
      );
      return await this.getRandom(wordsArray, wordCount).join(' ');
    } catch (error) {
      console.error(error);
    }
  }
}

export default StringGenerator;
