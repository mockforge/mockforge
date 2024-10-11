import React from 'react';
import { Card, Checkbox, Popover, Table, Tag } from 'antd';
import { createStyles } from 'antd-style';
import useMockForgeStore from '../model/state';
import { AddMockResponseButton } from './AddApiResponse';
import type { ColumnsType } from 'antd/es/table';
import type { MockAPI } from '../../sdk/common/types';

const useStyles = createStyles(({ token }) => ({
  resourceCell: {
    '& .ant-tag': {
      marginRight: token.marginXS,
    },
  },
  nameCell: {
    fontWeight: 'bold',
  },
  responseCell: {
    display: 'flex',
    flexWrap: 'wrap',
    rowGap: token.marginXXS,
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    padding: token.paddingXXS,
    background: token.colorBgContainerDisabled,
    borderRadius: token.borderRadiusSM,
    marginRight: token.marginXXS,
    fontSize: token.fontSizeSM,
  },
  checkbox: {
    marginRight: token.marginXXS,
  },
  popoverContent: {
    width: 300,
    '& pre': {
      maxHeight: 300,
      overflow: 'auto',
    },
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
}));

interface IApiTableProps {
  height: number;
}

// 抽离的组件
const ResourceCell: React.FC<{ record: MockAPI }> = ({ record }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.resourceCell}>
      <Tag>{record.method}</Tag>
      {record.pathname}
    </div>
  );
};

const NameCell: React.FC<{ record: MockAPI }> = ({ record }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.nameCell}>
      <Popover
        content={
          <div>
            <span className={styles.nameCell}>{record.name}</span>
            <br />
            {record.description}
          </div>
        }
      >
        {record.name}
      </Popover>
    </div>
  );
};

const ResponseCell: React.FC<{ record: MockAPI }> = ({ record }) => {
  const { styles } = useStyles();
  const mockForgeStore = useMockForgeStore();

  return (
    <div className={styles.responseCell}>
      {record.mockResponses.map((o) => (
        <div className={styles.tagItem} key={o.name}>
          <Checkbox
            className={styles.checkbox}
            checked={mockForgeStore.isHttpApiResponseSelected(record.method, record.pathname, o.name)}
            onChange={(e) => {
              if (e.nativeEvent.altKey) {
                mockForgeStore.selectSingleHttpApiResponse(record.method, record.pathname, o.name).catch(console.error);
              } else {
                mockForgeStore.toggleHttpApiResponse(record.method, record.pathname, o.name).catch(console.error);
              }
            }}
          />
          <Popover
            placement="bottom"
            trigger="hover"
            content={
              <Card className={styles.popoverContent} size="small" title={o.name}>
                {o.description}
                <pre>{JSON.stringify(o.responseData.content, null, 2)}</pre>
              </Card>
            }
          >
            <div style={{ flexGrow: 1 }}>{o.name}</div>
          </Popover>
        </div>
      ))}
    </div>
  );
};

const ActionsCell: React.FC<{ record: MockAPI }> = ({ record }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.actionsCell}>
      <AddMockResponseButton method={record.method} pathname={record.pathname} />
    </div>
  );
};

export const ApiTable: React.FC<IApiTableProps> = (props) => {
  const mockForgeStore = useMockForgeStore();

  const columns: ColumnsType<MockAPI> = [
    {
      title: 'Resource',
      dataIndex: 'pathname',
      width: 300,
      render: (_, record) => <ResourceCell record={record} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      render: (_, record) => <NameCell record={record} />,
    },
    {
      title: 'Response',
      render: (_, record) => <ResponseCell record={record} />,
    },
    {
      title: 'Actions',
      width: 150,
      render: (_, record) => <ActionsCell record={record} />,
    },
  ];

  return (
    <Table<MockAPI>
      rowKey={(record) => `${record.method}-${record.pathname}`}
      scroll={{ y: props.height }}
      virtual={true}
      pagination={false}
      columns={columns}
      dataSource={mockForgeStore.apiList}
    />
  );
};
