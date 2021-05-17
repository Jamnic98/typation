class FileReader {
  /**
   * @param {string} fileLocation
   * @returns {string} - raw string
   */
  readTextFile = async (fileLocation) => {
    try {
      const response = await fetch(fileLocation);
      return await response.text();
    } catch (error) {
      console.error(error);
    }
  };
}

export default FileReader;
