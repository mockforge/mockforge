import { IMockForgeSDK } from "../../sdk/common/sdk.js";

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

export type MockForgeStateChangeEvent = {
  state: IMockForgeState;
};

export interface IMockForgeStateService extends IMockForgeSDK {
  getMockForgeState(): Promise<IMockForgeState>;
  toggleHttpApiResponse(
    method: string,
    pathname: string,
    responseName: string
  ): Promise<void>;
}
