class FileLoader {
  /**
   * @param {string} fileLocation
   * @returns {string} - raw string
   */
  loadTextFile = async (fileLocation) => {
    try {
      const response = await fetch(fileLocation);
      return await response.text();
    } catch (error) {
      console.error(error);
    }
  };
}

export default FileLoader;
