import Emittery from "emittery";
import type { WebSocket as WsWebsocket } from "ws";
import {
  IMockForgeEventListener,
  MockForgeEvent,
} from "../../server/common/event";

export class BrowserMockForgeEventListener implements IMockForgeEventListener {
  private baseUrl: string;
  private clientId: string;
  private ws: WsWebsocket | WebSocket | null = null;
  private emitter: Emittery = new Emittery();

  constructor(baseUrl: string, clientId: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
  }

  protected getWebsocket(url: string): WebSocket | WsWebsocket {
    return new WebSocket(url);
  }

  handleEvent(handler: (event: MockForgeEvent) => void): void {
    this.emitter.on("event", handler);
  }
  removeEventListener(handler: (event: MockForgeEvent) => void): void {
    this.emitter.off("event", handler);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl}/api/v1/mockforge/connect?clientId=${this.clientId}`;
      this.ws = this.getWebsocket(wsUrl);
      this.ws.onopen = () => {
        if (this.ws) {
          this.ws.send(JSON.stringify({ clientId: this.clientId }));
          resolve();
        }
      };

      this.ws.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.clientId !== this.clientId) {
          this.emitter.emit("event", data as MockForgeEvent);
        }
      };

      this.ws.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.ws.onclose = () => {
        this.ws = null;
      };
    });
  }
}
