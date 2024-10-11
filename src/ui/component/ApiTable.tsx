import React from 'react';
import { Card, Checkbox, Popover, Table, Tag } from 'antd';
import useMockForgeStore from '../model/state';
import { AddMockResponseButton } from './AddApiResponse';

interface IApiTableProps {
  height: number;
}

export const ApiTable: React.FC<IApiTableProps> = (props) => {
  const mockForgeStore = useMockForgeStore();

  return (
    <Table
      rowKey={(record) => `${record.method}-${record.pathname}`}
      scroll={{ y: props.height }}
      virtual={true}
      pagination={false}
      columns={[
        {
          title: 'Resource',
          dataIndex: 'pathname',
          width: 300,
          render(_val, record) {
            return (
              <div>
                <Tag>{record.method}</Tag>
                {record.pathname}
              </div>
            );
          },
        },
        {
          title: 'Name',
          dataIndex: 'name',
          width: 200,
          render(_val, record) {
            return (
              <div style={{ fontWeight: 'bold' }}>
                <Popover
                  content={
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{record.name}</span>
                      <br />
                      {record.description}
                    </div>
                  }
                >
                  {record.name}
                </Popover>
              </div>
            );
          },
        },
        {
          title: 'Response',
          render(_val, record) {
            return (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  rowGap: 4,
                }}
              >
                {record.mockResponses.map((o) => (
                  <div
                    className="tag-item"
                    key={o.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                      background: '#f5f5f5',
                      borderRadius: 4,
                      marginRight: 4,
                      fontSize: 12,
                    }}
                  >
                    <Checkbox
                      style={{ marginRight: 4 }}
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
                        mockForgeStore.toggleHttpApiResponse(record.method, record.pathname, o.name).catch((err) => {
                          console.log(err);
                        });
                      }}
                    />
                    <Popover
                      trigger="hover"
                      content={
                        <Card style={{ width: 300 }} size="small" title={o.name}>
                          {o.description}
                          <pre style={{ maxHeight: 300, overflow: 'scroll' }}>
                            {JSON.stringify(o.responseData.content, null, 2)}
                          </pre>
                        </Card>
                      }
                    >
                      <div style={{ flexGrow: 1 }}>{o.name}</div>
                    </Popover>
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
  );
};
