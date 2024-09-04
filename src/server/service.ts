import { MockForgeSDK } from "../sdk/node/sdk.js";
import { IMockForgeState } from "./common/service.js";

export class MockForgeStateService extends MockForgeSDK {
  private state: IMockForgeState = {
    http: [],
  };

  async getMockForgeState(): Promise<IMockForgeState> {
    return this.state;
  }

  async toggleHttpApiResponse(
    method: string,
    pathname: string,
    responseName: string
  ): Promise<void> {
    const previous = this.state.http.find(
      (o) => o.method === method && o.pathname === pathname
    );
    if (!previous) {
      this.state.http.push({
        method,
        pathname,
        activeMockResponses: [responseName],
      });
    } else {
      if (previous.activeMockResponses.includes(responseName)) {
        previous.activeMockResponses = previous.activeMockResponses.filter(
          (o) => o !== responseName
        );
      } else {
        previous.activeMockResponses.push(responseName);
      }
    }
  }
}
