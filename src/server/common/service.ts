import { IMockForgeSDK } from '../../sdk/common/sdk.js';
import { MockAPI } from '../../sdk/common/types.js';

export interface IHttpApiState {
  method: string;
  pathname: string;
  activeMockResponses: string[];
}

export interface IMockForgeState {
  http: IHttpApiState[];
}

export type HttpMockAPIChangeEvent = {
  method: string;
  pathname: string;
};

export interface InitialState {
  mockAPIs: MockAPI[];
  mockState: IMockForgeState;
}

export interface IHttpMatchedMockResult {
  status: number;
  body: unknown;
}

export interface IMockForgeStateService extends IMockForgeSDK {
  getMockForgeState(): Promise<IMockForgeState>;
  toggleHttpApiResponse(method: string, pathname: string, responseName: string): Promise<void>;
  getInitialState(): Promise<InitialState>;

  registerHttpMockResult(option: IHttpMatchedMockResult): Promise<string>;
  getHttpMockResult(uuid: string): Promise<IHttpMatchedMockResult | null>;
}
