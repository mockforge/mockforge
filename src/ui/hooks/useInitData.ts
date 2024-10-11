import { useRequest } from 'ahooks';
import useMockForgeStore from '../model/state';
import { MockForgeEvent } from '../../server/common/event';
import { useEffect } from 'react';

export function useInitData(clientId: string) {
  const mockForgeStore = useMockForgeStore();
  const mockStatesStore = useMockForgeStore();
  const mockApiRequest = useRequest(
    () => {
      return mockForgeStore.browserMockForgeStateService.listMockAPIs();
    },
    {
      refreshOnWindowFocus: true,
      onSuccess(data) {
        mockForgeStore.updateApiList(data);
      },
    }
  );
  const mockForgeStateRequest = useRequest(
    () => {
      return mockForgeStore.browserMockForgeStateService.getMockForgeState();
    },
    {
      refreshOnWindowFocus: true,
      onSuccess(data) {
        mockStatesStore.updateCurrentName(data.name);
        mockForgeStore.updateMockForgeState(data);
      },
    }
  );

  const mockStatesList = useRequest(
    () => {
      return mockForgeStore.browserMockForgeStateService.listMockStates();
    },
    {
      refreshOnWindowFocus: true,
      onSuccess(data) {
        mockStatesStore.updateMockStates(data);
      },
    }
  );

  useEffect(() => {
    const handler = (event: MockForgeEvent) => {
      if (event.type === 'http-mock-api-change') {
        mockApiRequest.refresh();
      }
      if (event.type === 'mock-forge-state-change') {
        mockForgeStateRequest.refresh();
        mockStatesList.refresh();
      }
    };
    mockForgeStore.browserMockForgeStateService.handleEvent(handler);
    return () => {
      mockForgeStore.browserMockForgeStateService.removeEventListener(handler);
    };
  }, [clientId]);
}
