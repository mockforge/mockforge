import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { Button, Tree } from 'antd';
import React from 'react';
import useMockForgeStore from '../model/state';
import { listToTree } from '../utils/list-to-tree';
import styles from './tree.module.css';

const DefaultKey = `${Math.random()}-${Math.random()}-${Date.now()}`;

export const StateTree: React.FC = () => {
  const treeData = useMockForgeStore((state): TreeDataNode[] => {
    const defaultNodes: TreeDataNode[] = [
      {
        title: 'Default',
        key: DefaultKey,
        selectable: true,
      },
    ];
    return defaultNodes.concat(listToTree(state.mockStates));
  });

  const selectedKeys = useMockForgeStore((o) => {
    return [o.currentMockState ?? DefaultKey];
  });

  const { loadMockState, deleteMockState, switchDefaultMockState } = useMockForgeStore();
  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0];
    if (!key) {
      return;
    }
    if (key === DefaultKey) {
      switchDefaultMockState();
      return;
    }
    loadMockState(String(key));
  };

  const titleRender = (nodeData: TreeDataNode) => (
    <div className={styles['tree-title']} data-mock-state={nodeData.key}>
      {typeof nodeData.title === 'string' && (
        <span style={{ marginRight: 8 }}>
          {nodeData.selectable && <FileTextOutlined style={{ marginRight: 4 }} />}
          {nodeData.title}
        </span>
      )}
      {nodeData.key !== DefaultKey && nodeData.selectable && (
        <Button
          type="text"
          className={styles['delete-icon']}
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
      <div
        style={{ marginBottom: 8, fontSize: 20, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}
      >
        Mock States
      </div>

      <Tree
        blockNode
        showLine
        key={JSON.stringify(treeData)}
        defaultExpandAll
        autoExpandParent
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        selectable
        treeData={treeData}
        titleRender={titleRender}
      />
    </div>
  );
};
