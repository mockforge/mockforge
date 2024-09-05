import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Select, Space } from "antd";
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
        Add API
      </Button>
      <Drawer
        title="Add API"
        open={isModalVisible}
        footer={null}
        onClose={handleCancel}
        width={800}
        maskClosable={false}
        extra={
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={form.submit}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            method: "GET",
            mocks: [{}],
          }}
        >
          <Form.Item name="method" label="Method" rules={[{ required: true }]}>
            <Select>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>
          <Form.Item
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            name="pathname"
            label="Pathname"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            layout="horizontal"
            name="name"
            label="Name"
            rules={[{ required: true }]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Input />
          </Form.Item>
          <Form.Item
            layout="horizontal"
            name="description"
            label="Description"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.List name="mocks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    type="inner"
                    title={`Mock ${index}`}
                    key={key}
                    style={{ marginBottom: 16 }}
                    extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      label={"Name"}
                      rules={[{ required: true }]}
                      layout="horizontal"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      label="Description"
                      layout="horizontal"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      rules={[
                        {
                          validator: (_, value) => {
                            try {
                              JSON.parse(value);
                            } catch (e) {
                              return Promise.reject("Invalid JSON");
                            }
                            return Promise.resolve();
                          },
                          message: "Please input a valid JSON",
                        },
                      ]}
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "matchJson"]}
                      label="Request Match"
                      layout="horizontal"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <TextArea
                        rows={7}
                        placeholder={JSON.stringify(
                          {
                            body: {},
                            params: {},
                            headers: {},
                            query: {},
                          },
                          null,
                          2
                        )}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "responseJson"]}
                      label="Response"
                      layout="horizontal"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      rules={[
                        { required: true },
                        {
                          validator: (_, value) => {
                            try {
                              JSON.parse(value);
                            } catch (e) {
                              return Promise.reject("Invalid JSON");
                            }
                            return Promise.resolve();
                          },
                          message: "Please input a valid JSON",
                        },
                      ]}
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Mock
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </>
  );
};
