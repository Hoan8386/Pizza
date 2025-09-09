import { useEffect } from "react";
import { Modal, Form, Input } from "antd";

const ModelResetPassword = ({ open, onCancel, onOk, model, setModel }) => {
  useEffect(() => {
    if (!open) {
      // Khi modal đóng -> reset state
      setModel({
        email: model.email, // giữ email
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    }
  }, [open]);

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
          <Input disabled value={model.email} />
        </Form.Item>

        {/* Mật khẩu hiện tại */}
        <Form.Item label="Mật khẩu hiện tại">
          <Input
            value={model.current_password}
            onChange={(e) =>
              setModel({ ...model, current_password: e.target.value })
            }
          />
        </Form.Item>

        {/* Mật khẩu mới */}
        <Form.Item label="Mật khẩu mới">
          <Input.Password
            value={model.new_password}
            onChange={(e) =>
              setModel({ ...model, new_password: e.target.value })
            }
          />
        </Form.Item>

        {/* Xác nhận mật khẩu */}
        <Form.Item label="Xác nhận mật khẩu">
          <Input.Password
            value={model.new_password_confirmation}
            onChange={(e) =>
              setModel({ ...model, new_password_confirmation: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelResetPassword;
