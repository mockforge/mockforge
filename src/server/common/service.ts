import { IMockForgeSDK } from '../../sdk/common/sdk.js';
import { IMockForgeState, MockAPI } from '../../sdk/common/types.js';

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
