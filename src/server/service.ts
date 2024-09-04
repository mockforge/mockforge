export interface IHttpApiState {
  method: string;
  pathname: string;
  activeMockResponses: string[];
}

export interface IMockForgeState {
  http: IHttpApiState[];
}

// 同构的 IMockForgeService
export interface IMockForgeStateService {
  getMockForgeState(): Promise<IMockForgeState>;
  toggleHttpApiResponse(
    method: string,
    pathname: string,
    responseName: string
  ): Promise<void>;
}
