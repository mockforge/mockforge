import cors from 'cors';
import express, { Request, Response } from 'express';
import getPort from 'get-port';
import { createServer } from 'node:http';
import querystring from 'query-string';
import { WebSocket, WebSocketServer } from 'ws';
import { serverDebugLog } from '../../logger/node.js';
import { MockForgeStateService } from './service.js';
import { RPCClientManager } from './rpc-service.js';

export interface CreateMockForgeServerOption {
  baseDir: string;
  port?: number;
  static?: string[];
}

const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 1000; // 1 second

export async function createMockForgeServer(option: CreateMockForgeServerOption): Promise<number> {
  serverDebugLog(`start option ${JSON.stringify(option)}`);

  return new Promise((resolve, reject) => {
    const startServerWithRetry = async (retryCount: number) => {
      try {
        const serverPort = await getPort({ port: option.port || 50930 });
        serverDebugLog(`Attempting to start server on port ${serverPort}`);

        const server = createServer();
        const wss = new WebSocketServer({ server });

        server.listen(serverPort, () => {
          const address = server.address();
          serverDebugLog(`server address ${JSON.stringify(address)}`);
          if (address && typeof address === 'object') {
            setupApp(server, wss, option);
            resolve(address.port);
          } else {
            reject(new Error('Failed to get server address'));
          }
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE' && retryCount < MAX_RETRY_COUNT) {
            serverDebugLog(`Port ${serverPort} is in use, retrying... (${retryCount + 1}/${MAX_RETRY_COUNT})`);
            setTimeout(() => startServerWithRetry(retryCount + 1), RETRY_DELAY);
          } else {
            reject(error);
          }
        });
      } catch (error) {
        if (retryCount < MAX_RETRY_COUNT) {
          serverDebugLog(`Failed to get a port, retrying... (${retryCount + 1}/${MAX_RETRY_COUNT})`);
          setTimeout(() => startServerWithRetry(retryCount + 1), RETRY_DELAY);
        } else {
          reject(error);
        }
      }
    };

    startServerWithRetry(0);
  });
}

function setupApp(server: any, wss: WebSocketServer, option: CreateMockForgeServerOption) {
  const app = express();
  app.use(express.json());
  app.use(cors());
  const mockForgeStateService = new MockForgeStateService(option.baseDir);
  const rpcClientManager = new RPCClientManager(mockForgeStateService);

  if (option.static) {
    option.static.forEach((e) => {
      serverDebugLog(`register static dir` + e);
      app.use(express.static(e));
    });
  }

  app.get('/api/v1/mockforge/state', async (_req: Request, res: Response) => {
    res.json(await mockForgeStateService.getInitialState());
  });

  app.all('/mocked/*', async (req: Request, res: Response) => {
    const uuid = req.get('mockforge-result-uuid');
    if (!uuid) {
      res.status(404).send('Missing mock result uuid');
      return;
    }
    const result = await mockForgeStateService.getHttpMockResult(uuid);
    if (!result) {
      res.status(404).send('Mock result not found');
      return;
    }
    res.status(result.status).json(result.body);
  });

  wss.on('connection', (ws: WebSocket, req: Request) => {
    const parseResult = querystring.parseUrl(req.url);
    const url = parseResult.url;
    const clientId = String(parseResult.query.clientId);
    if (clientId && url === '/api/v1/mockforge/connect') {
      rpcClientManager.onConnect(clientId, ws);
    } else {
      ws.close();
    }
  });

  server.on('request', app);
}
