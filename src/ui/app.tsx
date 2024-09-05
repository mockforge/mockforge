import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, Checkbox, Input } from "antd";
import { useEffect } from "react";
import { MockAPI } from "../sdk/common/types";
import { AddApiForm } from "./component/AddApiForm";
import "./index.css";
import useMockForgeStore from "./model/state";

const APICard: React.FC<{ api: MockAPI }> = (props) => {
  return (
    <div className="api-card">
      <div className="api-header">
        <div style={{ display: "flex" }}>
          <div className="method-tag">{props.api.method}</div>
          <div className="api-title">
            {props.api.pathname}
            <div className="api-actions">
              <Button icon={<PlusOutlined />} type="primary">
                新增返回结果
              </Button>
            </div>
          </div>
        </div>
        <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
          {props.api.description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {props.api.mockResponses.map((o) => (
          <div className="tag-item" key={o.name}>
            <Checkbox style={{ marginRight: 8 }} />
            <div className="tag-name">{o.name}</div>
            <EditOutlined className="tag-icon" />
          </div>
        ))}
      </div>
    </div>
  );
};

function useInitData(clientId: string) {
  const mockForgeStore = useMockForgeStore();

  const mockApiRequest = useRequest(
    () => {
      return mockForgeStore.browserMockForgeStateService.listMockAPIs();
    },
    {
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
      onSuccess(data) {
        mockForgeStore.updateMockForgeState(data);
      },
    }
  );
  useEffect(() => {
    mockForgeStore.browserMockForgeEventListener.handleEvent((event) => {
      if (event.type === "http-mock-api-change") {
        mockApiRequest.refresh();
      }
      if (event.type === "mock-forge-state-change") {
        mockForgeStateRequest.refresh();
      }
    });
  }, [clientId, mockApiRequest]);
}

export function App(props: { clinetId: string }) {
  const mockForgeStore = useMockForgeStore();
  useInitData(props.clinetId);
  return (
    <div style={{ padding: 20 }}>
      <div className="search-bar">
        <AddApiForm></AddApiForm>
        <Input.Search className="search-input" placeholder="输入关键字搜索" />
      </div>
      {
        <div style={{ marginTop: 20 }}>
          {mockForgeStore.apiList.map((api) => (
            <APICard api={api} />
          ))}
        </div>
      }
    </div>
  );
}
