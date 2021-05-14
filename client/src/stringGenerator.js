class StringGenerator {
  constructor(wordsArray) {
    this.wordsArray = wordsArray;
  }

  /**
   * Generates a string of space separated words
   * @param {integer} wordCount - the number of words in the string
   * @returns {string} - space separated string of words drawn from an array of words
   */
  generateString(wordCount) {
    return this.wordsArray
      .slice(Math.random() * wordCount, wordCount)
      .join(' ');
  }
}

export default StringGenerator;
