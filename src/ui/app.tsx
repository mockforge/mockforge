import React, { useEffect, useRef, useState } from 'react';
import { createStyles } from 'antd-style';
import { AddApiForm } from './component/AddApiForm';
import { ApiTable } from './component/ApiTable';
import { SaveMockStateButton } from './component/SaveSate';
import { StateTree } from './component/Tree';
import { useInitData } from './hooks/useInitData';
import useMockForgeStore from './model/state';

const useStyles = createStyles(({ token }) => ({
  container: {
    height: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
  },
  sidebar: {
    padding: token.padding,
    background: token.colorBgContainer,
    width: 250,
  },
  content: {
    flex: 1,
    padding: token.padding,
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    justifyContent: 'space-between',
    marginBottom: token.marginLG,
    display: 'flex',
    alignItems: 'center',
    background: token.colorBgContainer,
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
  },
}));

export function App() {
  const { styles } = useStyles();
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
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <StateTree />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <SaveMockStateButton />
          <AddApiForm />
        </div>
        <div ref={containerRef} className={styles.tableContainer}>
          <ApiTable height={tableHeight} />
        </div>
      </div>
    </div>
  );
}
