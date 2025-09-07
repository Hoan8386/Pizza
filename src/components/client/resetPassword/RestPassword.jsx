import { Modal, Form, Input } from "antd";

const ModelResetPassword = ({ open, onCancel, onOk, model, setModel }) => {
  return (
    <Modal
      title="Đặt lại mật khẩu"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <Form layout="vertical">
        {/* Email */}
        <Form.Item label="Email">
          <Input
            type="email"
            value={model.email}
            onChange={(e) => setModel({ ...model, email: e.target.value })}
          />
        </Form.Item>

        {/* Token */}
        <Form.Item label="Token">
          <Input
            value={model.token}
            onChange={(e) => setModel({ ...model, token: e.target.value })}
          />
        </Form.Item>

        {/* Mật khẩu mới */}
        <Form.Item label="Mật khẩu mới">
          <Input.Password
            value={model.password}
            onChange={(e) => setModel({ ...model, password: e.target.value })}
          />
        </Form.Item>

        {/* Xác nhận mật khẩu */}
        <Form.Item label="Xác nhận mật khẩu">
          <Input.Password
            value={model.password_confirmation}
            onChange={(e) =>
              setModel({ ...model, password_confirmation: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelResetPassword;
