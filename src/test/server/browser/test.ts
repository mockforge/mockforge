import { BrowserMockForgeService } from '../../../ui/service/event';
import { WebSocket } from 'ws';
export class TestBrowserMockForgeEventListener extends BrowserMockForgeService {
  getWebsocket(url: string) {
    return new WebSocket(url);
  }
}
