import type { TreeDataNode } from 'antd';
import { Button, Tree } from 'antd';
import React from 'react';
import { useMockStatesStore } from '../model/state';
import { DeleteOutlined } from '@ant-design/icons';

const { DirectoryTree } = Tree;

const DefaultKey = `${Math.random()}-${Math.random()}-${Date.now()}`;

export const StateTree: React.FC = () => {
  const treeData = useMockStatesStore((state): TreeDataNode[] => {
    const mockStatesNodes: TreeDataNode[] = state.mockStates.map((o) => {
      return {
        title: o,
        key: o,
        isLeaf: true,
      };
    });
    const defaultNodes: TreeDataNode[] = [
      {
        title: 'Default',
        key: DefaultKey,
        isLeaf: true,
      },
    ];
    return defaultNodes.concat(mockStatesNodes);
  });

  const selectedKeys = useMockStatesStore((o) => {
    return [o.currentMockState ?? DefaultKey];
  });

  const { loadMockState, deleteMockState, switchDefaultMockState } = useMockStatesStore();
  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0];
    if (key === DefaultKey) {
      switchDefaultMockState();
      return;
    }
    loadMockState(String(key));
  };

  const titleRender = (nodeData: TreeDataNode) => (
    <div style={{ display: 'inline-flex', width: '80%', justifyContent: 'space-between', alignItems: 'center' }}>
      {typeof nodeData.title === 'string' && <span style={{ width: 100 }}>{nodeData.title}</span>}
      {nodeData.key !== DefaultKey && (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            deleteMockState(String(nodeData.key));
          }}
        />
      )}
    </div>
  );

  return (
    <div>
      <div>Mock States</div>
      <DirectoryTree
        defaultExpandAll
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        selectable
        treeData={treeData}
        titleRender={titleRender}
      />
    </div>
  );
};
