import {
  HttpMockResponse,
  MockAPI,
  MockAPIMetadata,
} from "../../sdk/common/types.js";
import { RPCRequestBody, RPCResponse } from "../../server/common/rpc.js";
import {
  IMockForgeState,
  IMockForgeStateService,
} from "../../server/common/service.js";

export class BrowserMockForgeStateService implements IMockForgeStateService {
  private baseURL: string;
  private clientId: string;

  constructor(baseURL: string, clientId?: string) {
    this.baseURL = baseURL;
    this.clientId = clientId ?? Math.random().toString(36).substring(2, 15);
  }

  private async callRPC(method: string, args: any[]): Promise<any> {
    const requestBody: RPCRequestBody = {
      method,
      args,
      clientId: this.clientId,
    };

    const response = await fetch(`${this.baseURL}/api/v1/mockforge/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: RPCResponse = (await response.json()) as RPCResponse;
    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    return result.data;
  }

  async getMockForgeState(): Promise<IMockForgeState> {
    return this.callRPC("getMockForgeState", []);
  }

  async toggleHttpApiResponse(
    method: string,
    pathname: string,
    responseName: string
  ): Promise<void> {
    await this.callRPC("toggleHttpApiResponse", [
      method,
      pathname,
      responseName,
    ]);
  }

  async addMockAPI(mockAPI: MockAPI): Promise<void> {
    await this.callRPC("addMockAPI", [mockAPI]);
  }

  async listMockAPIs(): Promise<MockAPI[]> {
    return this.callRPC("listMockAPIs", []);
  }

  async deleteHttpMockAPI(method: string, pathname: string): Promise<void> {
    await this.callRPC("deleteHttpMockAPI", [method, pathname]);
  }

  async updateHttpMockAPI(
    method: string,
    pathname: string,
    data: MockAPIMetadata
  ): Promise<void> {
    await this.callRPC("updateHttpMockAPI", [method, pathname, data]);
  }

  async addHttpMockResponse(
    method: string,
    pathname: string,
    mockResponse: HttpMockResponse
  ): Promise<void> {
    await this.callRPC("addHttpMockResponse", [method, pathname, mockResponse]);
  }

  async deleteHttpMockResponse(
    method: string,
    pathname: string,
    mockResponseName: string
  ): Promise<void> {
    await this.callRPC("deleteHttpMockResponse", [
      method,
      pathname,
      mockResponseName,
    ]);
  }
}
