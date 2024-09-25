import { nanoid } from 'nanoid';
import { MockForgeSDK } from '../../sdk/node/sdk.js';
import { IMockForgeState, IMockForgeStateService, InitialState, IHttpMatchedMockResult } from '../common/service.js';

export class MockForgeStateService extends MockForgeSDK implements IMockForgeStateService {
  private state: IMockForgeState = {
    http: [],
  };

  private cache = new Map<string, IHttpMatchedMockResult>();

  async getMockForgeState(): Promise<IMockForgeState> {
    return this.state;
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
    return {
      mockAPIs,
      mockState,
    };
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
