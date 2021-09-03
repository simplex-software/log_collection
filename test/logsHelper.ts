import { unlink, open } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const generateLog = async (filepath: string, amountOfLines: number = 5, amountOfCharacters?: number) => {
  const file = fs.createWriteStream(path.resolve(filepath));
  let text = "";

  for (let i = 1; i <= amountOfLines; i++) {
    switch (amountOfCharacters) {
      case undefined:
        const commonLine = `${i} - ${loremIpsum}${i < amountOfLines ? "\n" : ""}`;
        text = text.concat(commonLine);
        file.write(commonLine);
        break;
      default:
        let line = `${i} - `;
        while (line.length < amountOfCharacters) {
          line = line.concat(loremIpsum);
        }
        const endLine = line.slice(0, amountOfCharacters).concat(`${i < amountOfLines ? "\n" : ""}`);
        text = text.concat(endLine);
        file.write(endLine);
    }
  }

  file.close();
  return { text }
}

const deleteLog = async (filepath: string): Promise<boolean> => {
  const rm = await unlink(path.resolve(filepath));
  return rm === undefined;
}

export { generateLog, deleteLog };

