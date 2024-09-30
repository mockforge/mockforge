import { AddHttpMockResponse, AddMockAPI, HttpMockResponse, MockAPI, MockAPIMetadata } from './types.js';

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

  deleteHttpMockResponse(method: string, pathname: string, mockResponseName: string): Promise<void>;
}
