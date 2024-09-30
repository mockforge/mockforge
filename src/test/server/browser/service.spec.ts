import fs from 'fs/promises';
import { nanoid } from 'nanoid';
import os from 'os';
import path from 'path';
import { createMockForgeServer } from '../../../server/node/server.js';
import { BrowserMockForgeEventListener } from '../../../ui/service/event.js';
import { createMockForgeSDKTests } from '../../createMockForgeSDKTests.js';
import { createMockForgeStateServiceTests } from '../../createMockForgeStateService.js';
import { WebSocket } from 'ws';

class TestBrowserMockForgeEventListener extends BrowserMockForgeEventListener {
  getWebsocket(url: string) {
    return new WebSocket(url);
  }
}

(() => {
  let tempDir: string;
  let wewe: BrowserMockForgeEventListener;
  createMockForgeSDKTests(
    async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
      const port = await createMockForgeServer({
        baseDir: tempDir,
        port: Math.floor(Math.random() * 1000) + 10000,
      });
      wewe = new TestBrowserMockForgeEventListener('http://localhost:' + port, nanoid());
      await wewe.connect();
      return wewe;
    },
    async () => {
      if (tempDir.includes('mock-forge-sdk-test-')) {
        await fs.rm(tempDir, { recursive: true });
      }
    }
  );
})();

(() => {
  let tempDir: string;
  let wewe: BrowserMockForgeEventListener;
  createMockForgeStateServiceTests(
    async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
      const port = await createMockForgeServer({
        baseDir: tempDir,
      });
      wewe = new TestBrowserMockForgeEventListener('http://localhost:' + port, nanoid());
      await wewe.connect();
      return wewe;
    },
    async () => {
      if (tempDir.includes('mock-forge-sdk-test-')) {
        await fs.rm(tempDir, { recursive: true });
      }
    }
  );
})();
