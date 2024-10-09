import { WebSocket } from 'ws';
import { MockForgeReceiveMessage, MockForgeRpcResponseEvent, RPCRequestBody, RPCResponse } from '../common/event';
import { MockForgeStateService } from './service';

export class RPCClientManager {
  private rpcClient = new Map();

  constructor(private mockForgeStateService: MockForgeStateService) {}

  onConnect(clientId: string, ws: WebSocket): void {
    this.rpcClient.set(clientId, ws);
    ws.on('close', () => {
      this.rpcClient.delete(clientId);
    });
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString()) as MockForgeReceiveMessage;
      switch (message.type) {
        case 'mock-forge-call-rpc': {
          this.handleMessage(message.request);
          return;
        }
        default: {
          // no thing
        }
      }
    });
  }

  private async handleMessage(request: RPCRequestBody) {
    const { method, args, clientId } = request;
    let response: RPCResponse;
    try {
      const serviceMethod = this.mockForgeStateService[method as keyof MockForgeStateService] as Function;
      if (typeof serviceMethod !== 'function') {
        throw new Error(`Unknown method: ${method}`);
      }
      const result = await serviceMethod.apply(this.mockForgeStateService, args);
      response = {
        success: true,
        data: result,
        clientId,
      };
    } catch (error) {
      response = {
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : '',
        clientId,
      };
    }

    try {
      switch (method as keyof MockForgeStateService) {
        case 'addMockAPI':
        case 'deleteHttpMockAPI':
        case 'deleteHttpMockResponse':
        case 'updateHttpMockAPI':
        case 'addHttpMockResponse': {
          this.broadcastEvent({
            type: 'http-mock-api-change',
            clientId,
          });
          break;
        }

        case 'switchDefaultMockState':
        case 'loadMockState':
        case 'saveCurrentMockState':
        case 'saveMockState':
        case 'deleteMockState':
        case 'toggleHttpApiResponse': {
          this.broadcastEvent({
            type: 'mock-forge-state-change',
            clientId,
          });
          break;
        }

        case 'getInitialState':
        case 'listMockStates':
        case 'listMockAPIs':
        case 'registerHttpMockResult':
        case 'readMockState':
        case 'getMockForgeState':
        case 'getHttpMockResult': {
          break;
        }
      }
    } catch (error) {}

    const callBackMessage: MockForgeRpcResponseEvent = {
      internal: true,
      type: 'mock-forge-rpc-callback',
      uuid: request.uuid,
      response,
    };

    this.rpcClient.get(request.clientId)?.send(JSON.stringify(callBackMessage));
  }

  private broadcastEvent(event: any) {
    this.rpcClient.forEach((ws) => {
      ws.send(JSON.stringify(event));
    });
  }
}
