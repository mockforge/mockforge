import type { TreeDataNode } from 'antd';
import { Button, Tree } from 'antd';
import React from 'react';
import useMockForgeStore from '../model/state';
import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import './tree.css';

const DefaultKey = `${Math.random()}-${Math.random()}-${Date.now()}`;

function createTree(paths: string[]): TreeDataNode[] {
  const keyMap = new Map<string, TreeDataNode>();
  const rootNodes: TreeDataNode[] = [];

  paths.forEach((path) => {
    const parts = path.split('/');
    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      const key = parts.slice(0, index + 1).join('/');
      if (index === 0) {
        if (keyMap.has(key)) {
          if (isLastPart) {
            keyMap.get(key)!.selectable = true;
          }
          return;
        } else {
          keyMap.set(key, {
            title: part,
            key,
            selectable: isLastPart,
            children: [],
          });
          rootNodes.push(keyMap.get(key)!);
        }
      } else {
        const parentKey = parts.slice(0, index).join('/');
        const parentNode = keyMap.get(parentKey)!;
        if (keyMap.has(key)) {
          if (isLastPart) {
            keyMap.get(key)!.selectable = true;
          }
          return;
        } else {
          keyMap.set(key, {
            title: part,
            key,
            selectable: isLastPart,
            children: [],
          });
          parentNode.children!.push(keyMap.get(key)!);
        }
      }
    });
  });

  return rootNodes;
}

export const StateTree: React.FC = () => {
  const treeData = useMockForgeStore((state): TreeDataNode[] => {
    const defaultNodes: TreeDataNode[] = [
      {
        title: 'Default',
        key: DefaultKey,
        selectable: true,
      },
    ];
    return defaultNodes.concat(createTree(state.mockStates));
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
    <div
      className="tree-title"
      style={{ display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {nodeData.selectable && <FileTextOutlined style={{ marginRight: 4 }} />}
      {typeof nodeData.title === 'string' && <span style={{ marginRight: 8 }}>{nodeData.title}</span>}
      {nodeData.key !== DefaultKey && nodeData.selectable && (
        <Button
          type="text"
          className="delete-icon"
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
      <div style={{ marginBottom: 8, fontSize: 20, fontWeight: 'bold' }}>Mock States</div>
      <Tree
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
