import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { chromium } from 'playwright';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcess } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let devProcess: ChildProcess;
let LOCAL_URL = '';
let MOCK_FORGE_URL = '';

describe('Vite Demo Tests', () => {
  beforeEach(async () => {
    const demoDir = path.resolve(__dirname, '../../demo/vite-demo');
    process.chdir(demoDir);
    devProcess = exec('pnpm run dev');
    await new Promise<void>((resolve) => {
      devProcess.stdout!.on('data', (data) => {
        console.log(data.toString());
        const lines = data.toString().split('\n');
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
    await page.screenshot({ path: path.resolve(__dirname, 'cache/mockforge.png') });
    await page.goto(LOCAL_URL);
    await page.screenshot({ path: path.resolve(__dirname, 'cache/vite-demo.png') });

    expect(await page.innerHTML('body')).toMatchFileSnapshot('vite-demo-e2e.html');
    await browser.close();
  }, 100000);

  afterEach(() => {
    if (devProcess) {
      devProcess.kill();
    }
  });
});
