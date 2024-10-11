import { cloneDeep, isMatch } from 'lodash-es';
import { match } from 'path-to-regexp';
import queryString from 'query-string';
import { HttpMockResponse, IMockForgeState, MockAPI } from '../sdk/common/types';
import { IMockForgeStateService } from '../server/common/service';

export interface RequestParameters {
  url?: string | URL;
  method?: string;
  headers?: Record<string, string>;
  body?: Document | XMLHttpRequestBodyInit | null | FormData | BodyInit;
}

export interface ValidRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: null | string;
  params?: Record<string, string>;
}

export interface SimulatedResponse {
  status: number;
  body: string;
}

export interface ISimulatedRequestHandler {
  setApiList(apiList: MockAPI[]): void;
  setState(state: IMockForgeState): void;
  handleSimulatedRequest(request: RequestParameters): SimulatedResponse | null;
  logToNetwork(request: RequestParameters, response: SimulatedResponse): void;
}

export class RequestSimulator implements ISimulatedRequestHandler {
  constructor(
    private origin: string,
    private serverURL: string,
    private service: IMockForgeStateService
  ) {}

  private apiCollection: MockAPI[] = [];
  private state: IMockForgeState = {
    http: [],
  };

  setApiList(apiList: MockAPI[]): void {
    this.apiCollection = cloneDeep(apiList);
  }
  setState(state: IMockForgeState): void {
    this.state = cloneDeep(state);
  }

  private getActiveAPIs = () => {
    return this.apiCollection
      .map((o) => {
        const activeAPI = this.state.http.find((s) => s.method === o.method && s.pathname === o.pathname);
        if (!activeAPI) {
          return null;
        }
        return {
          ...o,
          mockResponses: o.mockResponses.filter((o) => activeAPI.activeMockResponses.includes(o.name)),
        };
      })
      .filter((o) => o !== null);
  };

  handleSimulatedRequest(request: RequestParameters): SimulatedResponse | null {
    const res = this._handleSimulatedRequest(request);
    if (!res) {
      console.log(`[MockForge]  skip request, method=${request.method}, url=${request.url}`);
      return null;
    } else {
      console.log(`[MockForge] handle request, method=${request.method}, url=${request.url}, mock data:`, res);
    }
    return {
      status: 200,
      body: JSON.stringify(res?.responseData.content),
    };
  }

  _handleSimulatedRequest(request: RequestParameters): HttpMockResponse | null {
    if (!request.url) {
      return null;
    }
    if (typeof request.body !== 'string' && request.body !== undefined && request.body !== null) {
      return null;
    }
    const normalizedUrl = typeof request.url === 'string' ? new URL(request.url, this.origin) : request.url;
    const urlPath = normalizedUrl.pathname;
    const requestMethod = (request.method || 'GET').toUpperCase();
    const matchingApi = this.findMatchingApi(urlPath, requestMethod);
    if (!matchingApi) {
      return null;
    }
    const matchResponses = this.findMathResponse(matchingApi.api.mockResponses, {
      url: normalizedUrl.href,
      headers: request.headers,
      body: request.body,
      method: requestMethod,
      params: matchingApi.params,
    });
    if (matchResponses.length === 0) {
      return null;
    }
    return matchResponses[0];
  }

  private findMathResponse(mockResponses: HttpMockResponse[], request: ValidRequest): HttpMockResponse[] {
    return mockResponses
      .map((o): null | HttpMockResponse => {
        if (!o.requestMatcher) {
          return o;
        }
        switch (o.requestMatcher.type) {
          case 'basic-match': {
            const query = queryString.parseUrl(request.url).query;
            let parsedBody = request.body;
            if (typeof request.body === 'string') {
              try {
                parsedBody = JSON.parse(request.body);
              } catch (error) {
                // ignore parse error
              }
            }
            if (
              isMatch(
                {
                  body: parsedBody,
                  params: request.params,
                  headers: request.headers,
                  query,
                },
                o.requestMatcher.content
              )
            ) {
              return o;
            }
            return null;
          }
          default: {
            return null;
          }
        }
      })
      .filter((o) => !!o);
  }

  private findMatchingApi(urlPath: string, requestMethod: string) {
    for (const api of this.getActiveAPIs()) {
      if (api.method !== requestMethod) {
        continue;
      }
      const matchFunction = match(api.pathname.replace(/\[(\S+)\]/g, ':$1'));
      const result = matchFunction(urlPath);
      if (!result) {
        continue;
      }
      return {
        api,
        params: JSON.parse(JSON.stringify(result.params)),
      };
    }
  }

  async logToNetwork(request: RequestParameters, response: SimulatedResponse): Promise<void> {
    const uuid = await this.service.registerHttpMockResult({
      status: response.status,
      body: JSON.parse(response.body),
    });
    const requestOption: any = {
      method: request.method,
      headers: {
        ...request.headers,
        'mockforge-result-uuid': uuid,
      },
    };
    if (request.body) {
      requestOption['body'] = request.body;
    }

    const normalizedUrl = typeof request.url === 'string' ? new URL(request.url, this.origin) : request.url;
    if (!normalizedUrl) {
      return;
    }

    await fetch(`${this.serverURL}/mocked/${transformPath(normalizedUrl)}`, requestOption);
  }
}

function transformPath(input: URL): string {
  // 检查输入是否是一个URL
  const url = input;

  // 如果是URL,替换域名中的点为下划线,并移除协议
  const hostname = url.hostname.replace(/\./g, '_');
  const path = url.pathname.replace(/^\//, ''); // 移除开头的斜杠
  return `${hostname}/${path}?${url.searchParams.toString()}`;
}
