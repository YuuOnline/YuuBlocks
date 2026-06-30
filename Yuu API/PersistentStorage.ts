import { Files } from "./Files";


export const PersistentStorage = {
  get,
  update,
}


/**
 * Get a stored file
 * @param folderPath if in the top level use an empty string, a sub folder can be specified, ie. 'subFolderName'
 * @param fileName to get
 * @param extension of the file
 * @returns string if file and contents found, or undefined if something went wrong
 */
function get(folderPath: string, fileName: string, extension: string): string | undefined {
  const settingsString = Files.text.get('vm', folderPath, fileName, extension);

  return settingsString;
}

/**
 * Updates a stored file, creates the file if it doesn't already exist
 */
function update(folderPath: string, fileName: string, extension: string, contents: string) {
  Files.text.update('vm', folderPath, fileName, extension, contents);
}
