import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirname() {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  } else if (typeof import.meta !== 'undefined' && import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    return (__dirname = path.dirname(__filename));
  }
  throw new Error(`Unable to find current dirname`);
}
