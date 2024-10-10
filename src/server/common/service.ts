import { IMockForgeSDK } from '../../sdk/common/sdk.js';
import { IMockForgeState, MockAPI } from '../../sdk/common/types.js';

export type HttpMockAPIChangeEvent = {
  method: string;
  pathname: string;
};

export interface InitialState {
  mockStates: string[];
  mockAPIs: MockAPI[];
  mockState: IMockForgeState;
}

export interface IHttpMatchedMockResult {
  status: number;
  body: unknown;
}

export interface IMockForgeStateService extends IMockForgeSDK {
  getInitialState(): Promise<InitialState>;
  getMockForgeState(): Promise<IMockForgeState>;

  toggleHttpApiResponse(method: string, pathname: string, responseName: string): Promise<void>;

  loadMockState(name: string): Promise<IMockForgeState>;
  saveCurrentMockState(name: string): Promise<string[]>;
  switchDefaultMockState(): Promise<void>;

  registerHttpMockResult(option: IHttpMatchedMockResult): Promise<string>;
  getHttpMockResult(uuid: string): Promise<IHttpMatchedMockResult | null>;
}
