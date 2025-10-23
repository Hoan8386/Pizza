import { useEffect, useState } from "react";
import { Button, Card, Divider, Form, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { Link } from "react-router-dom";
import { getUsersApi, createUserByAdminApi, updateUserByAdminApi, deleteUserApi } from "../../services/api.service";
import emblem from "../../assets/Pizza-Hut-Emblem.png";

const CustomerAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ role: "customer", search: keyword });
      const data = res.data?.data || res.data || res || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error("Tải khách hàng thất bại");
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
        message.success("Cập nhật khách hàng thành công");
      } else {
        await createUserByAdminApi({ ...values, role: "customer" });
        message.success("Tạo khách hàng thành công");
      }
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      message.error("Lưu khách hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      message.success("Đã xoá khách hàng");
      fetchData();
    } catch (e) {
      message.error("Xoá khách hàng thất bại");
    }
  };

  const columns = [
    { title: "STT", width: 70, render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: "Họ tên", dataIndex: "full_name" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone", width: 140 },
    { title: "Vai trò", dataIndex: "role", render: (v) => <Tag>{v}</Tag>, width: 120 },
    {
      title: "Thao tác",
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xoá khách hàng" onConfirm={() => handleDelete(r.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        background: "linear-gradient(90deg, rgba(217,48,37,0.95) 0%, rgba(217,48,37,0.85) 60%, rgba(217,48,37,0.75) 100%)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={emblem} alt="Admin" style={{ height: 28 }} />
          <div style={{ fontWeight: 700 }}>Quản lý khách hàng</div>
        </div>
        <Link to="/admin" style={{ color: "#fff" }}>Dashboard</Link>
      </div>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Input.Search placeholder="Tìm theo tên/email" allowClear value={keyword} onChange={(e)=>setKeyword(e.target.value)} onSearch={fetchData} style={{ width: 320 }} />
          <Button onClick={fetchData}>Tải lại</Button>
          <div style={{ flex: 1 }} />
          <Button type="primary" style={{ background: "#d93025" }} onClick={openCreate}>+ Thêm khách hàng</Button>
        </div>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={users}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, showSizeChanger: false, showTotal: (t) => `${t} khách hàng` }}
          onChange={(pg) => setPagination({ current: pg.current, pageSize: pg.pageSize })}
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật khách hàng" : "Thêm khách hàng"}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditing(null); }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Họ tên" name="full_name" rules={[{ required: true, message: "Nhập họ tên" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
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
