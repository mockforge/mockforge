import React, { useEffect, useRef, useState } from 'react';
import { AddApiForm } from './component/AddApiForm';
import { ApiTable } from './component/ApiTable';
import { SaveMockStateButton } from './component/SaveSate';
import { StateTree } from './component/Tree';
import { useInitData } from './hooks/useInitData';
import useMockForgeStore from './model/state';

export function App() {
  const mockForgeStore = useMockForgeStore();
  useInitData(mockForgeStore.clientId);

  const [tableHeight, setTableHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      setTableHeight(containerRef.current.getBoundingClientRect().height);
    }
  }, []);

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
        <div
          style={{
            justifyContent: 'space-between',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)',
          }}
        >
          <SaveMockStateButton></SaveMockStateButton>
          <AddApiForm></AddApiForm>
        </div>
        <div ref={containerRef} style={{ flex: 1, overflow: 'auto' }}>
          <ApiTable height={tableHeight}></ApiTable>
        </div>
      </div>
    </div>
  );
}
