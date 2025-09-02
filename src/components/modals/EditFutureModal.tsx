import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { FutureItem } from '../../services/futuresService';

interface EditFutureModalProps {
  visible: boolean;
  record: FutureItem | null;
  onOk: (values: Omit<FutureItem, 'id'>) => void;
  onCancel: () => void;
}

const EditFutureModal: React.FC<EditFutureModalProps> = ({ visible, record, onOk, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        symbol: record.symbol,
        price_per_point: record.price_per_point,
      });
    }
  }, [record, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk(values);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="编辑期货"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="symbol"
          label="期货名称"
          rules={[{ required: true, message: '请输入期货名称!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price_per_point"
          label="价格"
          rules={[{ required: true, message: '请输入价格!' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFutureModal;