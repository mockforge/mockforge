import fs from 'fs/promises';
import { nanoid } from 'nanoid';
import os from 'os';
import path from 'path';
import { IMockForgeSDK } from '../../../sdk/common/sdk.js';
import { IMockForgeStateService } from '../../../server/common/service.js';
import { createMockForgeServer } from '../../../server/node/server.js';
import { createMockForgeSDKTests } from '../../createMockForgeSDKTests.js';
import { createMockForgeStateServiceTests } from '../../createMockForgeStateService.js';
import { TestBrowserMockForgeEventListener } from './test.js';

(() => {
  let tempDir: string;
  let sdk: IMockForgeSDK;
  createMockForgeSDKTests(
    async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
      const { port } = await createMockForgeServer({
        baseDir: tempDir,
        port: Math.floor(Math.random() * 1000) + 10000,
      });
      const service = new TestBrowserMockForgeEventListener('http://localhost:' + port, nanoid());
      await service.connect();
      sdk = service;
      return sdk;
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
  let sdk: IMockForgeStateService;
  createMockForgeStateServiceTests(
    async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
      const { port } = await createMockForgeServer({
        baseDir: tempDir,
      });
      const service = new TestBrowserMockForgeEventListener('http://localhost:' + port, nanoid());
      await service.connect();
      sdk = service;
      return sdk;
    },
    async () => {
      if (tempDir.includes('mock-forge-sdk-test-')) {
        await fs.rm(tempDir, { recursive: true });
      }
    }
  );
})();
