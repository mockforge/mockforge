import {
  AddHttpMockResponse,
  AddMockAPI,
  HttpMockResponse,
  IMockForgeState,
  MockAPI,
  MockAPIMetadata,
} from './types.js';

export interface IMockForgeSDK {
  /**
   *
   * @param mockAPI The mock API to add
   * @returns The ID of the mock API
   */
  addMockAPI(mockAPI: AddMockAPI): Promise<void>;

  /**
   * List all mock APIs
   * @returns A list of mock APIs
   */
  listMockAPIs(): Promise<MockAPI[]>;
  /**
   *
   * @param method http method
   * @param pathname http pathname
   */
  deleteHttpMockAPI(method: string, pathname: string): Promise<void>;

  /**
   * @param method http method
   * @param pathname http pathname
   * @param data data to update
   */
  updateHttpMockAPI(method: string, pathname: string, data: MockAPIMetadata): Promise<void>;
  /**
   *
   * @param method http method
   * @param pathname http pathname
   * @param mockResponse mock response
   */
  addHttpMockResponse(method: string, pathname: string, mockResponse: AddHttpMockResponse): Promise<HttpMockResponse>;

  /**
   *
   * @param method delete http method
   * @param pathname http pathname
   * @param mockResponseName mock response name
   */
  deleteHttpMockResponse(method: string, pathname: string, mockResponseName: string): Promise<void>;

  /**
   *
   * @param name name of the state
   * @param state
   */
  saveMockState(name: string, state: IMockForgeState): Promise<void>;
  /**
   *
   * @param name name of the state
   */
  deleteMockState(name: string): Promise<void>;
  /**
   *
   * @returns mock state
   * @param name name of the state
   */
  readMockState(name: string): Promise<IMockForgeState | null>;
  /**
   * List all mock states
   */
  listMockStates(): Promise<string[]>;
}
