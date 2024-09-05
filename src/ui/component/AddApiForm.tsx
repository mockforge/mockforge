import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import { useState } from "react";
import { MockAPI } from "../../sdk/common/types";
import useMockForgeStore from "../model/state";

const { Option } = Select;
const { TextArea } = Input;

export const AddApiForm = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const addMockAPI = useMockForgeStore((state) => state.addMockAPI);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    const newApi: MockAPI = {
      type: "http",
      method: values.method,
      pathname: values.pathname,
      name: values.name,
      description: values.description,
      mockResponses: values.mocks.map((mock: any) => {
        const requestMatcher = mock.matchJson
          ? {
              type: "basic-match",
              content: JSON.parse(mock.matchJson),
            }
          : null;
        return {
          name: mock.name,
          schema: "http_response_v1",
          description: mock.description,
          requestMatcher: requestMatcher,
          responseData: {
            type: "json",
            content: JSON.parse(mock.responseJson),
          },
        };
      }),
    };

    await addMockAPI(newApi);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        新增 API Mock
      </Button>
      <Modal
        title="新增 API Mock"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            method: "GET",
            mocks: [{}],
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="method"
                label="Method"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name="pathname"
                label="Pathname"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            layout="horizontal"
            name="name"
            label="API 名字"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item layout="horizontal" name="description" label="API 描述">
            <TextArea rows={4} />
          </Form.Item>

          <Form.List name="mocks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    size="small"
                    key={key}
                    style={{ marginBottom: 16 }}
                    extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        label="Mock 名字"
                        rules={[{ required: true }]}
                        layout="horizontal"
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Mock 描述"
                        layout="horizontal"
                      >
                        <TextArea rows={2} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "matchJson"]}
                        label="匹配的 JSON"
                        layout="horizontal"
                      >
                        <TextArea rows={4} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "responseJson"]}
                        label="返回的 JSON"
                        layout="horizontal"
                        rules={[{ required: true }]}
                      >
                        <TextArea rows={4} />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加 Mock
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
