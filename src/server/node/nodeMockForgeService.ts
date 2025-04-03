import { WebSocket } from 'ws';
import { BaseMockForgeService } from '../common/baseMockForgeService';

export class NodeMockForgeService extends BaseMockForgeService {
  getWebsocket(url: string) {
    return new WebSocket(url);
  }
}
