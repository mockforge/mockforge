import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { expect, it, vi } from 'vitest';
import { NodeMockForgeService } from '../../../server/node/nodeMockForgeService.js';
import { createMockForgeServer } from '../../../server/node/server.js';
it('test event listener', async () => {
  let tempDir: string;

  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-forge-sdk-test-'));
  const { port } = await createMockForgeServer({
    baseDir: tempDir,
  });
  const service = new NodeMockForgeService('http://localhost:' + port, 'clientA');
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

  const eventListener = new NodeMockForgeService('ws://localhost:' + port, '12345');
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
