import { beforeEach, describe, expect, it } from "vitest";
import { RequestSimulator } from "../../inject/RequestSimulator";
import { MockAPI } from "../../sdk/common/types";
import { IMockForgeState } from "../../server/common/service";

describe("RequestSimulator", () => {
  let requestSimulator: RequestSimulator;

  const mockApiList: MockAPI[] = [
    {
      type: "http",
      name: "bookmark",
      pathname: "/api/v1/bookmark/[id]",
      method: "GET",
      mockResponses: [
        {
          name: "one",
          schema: "http_response_v1",
          requestMatcher: {
            type: "basic-match",
            content: {
              params: { id: "1" },
            },
          },
          responseData: {
            type: "json",
            content: {
              title: "1",
            },
          },
        },
      ],
    },
    {
      type: "http",
      name: "login",
      pathname: "/api/v1/login",
      method: "POST",
      mockResponses: [
        {
          name: "one",
          schema: "http_response_v1",
          requestMatcher: null,
          responseData: {
            type: "json",
            content: {},
          },
        },
      ],
    },
  ];

  const mockState: IMockForgeState = {
    http: [
      {
        method: "GET",
        pathname: "/api/v1/bookmark/[id]",
        activeMockResponses: ["one"],
      },
      {
        method: "POST",
        pathname: "/api/v1/login",
        activeMockResponses: ["one"],
      },
    ],
  };

  beforeEach(() => {
    requestSimulator = new RequestSimulator("http://localhost");
    requestSimulator.setApiList(mockApiList);
    requestSimulator.setState(mockState);
  });

  it("should handle GET request with params correctly", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
      url: "api/v1/bookmark/1",
    });
    expect(response).toEqual({ status: 200, body: '{"title":"1"}' });
  });

  it("should handle GET request with params correctly", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
      url: "api/v1/bookmark/2",
    });
    expect(response).toEqual(null);
  });

  it("should handle POST request correctly", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "POST",
      url: "/api/v1/login",
    });

    expect(response).toEqual({ status: 200, body: "{}" });
  });

  it("should return null for non-matching URL", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
      url: "/api/v1/non-existent",
    });

    expect(response).toBeNull();
  });

  it("should return null for non-matching method", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "PUT",
      url: "/api/v1/bookmark/1",
    });

    expect(response).toBeNull();
  });

  it("should return null for non-matching params", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
      url: "/api/v1/bookmark/2",
    });

    expect(response).toBeNull();
  });

  it("should handle request with headers", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
      url: "/api/v1/bookmark/1",
      headers: { "Content-Type": "application/json" },
    });

    expect(response).toEqual({ status: 200, body: '{"title":"1"}' });
  });

  it("should handle request with body", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "POST",
      url: "/api/v1/login",
      body: JSON.stringify({ username: "test", password: "password" }),
    });

    expect(response).toEqual({ status: 200, body: "{}" });
  });

  it("should return null for invalid body type", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "POST",
      url: "/api/v1/login",
      body: new FormData(), // Invalid body type
    });

    expect(response).toBeNull();
  });

  it("should return null when no URL is provided", async () => {
    const response = await requestSimulator.handleSimulatedRequest({
      method: "GET",
    });
    expect(response).toBeNull();
  });
});
