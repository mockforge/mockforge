import cors from 'cors';
import express, { Request, Response } from 'express';
import getPort from 'get-port';
import { createServer } from 'node:http';
import querystring from 'query-string';
import { WebSocket, WebSocketServer } from 'ws';
import { serverDebugLog } from '../../logger/node.js';
import { RPCRequestBody, RPCResponse } from './../common/rpc.js';
import { MockForgeStateService } from './service.js';
import { RPCClientManager } from './rpc-service.js';

export interface CreateMockForgeServerOption {
  baseDir: string;
  port?: number;
  static?: string[];
}

export async function createMockForgeServer(option: CreateMockForgeServerOption): Promise<number> {
  serverDebugLog(`start option ${JSON.stringify(option)}`);
  const serverPort = await getPort({ port: option.port || 50930 });
  return new Promise((resolve, reject) => {
    const app = express();
    const server = createServer(app);
    const wss = new WebSocketServer({ server });
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

    serverDebugLog(`start listen at ${serverPort}`);
    server.listen(serverPort, () => {
      const address = server.address();
      serverDebugLog(`server address ${JSON.stringify(address)}`);
      if (address && typeof address === 'object') {
        resolve(address.port);
      } else {
        reject(new Error('Failed to get server address'));
      }
    });
    server.on('error', (error) => {
      reject(error);
    });
  });
}
