import { produce } from "immer";
import { create } from "zustand";
import {
  AddHttpMockResponse,
  HttpMockAPI,
  MockAPI,
} from "../../sdk/common/types";
import { IMockForgeEventListener } from "../../server/common/event";
import {
  IMockForgeState,
  IMockForgeStateService,
} from "../../server/common/service";
import { BrowserMockForgeEventListener } from "../service/event";
import { BrowserMockForgeStateService } from "../service/service";

interface MockForgeStore {
  clientId: string;
  browserMockForgeStateService: IMockForgeStateService;
  browserMockForgeEventListener: IMockForgeEventListener;
  mockForgeState: IMockForgeState;
  apiList: MockAPI[];

  updateMockForgeState: (newState: IMockForgeState) => void;
  updateApiList: (newApiList: MockAPI[]) => void;

  isHttpApiResponseSelected: (
    method: string,
    pathname: string,
    responseName: string
  ) => boolean;
  selectSingleHttpApiResponse(
    method: string,
    pathname: string,
    responseName: string
  ): Promise<void>;
  toggleHttpApiResponse: (
    method: string,
    pathname: string,
    responseName: string
  ) => Promise<void>;
  addMockAPI: (mockAPI: MockAPI) => Promise<void>;
  addHttpMockResponse: (
    method: string,
    pathname: string,
    mockResponse: AddHttpMockResponse
  ) => Promise<void>;
  deleteHttpMockResponse: (
    method: string,
    pathname: string,
    mockResponseName: string
  ) => Promise<void>;
}
const clientId = Math.random().toString(36).substring(2, 15);
const browserMockForgeEventListener = new BrowserMockForgeEventListener(
  "",
  clientId
);
browserMockForgeEventListener.connect().then((err) => {
  console.log(err);
});
export const useMockForgeStore = create<MockForgeStore>((set, get) => ({
  mockForgeState: { http: [] },
  apiList: [],
  clientId,
  browserMockForgeStateService: new BrowserMockForgeStateService("", clientId),
  browserMockForgeEventListener: browserMockForgeEventListener,
  updateMockForgeState: (newState) => set({ mockForgeState: newState }),
  updateApiList: (newApiList) => set({ apiList: newApiList }),
  isHttpApiResponseSelected: (method, pathname, responseName) => {
    const { mockForgeState } = get();
    const api = mockForgeState.http.find(
      (api) => api.method === method && api.pathname === pathname
    );
    return api ? api.activeMockResponses.includes(responseName) : false;
  },
  selectSingleHttpApiResponse: async (method, pathname, responseName) => {
    const { mockForgeState, toggleHttpApiResponse } = get();
    const api = mockForgeState.http.find(
      (api) => api.method === method && api.pathname === pathname
    );
    if (api && api.activeMockResponses.length > 0) {
      for (const activeResponseName of api.activeMockResponses) {
        await toggleHttpApiResponse(method, pathname, activeResponseName);
      }
    }
    await toggleHttpApiResponse(method, pathname, responseName);
  },
  toggleHttpApiResponse: async (method, pathname, responseName) => {
    await get().browserMockForgeStateService.toggleHttpApiResponse(
      method,
      pathname,
      responseName
    );
    set((state) => {
      return produce(state, (newState) => {
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
        } else {
          newState.mockForgeState.http.push({
            method,
            pathname,
            activeMockResponses: [responseName],
          });
        }
      });
    });
  },

  addMockAPI: async (mockAPI) => {
    await get().browserMockForgeStateService.addMockAPI(mockAPI);
    set((state) => ({ apiList: [...state.apiList, mockAPI] }));
  },

  addHttpMockResponse: async (method, pathname, mockResponse) => {
    const newHttpMockResponse =
      await get().browserMockForgeStateService.addHttpMockResponse(
        method,
        pathname,
        mockResponse
      );
    set((state) => {
      const newState = { ...state };
      const apiIndex = newState.apiList.findIndex(
        (api) => api.method === method && api.pathname === pathname
      );
      if (apiIndex !== -1) {
        (newState.apiList[apiIndex] as HttpMockAPI).mockResponses.push(
          newHttpMockResponse
        );
      }
      return newState;
    });
  },
  deleteHttpMockResponse: async (method, pathname, mockResponseName) => {
    get().browserMockForgeStateService.deleteHttpMockResponse(
      method,
      pathname,
      mockResponseName
    );
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
