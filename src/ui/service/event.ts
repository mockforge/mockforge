import Emittery from 'emittery';
import { nanoid } from 'nanoid';
import type { WebSocket as WsWebsocket } from 'ws';
import { AddHttpMockResponse, AddMockAPI, HttpMockResponse, MockAPI, MockAPIMetadata } from '../../sdk/common/types';
import { IMockForgeEventListener, MockForgeCallRpcMessage, MockForgeEvent } from '../../server/common/event';
import { RPCRequestBody } from '../../server/common/rpc';
import { IHttpMatchedMockResult, IMockForgeState, IMockForgeStateService } from '../../server/common/service';

class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class BrowserMockForgeService implements IMockForgeEventListener, IMockForgeStateService {
  private ws: WsWebsocket | WebSocket | null = null;
  private emitter: Emittery = new Emittery();

  private pendingRPCs: Map<string, Deferred<any>> = new Map();

  constructor(
    private baseUrl: string,
    private clientId: string
  ) {}

  protected getWebsocket(url: string): WebSocket | WsWebsocket {
    return new WebSocket(url);
  }

  handleEvent(handler: (event: MockForgeEvent) => void): void {
    this.emitter.on('event', handler);
  }
  removeEventListener(handler: (event: MockForgeEvent) => void): void {
    this.emitter.off('event', handler);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl}/api/v1/mockforge/connect?clientId=${this.clientId}`;
      const ws = this.getWebsocket(wsUrl);
      ws.onopen = () => {
        this.ws = ws;
        resolve();
      };
      ws.onmessage = (event: any) => {
        const data: MockForgeEvent = JSON.parse(event.data);
        if (data.internal) {
          switch (data.type) {
            case 'mock-forge-rpc-callback': {
              const rpc = this.pendingRPCs.get(data.uuid);
              if (!rpc) {
                return;
              }
              if (data.response.success) {
                rpc.resolve(data.response.data);
                return;
              } else {
                const res = new Error(data.response.errorMessage);
                res.stack = data.response.stack;
                rpc.reject(res);
              }
              return;
            }
          }
        } else {
          if (data.clientId !== this.clientId) {
            this.emitter.emit('event', data as MockForgeEvent);
          }
        }
      };
      ws.onerror = (error: any) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      ws.onclose = () => {
        this.ws = null;
      };
    });
  }

  private async callRPC(method: string, args: any[]): Promise<any> {
    const requestBody: RPCRequestBody = {
      method,
      args,
      clientId: this.clientId,
      uuid: nanoid(),
    };
    if (!this.ws) {
      throw new Error('websocket is not connected');
    }
    const message: MockForgeCallRpcMessage = {
      type: 'mock-forge-call-rpc',
      request: requestBody,
    };
    const deferred = new Deferred<any>();
    this.pendingRPCs.set(requestBody.uuid, deferred);
    this.ws.send(JSON.stringify(message));
    return deferred.promise;
  }

  async getMockForgeState(): Promise<IMockForgeState> {
    return this.callRPC('getMockForgeState', []);
  }

  async toggleHttpApiResponse(method: string, pathname: string, responseName: string): Promise<void> {
    await this.callRPC('toggleHttpApiResponse', [method, pathname, responseName]);
  }

  async addMockAPI(mockAPI: AddMockAPI): Promise<void> {
    await this.callRPC('addMockAPI', [mockAPI]);
  }

  async listMockAPIs(): Promise<MockAPI[]> {
    return this.callRPC('listMockAPIs', []);
  }

  async deleteHttpMockAPI(method: string, pathname: string): Promise<void> {
    await this.callRPC('deleteHttpMockAPI', [method, pathname]);
  }

  async updateHttpMockAPI(method: string, pathname: string, data: MockAPIMetadata): Promise<void> {
    await this.callRPC('updateHttpMockAPI', [method, pathname, data]);
  }

  async addHttpMockResponse(
    method: string,
    pathname: string,
    mockResponse: AddHttpMockResponse
  ): Promise<HttpMockResponse> {
    return await this.callRPC('addHttpMockResponse', [method, pathname, mockResponse]);
  }

  async deleteHttpMockResponse(method: string, pathname: string, mockResponseName: string): Promise<void> {
    await this.callRPC('deleteHttpMockResponse', [method, pathname, mockResponseName]);
  }

  async getInitialState() {
    return this.callRPC('getInitialState', []);
  }

  async registerHttpMockResult(option: IHttpMatchedMockResult): Promise<string> {
    return this.callRPC('registerHttpMockResult', [option]);
  }

  async getHttpMockResult(uuid: string): Promise<IHttpMatchedMockResult | null> {
    return this.callRPC('getHttpMockResult', [uuid]);
  }
}
