import React from 'react';
import { useRequest } from 'ahooks';
import { Checkbox } from 'antd';
import { useEffect } from 'react';
import { MockAPI } from '../sdk/common/types';
import { MockForgeEvent } from '../server/common/event';
import { AddApiForm } from './component/AddApiForm';
import { AddMockResponseButton } from './component/AddApiResponse';
import './index.css';
import useMockForgeStore, { useMockStatesStore } from './model/state';
import { StateTree } from './component/Tree';
import { SaveMockStateButton } from './component/SaveSate';

const APICard: React.FC<{ api: MockAPI }> = (props) => {
  const mockForgeStore = useMockForgeStore();

  return (
    <div className="api-card">
      <div className="api-header">
        <div style={{ display: 'flex' }}>
          <div className="method-tag">{props.api.method}</div>
          <div className="api-title">
            {props.api.pathname}
            <span className="api-name">{props.api.name}</span>
            <div className="api-actions">
              <AddMockResponseButton method={props.api.method} pathname={props.api.pathname} />
            </div>
          </div>
        </div>
        <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>{props.api.description}</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {props.api.mockResponses.map((o) => (
          <div className="tag-item" key={o.name}>
            <Checkbox
              style={{ marginRight: 8 }}
              checked={mockForgeStore.isHttpApiResponseSelected(props.api.method, props.api.pathname, o.name)}
              onChange={(e) => {
                if (e.nativeEvent.altKey) {
                  mockForgeStore
                    .selectSingleHttpApiResponse(props.api.method, props.api.pathname, o.name)
                    .catch((err) => {
                      console.log(err);
                    });
                  return;
                }
                console.log(e.nativeEvent.altKey);
                mockForgeStore.toggleHttpApiResponse(props.api.method, props.api.pathname, o.name).catch((err) => {
                  console.log(err);
                });
              }}
            />
            <div className="tag-name">{o.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function useInitData(clientId: string) {
  const mockForgeStore = useMockForgeStore();
  const mockStatesStore = useMockStatesStore();
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
    mockForgeStore.browserMockForgeEventListener.handleEvent(handler);
    return () => {
      mockForgeStore.browserMockForgeEventListener.removeEventListener(handler);
    };
  }, [clientId, mockApiRequest]);
}

export function App() {
  const mockForgeStore = useMockForgeStore();
  useInitData(mockForgeStore.clientId);
  return (
    <div style={{ padding: 16, height: '100vh', boxSizing: 'border-box', display: 'flex' }}>
      <div style={{ padding: 16, background: 'white', borderRadius: 4, marginRight: 8, width: 300 }}>
        <StateTree></StateTree>
      </div>
      <div
        style={{
          flex: 1,
          padding: 8,
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div className="search-bar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <SaveMockStateButton></SaveMockStateButton>
          <AddApiForm></AddApiForm>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {mockForgeStore.apiList.map((api) => (
            <APICard api={api} />
          ))}
        </div>
      </div>
    </div>
  );
}
