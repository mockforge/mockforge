import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirname() {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
  }
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  throw new Error(`Unable to find current dirname`);
}
