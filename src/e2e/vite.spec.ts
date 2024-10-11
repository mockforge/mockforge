import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { chromium } from 'playwright';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcess } from 'node:child_process';
import stripAnsi from 'strip-ansi';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let devProcess: ChildProcess;
let LOCAL_URL = '';
let MOCK_FORGE_URL = '';

const execAsync = promisify(exec);

describe('Vite Demo Tests', () => {
  beforeEach(async () => {
    const demoDir = path.resolve(__dirname, '../../demo/vite-demo');
    process.chdir(demoDir);

    try {
      await execAsync('pnpm i');
    } catch (error) {
      console.error(`执行错误: ${error}`);
      throw error;
    }

    devProcess = exec('pnpm run dev');
    await new Promise<void>((resolve) => {
      devProcess.stdout!.on('data', (data) => {
        console.log(data.toString());
        const lines = data
          .toString()
          .split('\n')
          .map((o: string) => stripAnsi(o));
        for (const line of lines) {
          if (line.includes('Local:')) {
            LOCAL_URL = line.split('Local:')[1].trim();
          }
          if (line.includes('[MockForge] start at')) {
            MOCK_FORGE_URL = line.split('[MockForge] start at')[1].trim();
          }
        }

        if (LOCAL_URL && MOCK_FORGE_URL) {
          resolve();
        }
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 30 * 1000);

  it('should access MOCK_FORGE_URL and LOCAL_URL', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('MOCK_FORGE_URL', MOCK_FORGE_URL);
    await page.goto(MOCK_FORGE_URL);
    await page.waitForSelector('[data-mock-state="Vite Demo"]');
    await page.click('[data-mock-state="Vite Demo"]');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const cacheDir = path.resolve(__dirname, 'cache-ignore');
    await page.screenshot({ path: path.resolve(cacheDir, 'mockforge.png') });
    await page.goto(LOCAL_URL);
    await page.screenshot({ path: path.resolve(cacheDir, 'vite-demo.png') });
    await page.waitForSelector('#results', { state: 'hidden' });
    const results = await page.textContent('#results');
    expect(results).toMatchInlineSnapshot(
      `"[{"title":"GET /one","passed":true},{"title":"POST /two","passed":true},{"title":"GET /data.json","passed":true}]"`
    );
    await browser.close();
  }, 100000);

  afterEach(() => {
    if (devProcess) {
      devProcess.kill();
    }
  });
});
