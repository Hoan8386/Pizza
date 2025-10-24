import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { TeamOutlined } from "@ant-design/icons";
import {
  getUsersApi,
  createUserByAdminApi,
  updateUserByAdminApi,
  deleteUserApi,
} from "../../services/api.service";
import { useToast } from "../../hooks/useToast";

const CustomerAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ role: "customer", search: keyword });
      const data = res.data?.data || res.data || res || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      error("Tải khách hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      full_name: record.full_name,
      email: record.email,
      address: record.address,
      phone: record.phone,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editing) {
        await updateUserByAdminApi(editing.id, { ...values, role: "customer" });
        success("Cập nhật khách hàng thành công");
      } else {
        await createUserByAdminApi({ ...values, role: "customer" });
        success("Tạo khách hàng thành công");
      }
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      error("Lưu khách hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      success("Đã xoá khách hàng");
      fetchData();
    } catch (e) {
      error("Xoá khách hàng thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    { title: "Họ tên", dataIndex: "full_name" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone", width: 140 },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (v) => <Tag>{v}</Tag>,
      width: 120,
    },
    {
      title: "Thao tác",
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá khách hàng"
            onConfirm={() => handleDelete(r.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button size="small" danger>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card style={{ borderRadius: "12px" }}>
        <Row gutter={[8, 8]} align="middle" className="mb-3">
          <Col xs={24} sm={24} md={8}>
            <Input.Search
              placeholder="Tìm theo tên/email"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={fetchData}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button onClick={fetchData} className="w-full">
              Tải lại
            </Button>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Button
              type="primary"
              style={{ background: "#d93025" }}
              onClick={openCreate}
              className="w-full"
            >
              + Thêm khách
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={users}
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: false,
            showTotal: (t) => `${t} khách hàng`,
          }}
          onChange={(pg) =>
            setPagination({ current: pg.current, pageSize: pg.pageSize })
          }
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật khách hàng" : "Thêm khách hàng"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        width={Math.min(600, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ tên"
            name="full_name"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Email không hợp lệ",
              },
            ]}
          >
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item label="SĐT" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerAdmin;
