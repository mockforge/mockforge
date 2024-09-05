import { MockAPI } from "../sdk/common/types";
import { match } from "path-to-regexp";
import { IMockForgeState } from "../server/common/service";

export interface RequestParameters {
  url?: string | URL;
  method?: string;
  headers?: Record<string, string>;
  body?: Document | XMLHttpRequestBodyInit | null;
}

export interface SimulatedResponse {
  status: number;
  body: string;
}

export interface ISimulatedRequestHandler {
  setApiList(apiList: MockAPI[]): void;
  setState(state: IMockForgeState): void;
  handleSimulatedRequest(
    request: RequestParameters
  ): Promise<SimulatedResponse | null>;
}

export class RequestSimulator implements ISimulatedRequestHandler {
  private apiCollection: MockAPI[] = [];
  private state: IMockForgeState = {
    http: [],
  };

  setApiList(apiList: MockAPI[]): void {
    this.apiCollection = apiList;
  }
  setState(state: IMockForgeState): void {
    this.state = state;
  }

  private get activeAPIs() {
    return this.apiCollection
      .map((o) => {
        const activeAPI = this.state.http.find(
          (s) => s.method === o.method && s.pathname === o.pathname
        );
        if (!activeAPI) {
          return null;
        }
        return {
          ...o,
          mockResponses: o.mockResponses.filter((o) =>
            activeAPI.activeMockResponses.includes(o.name)
          ),
        };
      })
      .filter((o) => o !== null);
  }

  async handleSimulatedRequest(
    request: RequestParameters
  ): Promise<SimulatedResponse | null> {
    if (!request.url) {
      return null;
    }
    const normalizedUrl =
      typeof request.url === "string" ? new URL(request.url) : request.url;

    const urlPath = normalizedUrl.pathname;
    const requestMethod = request.method || "GET";
    const matchingApi = this.findMatchingApi(urlPath, requestMethod);
    if (!matchingApi) {
      return null;
    }

    return null;
  }

  private findMatchingApi(urlPath: string, requestMethod: string) {
    return this.activeAPIs.find((api) => {
      if (api.method !== requestMethod) {
        return false;
      }
      const matchFunction = match(api.pathname.replace(/\[(\S+)\]/g, ":$1"));
      const result = matchFunction(urlPath);
      return {
        api,
      };
    });
  }
}
