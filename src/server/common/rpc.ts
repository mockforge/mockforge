export type RPCRequestBody = {
  method: string;
  args: any[];
  clientId: string;
};

export type RPCSuccessResponse = {
  success: true;
  data: any;
  clientId: string;
};

export type RPCErrorResponse = {
  success: false;
  errorMessage: string;
  clientId: string;
};

export type RPCResponse = RPCSuccessResponse | RPCErrorResponse;
