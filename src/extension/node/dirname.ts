export function getDirname() {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    // const __filename = fileURLToPath(import.meta.url);
    return new URL('.', import.meta.url).pathname;
  }
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  throw new Error(`Unable to find current dirname`);
}
