import { create } from "zustand";
import { HttpMockAPI, HttpMockResponse, MockAPI } from "../../sdk/common/types";
import { IMockForgeState } from "../../server/common/service";

interface MockForgeStore {
  mockForgeState: IMockForgeState;
  apiList: MockAPI[];

  updateMockForgeState: (newState: IMockForgeState) => void;
  updateApiList: (newApiList: MockAPI[]) => void;
  isHttpApiResponseSelected: (
    method: string,
    pathname: string,
    responseName: string
  ) => boolean;
  toggleHttpApiResponse: (
    method: string,
    pathname: string,
    responseName: string
  ) => void;
  addMockAPI: (mockAPI: MockAPI) => Promise<void>;
  addHttpMockResponse: (
    method: string,
    pathname: string,
    mockResponse: HttpMockResponse
  ) => Promise<void>;
  deleteHttpMockResponse: (
    method: string,
    pathname: string,
    mockResponseName: string
  ) => Promise<void>;
}

export const useMockForgeStore = create<MockForgeStore>((set, get) => ({
  mockForgeState: { http: [] },
  apiList: [],

  updateMockForgeState: (newState) => set({ mockForgeState: newState }),
  updateApiList: (newApiList) => set({ apiList: newApiList }),

  isHttpApiResponseSelected: (method, pathname, responseName) => {
    const { mockForgeState } = get();
    const api = mockForgeState.http.find(
      (api) => api.method === method && api.pathname === pathname
    );
    return api ? api.activeMockResponses.includes(responseName) : false;
  },

  toggleHttpApiResponse: (method, pathname, responseName) => {
    set((state) => {
      const newState = { ...state };
      const apiIndex = newState.mockForgeState.http.findIndex(
        (api) => api.method === method && api.pathname === pathname
      );
      if (apiIndex !== -1) {
        const api = newState.mockForgeState.http[apiIndex];
        const responseIndex = api.activeMockResponses.indexOf(responseName);
        if (responseIndex === -1) {
          api.activeMockResponses.push(responseName);
        } else {
          api.activeMockResponses.splice(responseIndex, 1);
        }
      }
      return newState;
    });
  },

  addMockAPI: async (mockAPI) => {
    set((state) => ({ apiList: [...state.apiList, mockAPI] }));
  },

  addHttpMockResponse: async (method, pathname, mockResponse) => {
    set((state) => {
      const newState = { ...state };
      const apiIndex = newState.apiList.findIndex(
        (api) => api.method === method && api.pathname === pathname
      );
      if (apiIndex !== -1) {
        (newState.apiList[apiIndex] as HttpMockAPI).mockResponses.push(
          mockResponse
        );
      }
      return newState;
    });
  },

  deleteHttpMockResponse: async (method, pathname, mockResponseName) => {
    set((state) => {
      const newState = { ...state };
      const apiIndex = newState.apiList.findIndex(
        (api) => api.method === method && api.pathname === pathname
      );
      if (apiIndex !== -1) {
        const api = newState.apiList[apiIndex] as HttpMockAPI;
        api.mockResponses = api.mockResponses.filter(
          (response) => response.name !== mockResponseName
        );
      }
      return newState;
    });
  },
}));

export default useMockForgeStore;
