import React from 'react';
import { Checkbox } from 'antd';
import { MockAPI } from '../../sdk/common/types';
import useMockForgeStore from '../model/state';
import { AddMockResponseButton } from './AddApiResponse';
import './index.css';

export const APICard: React.FC<{ api: MockAPI }> = (props) => {
  const mockForgeStore = useMockForgeStore();

  return (
    <div className="api-card">
      <div className="api-header">
        <div style={{ display: 'flex' }}>
          <div className="method-tag">{props.api.method}</div>
          <div className="api-title">
            {props.api.pathname}
            <div className="api-actions">
              <AddMockResponseButton method={props.api.method} pathname={props.api.pathname} />
            </div>
          </div>
        </div>
        <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>{props.api.description}</div>
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
              onChange={() => {
                mockForgeStore.toggleHttpApiResponse(props.api.method, props.api.pathname, o.name);
              }}
            />
            <div className="tag-name">{o.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
