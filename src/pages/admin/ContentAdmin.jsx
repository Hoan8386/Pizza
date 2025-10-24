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
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Switch,
  Upload,
} from "antd";
import { AdminPageHeader } from "../../components/admin/PageHeader";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";

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
import { useToast } from "../../hooks/useToast";

const BannerTab = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [form] = Form.useForm();
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBannerApi();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((b) =>
            (b.link || "").toLowerCase().includes(keyword.toLowerCase())
          )
        : Array.isArray(data)
        ? data
        : [];
      setBanners(filtered);
    } catch (e) {
      error("Tải banner thất bại");
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
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };
  const openEdit = (record) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(record);
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      const payload = { ...values, active: !!values.active };

      // Chỉ truyền fileName nếu có ảnh mới được chọn
      if (imageFileName) {
        payload.fileName = imageFileName;
        payload.image_url = imageFileName;
        payload.position = "homepage_top";
      }

      if (editing) await updateBannerApi(editing.id, payload);
      else await createBannerApi(payload);
      success(editing ? "Cập nhật banner thành công" : "Tạo banner thành công");
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      setImagePreview(null);
      setImageFileName(null);
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      error("Lưu banner thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBannerApi(id);
      success("Đã xoá banner");
      fetchData();
    } catch {
      error("Xoá banner thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      width: 120,
      render: (url) => (
        <div
          style={{
            width: 100,
            height: 60,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e0e0e0",
          }}
        >
          <img
            src={`http://localhost:8000/images${url || ""}`}
            alt="banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Crect fill='%23f0f0f0' width='100' height='60'/%3E%3Ctext x='50' y='30' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      ),
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
            title="Xoá banner"
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
    <Card>
      <Row gutter={[8, 8]} align="middle" className="mb-3">
        <Col xs={24} sm={24} md={8}>
          <Input.Search
            placeholder="Tìm theo link"
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
            + Thêm banner
          </Button>
        </Col>
      </Row>
      <Divider style={{ margin: "8px 0" }} />
      <Table
        size="middle"
        rowKey={(r) => r.id}
        loading={loading}
        columns={columns}
        dataSource={banners}
        scroll={{ x: 800 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: false,
          showTotal: (t) => `${t} banner`,
        }}
        onChange={(pg) =>
          setPagination({ current: pg.current, pageSize: pg.pageSize })
        }
      />

      <Modal
        title={editing ? "Cập nhật banner" : "Thêm banner"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
          setImagePreview(null);
          setImageFileName(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
        width={Math.min(700, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Ảnh banner">
            <Upload
              key={isModalOpen ? "edit-banner-upload" : "create-banner-upload"}
              name="file"
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={[]}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  error("Vui lòng chọn file ảnh!");
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  error("Ảnh phải nhỏ hơn 5MB!");
                  return false;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setImagePreview(ev.target.result);
                  const filePath = `/banners/${file.name}`;
                  setImageFileName(filePath);
                  form.setFieldValue("image_url", filePath);
                };
                reader.readAsDataURL(file);
                return false;
              }}
              onRemove={() => {
                setImagePreview(null);
                setImageFileName(null);
                form.setFieldValue("image_url", null);
              }}
            >
              {!imagePreview && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
            {imagePreview && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "120px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            {editing && !imagePreview && form.getFieldValue("image_url") && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "120px",
                }}
              >
                <img
                  src={`http://localhost:8000/images${form.getFieldValue(
                    "image_url"
                  )}`}
                  alt="current"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
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
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [form] = Form.useForm();
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNewsApi();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((n) =>
            (n.title || "").toLowerCase().includes(keyword.toLowerCase())
          )
        : Array.isArray(data)
        ? data
        : [];
      setItems(filtered);
    } catch (e) {
      error("Tải tin tức thất bại");
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
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };
  const openEdit = (record) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(record);
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      const payload = { ...values };

      // Chỉ truyền fileName nếu có ảnh mới được chọn
      if (imageFileName) {
        payload.fileName = imageFileName;
        payload.image_url = imageFileName;
      }

      if (editing) await updateNewsApi(editing.id, payload);
      else await createNewsApi(payload);
      success(editing ? "Cập nhật tin thành công" : "Tạo tin thành công");
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      setImagePreview(null);
      setImageFileName(null);
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      error("Lưu tin thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNewsApi(id);
      success("Đã xoá tin");
      fetchData();
    } catch {
      error("Xoá tin thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      width: 100,
      render: (url) => (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "8px",
            overflow: "hidden",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #e0e0e0",
          }}
        >
          <img
            src={`http://localhost:8000/images${url || ""}`}
            alt="news"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23f0f0f0' width='80' height='80'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      ),
    },
    { title: "Tiêu đề", dataIndex: "title", ellipsis: true },
    {
      title: "Nội dung",
      dataIndex: "content",
      ellipsis: true,
      width: 250,
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
            title="Xoá tin"
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
    <Card>
      <Row gutter={[8, 8]} align="middle" className="mb-3">
        <Col xs={24} sm={24} md={8}>
          <Input.Search
            placeholder="Tìm theo tiêu đề"
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
            + Thêm tin tức
          </Button>
        </Col>
      </Row>
      <Divider style={{ margin: "8px 0" }} />
      <Table
        size="middle"
        rowKey={(r) => r.id}
        loading={loading}
        columns={columns}
        dataSource={items}
        scroll={{ x: 800 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: false,
          showTotal: (t) => `${t} bài viết`,
        }}
        onChange={(pg) =>
          setPagination({ current: pg.current, pageSize: pg.pageSize })
        }
      />

      <Modal
        title={editing ? "Cập nhật tin tức" : "Thêm tin tức"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
          setImagePreview(null);
          setImageFileName(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
        width={Math.min(700, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Ví dụ: Khuyến mãi 50% cuối tuần" />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung chi tiết cho bài viết"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item label="Ảnh tin tức">
            <Upload
              key={isModalOpen ? "edit-news-upload" : "create-news-upload"}
              name="file"
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={[]}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  error("Vui lòng chọn file ảnh!");
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  error("Ảnh phải nhỏ hơn 5MB!");
                  return false;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setImagePreview(ev.target.result);
                  const filePath = `/news/${file.name}`;
                  setImageFileName(filePath);
                  form.setFieldValue("image_url", filePath);
                };
                reader.readAsDataURL(file);
                return false;
              }}
              onRemove={() => {
                setImagePreview(null);
                setImageFileName(null);
                form.setFieldValue("image_url", null);
              }}
            >
              {!imagePreview && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
            {imagePreview && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "120px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            {editing && !imagePreview && form.getFieldValue("image_url") && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "120px",
                }}
              >
                <img
                  src={`http://localhost:8000/images${form.getFieldValue(
                    "image_url"
                  )}`}
                  alt="current"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const ContentAdmin = () => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <AdminPageHeader
          icon={<FileTextOutlined style={{ color: "#c8102e" }} />}
          title="Quản lý Nội dung"
          description="Quản lý nội dung hệ thống"
          color="#c8102e"
          image="📋"
        />
        <Tabs
          defaultActiveKey="banners"
          items={[
            { key: "banners", label: "Banner", children: <BannerTab /> },
            { key: "news", label: "Tin tức", children: <NewsTab /> },
          ]}
        />
      </div>
    </div>
  );
};

export default ContentAdmin;
