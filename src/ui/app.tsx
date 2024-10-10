import React, { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Checkbox, Table } from 'antd';
import { MockForgeEvent } from '../server/common/event';
import { AddApiForm } from './component/AddApiForm';
import { AddMockResponseButton } from './component/AddApiResponse';
import './index.css';
import useMockForgeStore from './model/state';
import { StateTree } from './component/Tree';
import { SaveMockStateButton } from './component/SaveSate';

import { createStyles } from 'antd-style';

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: unset;
          }
        }
      }
    `,
  };
});

function useInitData(clientId: string) {
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

export function App() {
  const mockForgeStore = useMockForgeStore();
  useInitData(mockForgeStore.clientId);
  const { styles } = useStyle();

  return (
    <div style={{ height: '100vh', boxSizing: 'border-box', display: 'flex' }}>
      <div style={{ padding: 16, background: 'white', width: 250 }}>
        <StateTree></StateTree>
      </div>
      <div
        style={{
          flex: 1,
          padding: 16,
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
          <Table
            rowKey={(record) => `${record.method}-${record.pathname}`}
            bordered
            scroll={{ y: 680 }}
            className={styles.customTable}
            virtual={true}
            pagination={false}
            columns={[
              {
                title: 'Method',
                dataIndex: 'method',
                width: 100,
              },
              {
                title: 'API',
                dataIndex: 'pathname',
                width: 300,
              },
              {
                title: 'name',
                dataIndex: 'name',
                width: 200,
                render(_val, record) {
                  return (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                      <div className="two-line">{record.description}</div>
                    </div>
                  );
                },
              },
              {
                title: 'Mock Response',
                render(_val, record) {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                      }}
                    >
                      {record.mockResponses.map((o) => (
                        <div className="tag-item" key={o.name}>
                          <Checkbox
                            style={{ marginRight: 8 }}
                            checked={mockForgeStore.isHttpApiResponseSelected(record.method, record.pathname, o.name)}
                            onChange={(e) => {
                              if (e.nativeEvent.altKey) {
                                mockForgeStore
                                  .selectSingleHttpApiResponse(record.method, record.pathname, o.name)
                                  .catch((err) => {
                                    console.log(err);
                                  });
                                return;
                              }
                              console.log(e.nativeEvent.altKey);
                              mockForgeStore
                                .toggleHttpApiResponse(record.method, record.pathname, o.name)
                                .catch((err) => {
                                  console.log(err);
                                });
                            }}
                          />
                          <div className="tag-name">{o.name}</div>
                        </div>
                      ))}
                    </div>
                  );
                },
              },
              {
                title: 'Actions',
                width: 150,
                render(_val, record) {
                  return (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <AddMockResponseButton method={record.method} pathname={record.pathname} />
                    </div>
                  );
                },
              },
            ]}
            dataSource={mockForgeStore.apiList}
          />
        </div>
      </div>
    </div>
  );
}
