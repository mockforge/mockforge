export type HttpMockPIChangeEvent = {
  type: "http-mock-api-change";
  clientId: string;
};

export type MockForgeStateChangeEvent = {
  type: "mock-forge-state-change";
  clientId: string;
};

export type MockForgeEvent = MockForgeStateChangeEvent | HttpMockPIChangeEvent;

export interface IMockForgeEventListener {
  handleEvent(handler: (event: MockForgeEvent) => void): void;
}
