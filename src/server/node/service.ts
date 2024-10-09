import { nanoid } from 'nanoid';
import { MockForgeSDK } from '../../sdk/node/sdk.js';
import { IMockForgeStateService, InitialState, IHttpMatchedMockResult } from '../common/service.js';
import { IMockForgeState } from '../../sdk/common/types.js';

export class MockForgeStateService extends MockForgeSDK implements IMockForgeStateService {
  private state: IMockForgeState = this.getDefaultMockState();

  private cache = new Map<string, IHttpMatchedMockResult>();

  async getMockForgeState(): Promise<IMockForgeState> {
    return this.state;
  }

  private getDefaultMockState(name?: string) {
    return {
      name,
      http: [],
    };
  }

  async toggleHttpApiResponse(method: string, pathname: string, responseName: string): Promise<void> {
    const previous = this.state.http.find((o) => o.method === method && o.pathname === pathname);
    if (!previous) {
      this.state.http.push({
        method,
        pathname,
        activeMockResponses: [responseName],
      });
    } else {
      if (previous.activeMockResponses.includes(responseName)) {
        previous.activeMockResponses = previous.activeMockResponses.filter((o) => o !== responseName);
      } else {
        previous.activeMockResponses.push(responseName);
      }
    }
  }

  async getInitialState(): Promise<InitialState> {
    const mockAPIs = await this.listMockAPIs();
    const mockState = await this.getMockForgeState();
    const mockStates = await this.listMockStates();
    return {
      mockAPIs,
      mockState,
      mockStates,
    };
  }

  async loadMockState(name: string): Promise<void> {
    const state = await this.readMockState(name);
    if (!state) {
      this.state = this.getDefaultMockState(name);
      return;
    }
    this.state = state;
  }

  async saveCurrentMockState(name: string): Promise<void> {
    this.state.name = name;
    await super.saveMockState(name, { http: this.state.http });
  }

  async registerHttpMockResult(option: IHttpMatchedMockResult): Promise<string> {
    const nanoId = nanoid();
    this.cache.set(nanoId, option);
    return nanoId;
  }

  async getHttpMockResult(uuid: string): Promise<IHttpMatchedMockResult | null> {
    const res = this.cache.get(uuid) || null;
    this.cache.delete(uuid);
    return res;
  }
}
