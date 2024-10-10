import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IMockForgeSDK } from '../sdk/common/sdk.js';
import { IMockForgeState, MockAPI } from '../sdk/common/types.js';

export function createMockForgeSDKTests(beforeEachFn: () => Promise<IMockForgeSDK>, afterEachFn: () => Promise<void>) {
  describe('MockForgeSDK', () => {
    let sdk: IMockForgeSDK;

    beforeEach(async () => {
      sdk = await beforeEachFn();
    });

    afterEach(async () => {
      await afterEachFn();
    });

    describe('listMockAPIs', () => {
      it('should return an empty array when no APIs exist', async () => {
        const apis = await sdk.listMockAPIs();
        expect(apis).toEqual([]);
      });

      it('should return existing APIs', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [
            {
              $schema: 'https://unpkg.com/mockforge@0.2.0/json-schema/http_response_v1.json',
              name: 'Default',
              schema: 'http_response_v1' as const,
              description: 'Default response',
              requestMatcher: {
                type: 'basic-match' as const,
                content: {
                  body: {},
                  params: {},
                  headers: {},
                  query: {},
                },
              },
              responseData: {
                type: 'json' as const,
                content: { message: 'Hello, World!' },
              },
            },
          ],
        };

        await sdk.addMockAPI(mockAPI);
        const apis = await sdk.listMockAPIs();
        expect(apis).toHaveLength(1);
        expect(apis[0]).toEqual(mockAPI);
      });
    });

    describe('addMockAPI', () => {
      it('should add a new mock API', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'POST' as const,
          pathname: '/users',
          name: 'Create User',
          description: 'Create a new user',
          mockResponses: [
            {
              $schema: 'https://unpkg.com/mockforge@0.2.0/json-schema/http_response_v1.json',
              name: 'Success',
              schema: 'http_response_v1' as const,
              description: 'Successful response',
              requestMatcher: {
                type: 'basic-match' as const,
                content: {
                  body: { username: 'test' },
                  params: {},
                  headers: {},
                  query: {},
                },
              },
              responseData: {
                type: 'json' as const,
                content: { id: 1, username: 'test' },
              },
            },
          ],
        };

        await sdk.addMockAPI(mockAPI);
        const apis = await sdk.listMockAPIs();
        expect(apis).toHaveLength(1);
        expect(apis[0]).toEqual(mockAPI);
      });

      it('should throw an error when adding an existing API', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [],
        };

        await sdk.addMockAPI(mockAPI);
        await expect(sdk.addMockAPI(mockAPI)).rejects.toThrow('API already exists');
      });
    });

    describe('updateHttpMockAPI', () => {
      it('should update an existing mock API', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [],
        };

        await sdk.addMockAPI(mockAPI);

        const updatedData = {
          name: 'Updated Test API',
          description: 'Updated description',
        };

        await sdk.updateHttpMockAPI(mockAPI.method, mockAPI.pathname, updatedData);

        const apis = await sdk.listMockAPIs();
        expect(apis[0].name).toBe(updatedData.name);
        expect(apis[0].description).toBe(updatedData.description);
      });
    });

    describe('addHttpMockResponse', () => {
      it('should add a new mock response to an existing API', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [],
        };

        await sdk.addMockAPI(mockAPI);

        const newMockResponse = {
          $schema: 'https://unpkg.com/mockforge@0.2.0/json-schema/http_response_v1.json',
          name: 'New Response',
          schema: 'http_response_v1' as const,
          description: 'New mock response',
          requestMatcher: {
            type: 'basic-match' as const,
            content: {
              body: {},
              params: {},
              headers: {},
              query: {},
            },
          },
          responseData: {
            type: 'json' as const,
            content: { message: 'New response' },
          },
        };

        await sdk.addHttpMockResponse(mockAPI.method, mockAPI.pathname, newMockResponse);

        const apis = await sdk.listMockAPIs();
        expect(apis[0].mockResponses).toHaveLength(1);
        expect(apis[0].mockResponses[0]).toEqual(newMockResponse);
      });

      it('should throw an error when adding an existing mock response', async () => {
        const mockAPI: MockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [
            {
              name: 'Existing',
              $schema: 'https://unpkg.com/mockforge@0.2.0/json-schema/http_response_v1.json',
              schema: 'http_response_v1' as const,
              description: 'Existing response',
              requestMatcher: {
                type: 'basic-match' as const,
                content: {
                  body: {},
                  params: {},
                  headers: {},
                  query: {},
                },
              },
              responseData: {
                type: 'json' as const,
                content: { message: 'Existing response' },
              },
            },
          ],
        };

        await sdk.addMockAPI(mockAPI);

        await expect(
          sdk.addHttpMockResponse(mockAPI.method, mockAPI.pathname, mockAPI.mockResponses[0])
        ).rejects.toThrow('Mock response Existing already exists');
      });
    });

    describe('deleteHttpMockResponse', () => {
      it('should delete an existing mock response', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [
            {
              $schema: 'https://unpkg.com/mockforge@0.2.0/json-schema/http_response_v1.json',
              name: 'ToDelete',
              schema: 'http_response_v1' as const,
              description: 'Response to delete',
              requestMatcher: {
                type: 'basic-match' as const,
                content: {
                  body: {},
                  params: {},
                  headers: {},
                  query: {},
                },
              },
              responseData: {
                type: 'json' as const,
                content: { message: 'To be deleted' },
              },
            },
          ],
        };

        await sdk.addMockAPI(mockAPI);

        await sdk.deleteHttpMockResponse(mockAPI.method, mockAPI.pathname, 'ToDelete');

        const apis = await sdk.listMockAPIs();
        expect(apis[0].mockResponses).toHaveLength(0);
      });
    });

    describe('deleteHttpMockAPI', () => {
      it('should delete an existing mock API', async () => {
        const mockAPI = {
          type: 'http' as const,
          method: 'GET' as const,
          pathname: '/test',
          name: 'Test API',
          description: 'Test description',
          mockResponses: [],
        };

        await sdk.addMockAPI(mockAPI);

        await sdk.deleteHttpMockAPI(mockAPI.method, mockAPI.pathname);

        const apis = await sdk.listMockAPIs();
        expect(apis).toHaveLength(0);
      });
    });

    describe('saveMockState', () => {
      it('should save a mock state', async () => {
        const stateName = 'Test State';
        const state: IMockForgeState = {
          http: [
            {
              method: 'GET',
              pathname: '/test',
              activeMockResponses: ['one'],
            },
          ],
        };
        await sdk.saveMockState(stateName, state);
        const savedState = await sdk.readMockState(stateName);
        expect(savedState).toEqual({
          __cache__: '{"http":[{"activeMockResponses":["one"],"method":"GET","pathname":"/test"}],"name":"Test State"}',
          http: [
            {
              activeMockResponses: ['one'],
              method: 'GET',
              pathname: '/test',
            },
          ],
          name: 'Test State',
        });
      });
    });
  });
}
