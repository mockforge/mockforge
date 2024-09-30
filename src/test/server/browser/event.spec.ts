import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { expect, it, vi } from 'vitest';
import { createMockForgeServer } from '../../../server/node/server.js';
import { WebSocket } from 'ws';
import { BrowserMockForgeEventListener } from '../../../ui/service/event.js';

class TestBrowserMockForgeEventListener extends BrowserMockForgeEventListener {
  getWebsocket(url: string) {
    return new WebSocket(url);
  }
}

it('test event listener', async () => {
  let tempDir: string;

  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
  const port = await createMockForgeServer({
    baseDir: tempDir,
  });
  const service = new TestBrowserMockForgeEventListener('http://localhost:' + port, 'clientA');
  await service.connect();

  const mockAPI = {
    type: 'http' as const,
    method: 'GET' as const,
    pathname: '/test',
    name: 'Test API',
    description: 'Test description',
    mockResponses: [
      {
        name: 'Default',
        schema: 'http_response_v1' as const,
        description: 'Default response',
        requestMatcher: {
          type: 'basic-match' as const,
          content: {
            body: {},
            params: {},
            headers: {},
            query: {},
          },
        },
        responseData: {
          type: 'json' as const,
          content: { message: 'Hello, World!' },
        },
      },
    ],
  };

  const eventListener = new TestBrowserMockForgeEventListener('ws://localhost:' + port, '12345');
  const mockFn = vi.fn();
  eventListener.handleEvent(mockFn);
  await eventListener.connect();
  await service.addMockAPI(mockAPI);
  await vi.waitUntil(() => {
    return mockFn.mock.calls.length === 1;
  });
  expect(mockFn.mock.calls).toEqual([[{ clientId: 'clientA', type: 'http-mock-api-change' }]]);
  await fs.rm(tempDir, { recursive: true });
});
