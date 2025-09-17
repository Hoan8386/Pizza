import { useEffect, useState } from "react";
import { Button, Card, Divider, Form, Input, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Typography, message, Switch } from "antd";
import { Link } from "react-router-dom";
import {
  getAllBannerApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
  getNewsApi,
  createNewsApi,
  updateNewsApi,
  deleteNewsApi,
} from "../../services/api.service";

const BannerTab = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBannerApi();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((b) => (b.link || "").toLowerCase().includes(keyword.toLowerCase()))
        : (Array.isArray(data) ? data : []);
      setBanners(filtered);
    } catch (e) {
      message.error("Tải banner thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setIsModalOpen(true); };
  const openEdit = (record) => { setEditing(record); form.setFieldsValue(record); setIsModalOpen(true); };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      const payload = { ...values, active: !!values.active };
      if (editing) await updateBannerApi(editing.id, payload);
      else await createBannerApi(payload);
      message.success(editing ? "Cập nhật banner thành công" : "Tạo banner thành công");
      setIsModalOpen(false); setEditing(null); form.resetFields(); fetchData();
    } catch (e) {
      if (e && e.errorFields) return; message.error("Lưu banner thất bại");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => { try { await deleteBannerApi(id); message.success("Đã xoá banner"); fetchData(); } catch { message.error("Xoá banner thất bại"); } };

  const columns = [
    { title: "STT", width: 70, render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: "Ảnh", dataIndex: "image_url", render: (url) => <img src={url} style={{ width: 80, height: 48, objectFit: "cover", borderRadius: 6 }} /> },
    { title: "Liên kết", dataIndex: "link", ellipsis: true },
    { title: "Vị trí", dataIndex: "position" },
    { title: "Kích hoạt", dataIndex: "active", render: (v) => <Tag color={v ? "green" : "default"}>{v ? "Bật" : "Tắt"}</Tag>, width: 100 },
    { title: "Thao tác", width: 160, render: (_, r) => (
      <Space>
        <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
        <Popconfirm title="Xoá banner" onConfirm={() => handleDelete(r.id)} okText="Xoá" cancelText="Huỷ">
          <Button size="small" danger>Xoá</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Input.Search placeholder="Tìm theo link" allowClear value={keyword} onChange={(e)=>setKeyword(e.target.value)} onSearch={fetchData} style={{ width: 320 }} />
        <Button onClick={fetchData}>Tải lại</Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" onClick={openCreate}>+ Thêm banner</Button>
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <Table size="middle" rowKey={(r)=>r.id} loading={loading} columns={columns} dataSource={banners}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, showSizeChanger: false, showTotal: (t)=>`${t} banner` }}
        onChange={(pg)=>setPagination({ current: pg.current, pageSize: pg.pageSize })}
      />

      <Modal title={editing ? "Cập nhật banner" : "Thêm banner"} open={isModalOpen} onCancel={()=>{setIsModalOpen(false); setEditing(null);}} onOk={handleSubmit} confirmLoading={isSubmitting} okText={editing?"Lưu":"Tạo mới"} cancelText="Huỷ">
        <Form form={form} layout="vertical">
          <Form.Item label="Ảnh (URL)" name="image_url" rules={[{ required: true, message: "Nhập URL ảnh" }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Liên kết" name="link">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Vị trí" name="position" rules={[{ required: true, message: "Chọn vị trí" }]}>
            <Select options={[{label:"homepage_top",value:"homepage_top"},{label:"homepage_bottom",value:"homepage_bottom"},{label:"product_page",value:"product_page"}]} />
          </Form.Item>
          <Form.Item label="Kích hoạt" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const NewsTab = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNewsApi();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((n) => (n.title || "").toLowerCase().includes(keyword.toLowerCase()))
        : (Array.isArray(data) ? data : []);
      setItems(filtered);
    } catch (e) {
      message.error("Tải tin tức thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setIsModalOpen(true); };
  const openEdit = (record) => { setEditing(record); form.setFieldsValue(record); setIsModalOpen(true); };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editing) await updateNewsApi(editing.id, values);
      else await createNewsApi(values);
      message.success(editing ? "Cập nhật tin thành công" : "Tạo tin thành công");
      setIsModalOpen(false); setEditing(null); form.resetFields(); fetchData();
    } catch (e) {
      if (e && e.errorFields) return; message.error("Lưu tin thất bại");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => { try { await deleteNewsApi(id); message.success("Đã xoá tin"); fetchData(); } catch { message.error("Xoá tin thất bại"); } };

  const columns = [
    { title: "STT", width: 70, render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: "Tiêu đề", dataIndex: "title", ellipsis: true },
    { title: "Tác giả", dataIndex: "author", width: 160 },
    { title: "Ngày", dataIndex: "published_at", width: 180 },
    { title: "Thao tác", width: 160, render: (_, r) => (
      <Space>
        <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
        <Popconfirm title="Xoá tin" onConfirm={() => handleDelete(r.id)} okText="Xoá" cancelText="Huỷ">
          <Button size="small" danger>Xoá</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Input.Search placeholder="Tìm theo tiêu đề" allowClear value={keyword} onChange={(e)=>setKeyword(e.target.value)} onSearch={fetchData} style={{ width: 320 }} />
        <Button onClick={fetchData}>Tải lại</Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" onClick={openCreate}>+ Thêm tin tức</Button>
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <Table size="middle" rowKey={(r)=>r.id} loading={loading} columns={columns} dataSource={items}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, showSizeChanger: false, showTotal: (t)=>`${t} bài viết` }}
        onChange={(pg)=>setPagination({ current: pg.current, pageSize: pg.pageSize })}
      />

      <Modal title={editing ? "Cập nhật tin" : "Thêm tin"} open={isModalOpen} onCancel={()=>{setIsModalOpen(false); setEditing(null);}} onOk={handleSubmit} confirmLoading={isSubmitting} okText={editing?"Lưu":"Tạo mới"} cancelText="Huỷ">
        <Form form={form} layout="vertical">
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Nhập tiêu đề" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tác giả" name="author">
            <Input />
          </Form.Item>
          <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: "Nhập nội dung" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Ảnh (URL)" name="image_url">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const ContentAdmin = () => {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/admin"><Button>← Quay lại Dashboard</Button></Link>
      </div>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Quản lý nội dung</Typography.Title>
      <Tabs
        defaultActiveKey="banners"
        items={[
          { key: "banners", label: "Banner", children: <BannerTab /> },
          { key: "news", label: "Tin tức", children: <NewsTab /> },
        ]}
      />
    </div>
  );
};

export default ContentAdmin;
