export type RPCRequestBody = {
  method: string;
  args: any[];
  clientId: string;
  uuid: string;
};

export type RPCSuccessResponse = {
  success: true;
  data: any;
  clientId: string;
};

export type RPCErrorResponse = {
  success: false;
  errorMessage: string;
  stack?: string;
  clientId: string;
};

export type RPCResponse = RPCSuccessResponse | RPCErrorResponse;

export type MockForgeRpcResponseEvent = {
  internal: true;
  type: 'mock-forge-rpc-callback';
  uuid: string;
  response: RPCResponse;
};

export type HttpMockPIChangeEvent = {
  internal: false;
  clientId: string;

  type: 'http-mock-api-change';
};

export type MockForgeStateChangeEvent = {
  internal: false;
  clientId: string;

  type: 'mock-forge-state-change';
};

export type MockForgeEvent = MockForgeStateChangeEvent | HttpMockPIChangeEvent | MockForgeRpcResponseEvent;

export interface IMockForgeEventListener {
  handleEvent(handler: (event: MockForgeEvent) => void): void;
  removeEventListener(handler: (event: MockForgeEvent) => void): void;
  connect(): Promise<void>;
}

export type MockForgeCallRpcMessage = {
  type: 'mock-forge-call-rpc';
  request: RPCRequestBody;
};

export type MockForgeReceiveMessage = MockForgeCallRpcMessage;
