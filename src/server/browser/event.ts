import { IMockForgeEventListener, MockForgeEvent } from "../common/event.js";

export class BrowserMockForgeEventListener implements IMockForgeEventListener {
  private baseUrl: string;
  private clientId: string;
  private ws: WebSocket | null = null;
  private eventHandler: ((event: MockForgeEvent) => void) | null = null;

  constructor(baseUrl: string, clientId: string) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
  }

  handleEvent(handler: (event: MockForgeEvent) => void): void {
    this.eventHandler = handler;
    this.connect();
  }

  private connect(): void {
    const wsUrl = `${this.baseUrl}/rpc`;
    this.ws = new WebSocket(wsUrl, {
      headers: {
        "mock-forge-client-id": this.clientId,
      },
    });

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.ws) {
        this.ws.send(JSON.stringify({ clientId: this.clientId }));
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.clientId !== this.clientId && this.eventHandler) {
        this.eventHandler(data as MockForgeEvent);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }
}
