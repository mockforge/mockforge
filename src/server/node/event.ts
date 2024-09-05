import WebSocket from "ws";
import { IMockForgeEventListener, MockForgeEvent } from "../common/event.js";

export class NodeMockForgeEventListener implements IMockForgeEventListener {
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
      headers: { "mock-forge-client-id": this.clientId },
    });

    this.ws.on("open", () => {
      console.log("WebSocket connected");
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      if (typeof data === "string") {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.clientId !== this.clientId && this.eventHandler) {
            this.eventHandler(parsedData as MockForgeEvent);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      }
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.ws.on("close", () => {
      console.log("WebSocket closed");
    });
  }
}
