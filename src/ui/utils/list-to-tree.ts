import type { TreeDataNode } from 'antd';

export function listToTree(paths: string[]): TreeDataNode[] {
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
