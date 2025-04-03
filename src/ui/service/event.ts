import type { WebSocket as WsWebsocket } from 'ws';
import { BaseMockForgeService } from '../../server/common/baseMockForgeService';

export class BrowserMockForgeService extends BaseMockForgeService {
  constructor(baseUrl: string, clientId: string) {
    super(baseUrl, clientId);
  }

  protected getWebsocket(url: string): WebSocket | WsWebsocket {
    return new WebSocket(url);
  }
}
