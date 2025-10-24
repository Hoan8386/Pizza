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
  Upload,
} from "antd";
import { Link } from "react-router-dom";
import {
  getAllCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../services/api.service";
import { AppstoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useToast } from "../../hooks/useToast";

const CatalogAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [form] = Form.useForm();
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      const data = res.data?.data || res.data || res || [];
      const filtered = keyword
        ? (Array.isArray(data) ? data : []).filter((c) =>
            (c.name || "").toLowerCase().includes(keyword.toLowerCase())
          )
        : Array.isArray(data)
        ? data
        : [];
      setCategories(filtered);
    } catch (e) {
      error("Tải danh mục thất bại");
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
    setFileName(null);
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      url: record.url,
    });
    setImagePreview(null);
    setFileName(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editing) {
        const updateData = {
          ...values,
        };
        // Chỉ truyền fileName nếu có ảnh mới được chọn
        if (fileName) {
          updateData.fileName = fileName;
          updateData.url = fileName; // Truyền cả url để cập nhật ảnh
        }
        console.log("check value", updateData);
        await updateCategoryApi(editing.id, updateData);
        success("Cập nhật danh mục thành công");
      } else {
        const createData = {
          ...values,
          fileName: fileName,
          url: fileName, // Truyền url giống update
        };
        await createCategoryApi(createData);
        success("Tạo danh mục thành công");
      }
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      setImagePreview(null);
      setFileName(null);
      fetchData();
    } catch (e) {
      if (e && e.errorFields) return;
      error("Lưu danh mục thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryApi(id);
      success("Đã xoá danh mục");
      fetchData();
    } catch (e) {
      error("Xoá danh mục thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 50,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      responsive: ["sm"],
    },
    {
      title: "Ảnh",
      dataIndex: "url",
      width: 100,
      responsive: ["md"],
      render: (url) => (
        <div
          style={{
            width: "100%",
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
            alt="category"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Crect fill='%23f0f0f0' width='200' height='80'/%3E%3Ctext x='100' y='40' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      responsive: ["xs"],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "Sản phẩm",
      dataIndex: "products_count",
      render: (v) => <Tag>{v || 0}</Tag>,
      width: 100,
      responsive: ["md"],
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space size="small">
          <Button size="small" type="primary" onClick={() => openEdit(r)}>
            ✏️ Sửa
          </Button>
          <Popconfirm
            title="Xoá danh mục"
            description="Bạn chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(r.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button size="small" danger>
              🗑️ Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  return (
    <div className="p-6">
      <Card style={{ borderRadius: "12px" }}>
        <Row gutter={[8, 8]} align="middle" className="mb-3">
          <Col xs={24} sm={24} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm theo tên"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={fetchData}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={3} lg={2}>
            <Button onClick={fetchData} className="w-full">
              Tải lại
            </Button>
          </Col>
          <Col xs={12} sm={6} md={5} lg={4}>
            <Button
              type="primary"
              style={{ background: "#d93025" }}
              onClick={openCreate}
              className="w-full"
            >
              + Thêm danh mục
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: false,
            showTotal: (t) => `${t} danh mục`,
          }}
          onChange={(pg) =>
            setPagination({ current: pg.current, pageSize: pg.pageSize })
          }
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
          setImagePreview(null);
          setFileName(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        okText={editing ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
        width={Math.min(600, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 2, message: "Tên danh mục phải ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Pizza, Gà rán, Đồ uống..." />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả ngắn về danh mục (tuỳ chọn)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="Ảnh danh mục">
            <Upload
              key={isModalOpen ? "edit-upload" : "create-upload"}
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
                  const filePath = `/categories/${file.name}`;
                  setFileName(filePath);
                  form.setFieldValue("url", filePath);
                };
                reader.readAsDataURL(file);
                return false; // Prevent auto upload
              }}
              onRemove={() => {
                setImagePreview(null);
                setFileName(null);
                form.setFieldValue("url", null);
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
            {editing && !imagePreview && form.getFieldValue("url") && (
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
                    "url"
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
    </div>
  );
};

export default CatalogAdmin;
