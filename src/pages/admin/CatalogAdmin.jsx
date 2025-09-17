import { useEffect, useMemo, useState } from "react";
import { Button, Card, Divider, Form, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { Link } from "react-router-dom";
import { getAllCategories, createCategoryApi, updateCategoryApi, deleteCategoryApi } from "../../services/api.service";

const CatalogAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((c) =>
            (c.name || "").toLowerCase().includes(keyword.toLowerCase())
          )
        : (Array.isArray(data) ? data : []);
      setCategories(filtered);
    } catch (e) {
      message.error("Tải danh mục thất bại");
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
    form.setFieldsValue({ name: record.name, description: record.description, url: record.url });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editing) {
        await updateCategoryApi(editing.id, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        await createCategoryApi(values);
        message.success("Tạo danh mục thành công");
      }
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      message.error("Lưu danh mục thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryApi(id);
      message.success("Đã xoá danh mục");
      fetchData();
    } catch (e) {
      message.error("Xoá danh mục thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "products_count",
      render: (v) => <Tag>{v || 0}</Tag>,
      width: 120,
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xoá danh mục" onConfirm={() => handleDelete(r.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/admin"><Button>← Quay lại Dashboard</Button></Link>
      </div>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Quản lý danh mục</Typography.Title>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Input.Search
            placeholder="Tìm theo tên"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={fetchData}
            style={{ width: 320 }}
          />
          <Button onClick={fetchData}>Tải lại</Button>
          <div style={{ flex: 1 }} />
          <Button type="primary" onClick={openCreate}>+ Thêm danh mục</Button>
        </div>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, showSizeChanger: false, showTotal: (t) => `${t} danh mục` }}
          onChange={(pg) => setPagination({ current: pg.current, pageSize: pg.pageSize })}
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditing(null); }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Nhập tên danh mục" }]}>
            <Input placeholder="Ví dụ: Pizza" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
          <Form.Item label="Ảnh (URL)" name="url">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CatalogAdmin;


