import Emittery from "emittery";
import type { WebSocket as WsWebsocket } from "ws";
import { MockForgeEvent } from "../../server/common/event";

export interface IMockForgeEventListener {
  handleEvent(handler: (event: MockForgeEvent) => void): void;
  connect(): Promise<void>;
}

export class BrowserMockForgeEventListener implements IMockForgeEventListener {
  private baseUrl: string;
  private clientId: string;
  private ws: WsWebsocket | WebSocket | null = null;
  private emitter: Emittery = new Emittery();

  constructor(baseUrl: string, clientId: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
  }

  protected getWebsocket(
    url: string,
    clientId: string
  ): WebSocket | WsWebsocket {
    return new WebSocket(url, {
      headers: {
        "mock-forge-client-id": clientId,
      },
    });
  }

  handleEvent(handler: (event: MockForgeEvent) => void): void {
    this.emitter.on("event", handler);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl}/rpc`;
      this.ws = this.getWebsocket(wsUrl, this.clientId);
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
        console.log("WebSocket closed");
        this.ws = null;
      };
    });
  }
}
