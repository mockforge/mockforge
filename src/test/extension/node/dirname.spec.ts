import { expect, it } from 'vitest';
import { getDirname } from '../../../extension/node/dirname.ts';
import fs from 'fs/promises';

it('should dirname exists', async () => {
  const dirname = getDirname();
  expect((await fs.stat(dirname)).isDirectory()).toBeTruthy();
});
