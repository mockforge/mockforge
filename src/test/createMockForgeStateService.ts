import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IMockForgeStateService } from "../server/common/service.js";

export function createMockForgeStateServiceTests(
  beforeEachFn: () => Promise<IMockForgeStateService>,
  afterEachFn: () => Promise<void>
) {
  describe("IMockForgeStateService", () => {
    let service: IMockForgeStateService;

    beforeEach(async () => {
      service = await beforeEachFn();
    });

    afterEach(async () => {
      await afterEachFn();
    });

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

      await service.addMockAPI(mockAPI);
      await service.toggleHttpApiResponse(
        mockAPI.method,
        mockAPI.pathname,
        mockAPI.mockResponses[0].name
      );

      const aaa = await service.getMockForgeState();
      expect(aaa).toEqual({
        http: [
          {
            method: "POST",
            pathname: "/users",
            activeMockResponses: ["Success"],
          },
        ],
      });
    });
  });
}
