import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockForgeSDK } from "../../../sdk/node/sdk.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

describe("MockForgeSDK", () => {
  let sdk: MockForgeSDK;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mock-forge-sdk-test-"));
    sdk = new MockForgeSDK(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("listMockAPIs", () => {
    it("should return an empty array when no APIs exist", async () => {
      const apis = await sdk.listMockAPIs();
      expect(apis).toEqual([]);
    });

    it("should return existing APIs", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [
          {
            name: "Default",
            schema: "http_response_v1" as const,
            description: "Default response",
            requestMatcher: {
              type: "basic-match" as const,
              content: {
                body: {},
                params: {},
                headers: {},
                query: {},
              },
            },
            responseData: {
              type: "json" as const,
              content: { message: "Hello, World!" },
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

  describe("addMockAPI", () => {
    it("should add a new mock API", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "POST" as const,
        pathname: "/users",
        name: "Create User",
        description: "Create a new user",
        mockResponses: [
          {
            name: "Success",
            schema: "http_response_v1" as const,
            description: "Successful response",
            requestMatcher: {
              type: "basic-match" as const,
              content: {
                body: { username: "test" },
                params: {},
                headers: {},
                query: {},
              },
            },
            responseData: {
              type: "json" as const,
              content: { id: 1, username: "test" },
            },
          },
        ],
      };

      await sdk.addMockAPI(mockAPI);
      const apis = await sdk.listMockAPIs();
      expect(apis).toHaveLength(1);
      expect(apis[0]).toEqual(mockAPI);
    });

    it("should throw an error when adding an existing API", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [],
      };

      await sdk.addMockAPI(mockAPI);
      await expect(sdk.addMockAPI(mockAPI)).rejects.toThrow(
        "API already exists"
      );
    });
  });

  describe("updateHttpMockAPI", () => {
    it("should update an existing mock API", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [],
      };

      await sdk.addMockAPI(mockAPI);

      const updatedData = {
        name: "Updated Test API",
        description: "Updated description",
      };

      await sdk.updateHttpMockAPI(
        mockAPI.method,
        mockAPI.pathname,
        updatedData
      );

      const apis = await sdk.listMockAPIs();
      expect(apis[0].name).toBe(updatedData.name);
      expect(apis[0].description).toBe(updatedData.description);
    });
  });

  describe("addHttpMockResponse", () => {
    it("should add a new mock response to an existing API", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [],
      };

      await sdk.addMockAPI(mockAPI);

      const newMockResponse = {
        name: "New Response",
        schema: "http_response_v1" as const,
        description: "New mock response",
        requestMatcher: {
          type: "basic-match" as const,
          content: {
            body: {},
            params: {},
            headers: {},
            query: {},
          },
        },
        responseData: {
          type: "json" as const,
          content: { message: "New response" },
        },
      };

      await sdk.addHttpMockResponse(
        mockAPI.method,
        mockAPI.pathname,
        newMockResponse
      );

      const apis = await sdk.listMockAPIs();
      expect(apis[0].mockResponses).toHaveLength(1);
      expect(apis[0].mockResponses[0]).toEqual(newMockResponse);
    });

    it("should throw an error when adding an existing mock response", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [
          {
            name: "Existing",
            schema: "http_response_v1" as const,
            description: "Existing response",
            requestMatcher: {
              type: "basic-match" as const,
              content: {
                body: {},
                params: {},
                headers: {},
                query: {},
              },
            },
            responseData: {
              type: "json" as const,
              content: { message: "Existing response" },
            },
          },
        ],
      };

      await sdk.addMockAPI(mockAPI);

      await expect(
        sdk.addHttpMockResponse(
          mockAPI.method,
          mockAPI.pathname,
          mockAPI.mockResponses[0]
        )
      ).rejects.toThrow("Mock response Existing already exists");
    });
  });

  describe("deleteHttpMockResponse", () => {
    it("should delete an existing mock response", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [
          {
            name: "ToDelete",
            schema: "http_response_v1" as const,
            description: "Response to delete",
            requestMatcher: {
              type: "basic-match" as const,
              content: {
                body: {},
                params: {},
                headers: {},
                query: {},
              },
            },
            responseData: {
              type: "json" as const,
              content: { message: "To be deleted" },
            },
          },
        ],
      };

      await sdk.addMockAPI(mockAPI);

      await sdk.deleteHttpMockResponse(
        mockAPI.method,
        mockAPI.pathname,
        "ToDelete"
      );

      const apis = await sdk.listMockAPIs();
      expect(apis[0].mockResponses).toHaveLength(0);
    });
  });

  describe("deleteHttpMockAPI", () => {
    it("should delete an existing mock API", async () => {
      const mockAPI = {
        type: "http" as const,
        method: "GET" as const,
        pathname: "/test",
        name: "Test API",
        description: "Test description",
        mockResponses: [],
      };

      await sdk.addMockAPI(mockAPI);

      await sdk.deleteHttpMockAPI(mockAPI.method, mockAPI.pathname);

      const apis = await sdk.listMockAPIs();
      expect(apis).toHaveLength(0);
    });
  });
});
