import { useEffect, useMemo, useState } from "react";
import {
  getAllProducts,
  searchProduct,
  getAllCategories,
  getAllSizes,
  getAllCrusts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../../services/api.service";
import { AdminPageHeader } from "../../components/admin/PageHeader";
import {
  ShoppingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { Link } from "react-router-dom";

const ProductAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchMeta = async () => {
    try {
      const [catesRes, sizesRes, crustsRes] = await Promise.all([
        getAllCategories(),
        getAllSizes(),
        getAllCrusts(),
      ]);
      setCategories(catesRes.data || catesRes || []);
      setSizes(sizesRes.data || sizesRes || []);
      setCrusts(crustsRes.data || crustsRes || []);
    } catch (e) {
      // Ignore silently but keep UI usable
    }
  };

  const fetchProducts = async (q = "") => {
    setLoading(true);
    try {
      const res = await (q ? searchProduct(q) : getAllProducts());
      const data = res.data || res || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error("Tải sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({ variants: [{ price: 0, stock: 0 }] });
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingProduct(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      image_url: record.image_url,
      category_id: record.category_id,
      variants: (record.product_variants || []).map((v) => ({
        size_id: v.size?.id || v.size_id || null,
        crust_id: v.crust?.id || v.crust_id || null,
        price: v.price,
        stock: v.stock,
      })),
    });
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProductApi(id);
      message.success("Đã xoá sản phẩm");
      fetchProducts(keyword);
    } catch (e) {
      message.error("Xoá sản phẩm thất bại");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      if (editingProduct) {
        // Allow updating variants as well: backend update currently only updates base fields,
        // so we update base and inform user variants will be applied when supported.
        const basePayload = {
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          category_id: values.category_id || null,
        };
        // Chỉ truyền fileName nếu có ảnh mới được chọn
        if (imageFileName) {
          basePayload.fileName = imageFileName;
          basePayload.image_url = imageFileName;
        }
        await updateProductApi(editingProduct.id, basePayload);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        // Create with variants
        const variants = (values.variants || [])
          .filter((v) => v && v.price !== undefined)
          .map((v) => ({
            size_id: v.size_id || null,
            crust_id: v.crust_id || null,
            price: Number(v.price),
            stock: Number(v.stock || 0),
          }));

        const payload = {
          name: values.name,
          description: values.description,
          image_url: imageFileName,
          category_id: values.category_id || null,
          variants,
        };
        console.log("check payload ", payload);
        await createProductApi(payload);
        message.success("Tạo sản phẩm thành công");
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
      setImagePreview(null);
      setImageFileName(null);
      fetchProducts(keyword);
    } catch (e) {
      if (e && e.errorFields) return; // antd validation
      message.error("Lưu sản phẩm thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = useMemo(
    () => (categories || []).map((c) => ({ label: c.name, value: c.id })),
    [categories]
  );
  const sizeOptions = useMemo(
    () => (sizes || []).map((s) => ({ label: s.name, value: s.id })),
    [sizes]
  );
  const crustOptions = useMemo(
    () => (crusts || []).map((c) => ({ label: c.name, value: c.id })),
    [crusts]
  );

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
            height: 100,
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
            alt="product"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      render: (_, record) => record?.category?.name || "-",
    },
    {
      title: "Biến thể",
      dataIndex: "product_variants",
      width: 100,
      render: (variants) => {
        const count = variants?.length || 0;
        return <Tag color="blue">{count} loại</Tag>;
      },
    },
    {
      title: "Giá tiền",
      dataIndex: "product_variants",
      width: 180,
      render: (variants) => {
        if (!variants || variants.length === 0) return "-";
        const prices = variants.map((v) => Number(v.price || 0));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) {
          return (
            <span style={{ color: "#d93025", fontWeight: 600 }}>
              {minPrice.toLocaleString()}₫
            </span>
          );
        }
        return (
          <span style={{ color: "#d93025", fontWeight: 600 }}>
            {minPrice.toLocaleString()}₫ - {maxPrice.toLocaleString()}₫
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá sản phẩm"
            description={`Bạn chắc muốn xoá "${record.name}"?`}
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record.id)}
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
      <AdminPageHeader
        icon={<ShoppingOutlined style={{ color: "#c8102e" }} />}
        title="Quản lý Sản phẩm"
        description="Quản lý toàn bộ sản phẩm của cửa hàng"
        color="#c8102e"
        image="🍕"
      />
      <Card style={{ borderRadius: "12px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <Input.Search
            placeholder="Tìm theo tên/mô tả"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(v) => fetchProducts(v)}
            style={{ width: 320 }}
          />
          <Button onClick={() => fetchProducts(keyword)}>Tải lại</Button>
          <div style={{ flex: 1 }} />
          <Space>
            <Button
              icon={<BarsOutlined />}
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            >
              Danh sách
            </Button>
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === "grid" ? "primary" : "default"}
              onClick={() => setViewMode("grid")}
            >
              Lưới
            </Button>
            <Button
              type="primary"
              style={{ background: "#d93025" }}
              onClick={openCreate}
            >
              + Thêm sản phẩm
            </Button>
          </Space>
        </div>
        <Divider style={{ margin: "8px 0" }} />

        {viewMode === "table" ? (
          <Table
            size="middle"
            rowKey={(r) => r.id}
            loading={loading}
            columns={columns}
            dataSource={products}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: false,
              showTotal: (t) => `${t} sản phẩm`,
            }}
            onChange={(pg) =>
              setPagination({ current: pg.current, pageSize: pg.pageSize })
            }
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                hoverable
                style={{ borderRadius: "12px", overflow: "hidden" }}
                cover={
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`http://localhost:8000/images${
                        product.image_url || ""
                      }`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                }
              >
                <Card.Meta
                  title={
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </div>
                  }
                  description={
                    <div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 8 }}
                      >
                        {product.category?.name || "Không có danh mục"}
                      </div>
                      <Space size={4} wrap>
                        <Tag color="blue">
                          {product.product_variants?.length || 0} loại
                        </Tag>
                        <Tag color="green">
                          từ{" "}
                          {Math.min(
                            ...(product.product_variants?.map((v) =>
                              Number(v.price || 0)
                            ) || [0])
                          ).toLocaleString()}
                          ₫
                        </Tag>
                      </Space>
                    </div>
                  }
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Button size="small" block onClick={() => openEdit(product)}>
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xoá sản phẩm"
                    description={`Bạn chắc muốn xoá "${product.name}"?`}
                    okText="Xoá"
                    cancelText="Huỷ"
                    onConfirm={() => handleDelete(product.id)}
                  >
                    <Button size="small" danger block>
                      Xoá
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          setImagePreview(null);
          setImageFileName(null);
        }}
        onOk={handleSubmit}
        confirmLoading={isSubmitting}
        width={800}
        okText={editingProduct ? "Lưu" : "Tạo mới"}
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Ví dụ: Pizza Hải sản" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              key={
                isModalOpen ? "edit-product-upload" : "create-product-upload"
              }
              name="file"
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={[]}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  message.error("Vui lòng chọn file ảnh!");
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error("Ảnh phải nhỏ hơn 5MB!");
                  return false;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setImagePreview(ev.target.result);
                  const filePath = `/pizza/${file.name}`;
                  setImageFileName(filePath);
                  form.setFieldValue("image_url", filePath);
                };
                reader.readAsDataURL(file);
                return false; // Prevent auto upload
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
            {editingProduct &&
              !imagePreview &&
              form.getFieldValue("image_url") && (
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
          <Form.Item label="Danh mục" name="category_id">
            <Select
              allowClear
              options={categoryOptions}
              placeholder="Chọn danh mục"
            />
          </Form.Item>

          {
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: "2px solid #f0f0f0",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      📦 Biến thể sản phẩm
                    </h3>
                    <Button
                      type="primary"
                      onClick={() => add({ price: 0, stock: 0 })}
                      style={{ background: "#1890ff" }}
                    >
                      + Thêm biến thể
                    </Button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {fields.map((field, idx) => (
                      <Card
                        key={field.key}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e8e8e8",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <h4
                            style={{ margin: 0, color: "#666", fontSize: 14 }}
                          >
                            Biến thể #{idx + 1}
                          </h4>
                          <Button
                            danger
                            size="small"
                            onClick={() => remove(field.name)}
                            style={{ borderColor: "#ff4d4f", color: "#ff4d4f" }}
                          >
                            ✕ Xoá
                          </Button>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 16,
                          }}
                        >
                          <Form.Item
                            label="Size"
                            name={[field.name, "size_id"]}
                            labelCol={{
                              style: {
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#555",
                              },
                            }}
                          >
                            <Select
                              allowClear
                              options={sizeOptions}
                              placeholder="Chọn size"
                              style={{ height: 36 }}
                            />
                          </Form.Item>
                          <Form.Item
                            label="Đế"
                            name={[field.name, "crust_id"]}
                            labelCol={{
                              style: {
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#555",
                              },
                            }}
                          >
                            <Select
                              allowClear
                              options={crustOptions}
                              placeholder="Chọn đế"
                              style={{ height: 36 }}
                            />
                          </Form.Item>
                          <Form.Item
                            label="Giá (₫)"
                            name={[field.name, "price"]}
                            rules={[{ required: true, message: "Nhập giá" }]}
                            labelCol={{
                              style: {
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#555",
                              },
                            }}
                          >
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              style={{
                                height: 36,
                                fontSize: 14,
                              }}
                            />
                          </Form.Item>
                          <Form.Item
                            label="Kho (số lượng)"
                            name={[field.name, "stock"]}
                            labelCol={{
                              style: {
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#555",
                              },
                            }}
                          >
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              style={{
                                height: 36,
                                fontSize: 14,
                              }}
                            />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {fields.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 32,
                        background: "#f9f9f9",
                        borderRadius: 8,
                        border: "1px dashed #d9d9d9",
                      }}
                    >
                      <p style={{ color: "#999", marginBottom: 12 }}>
                        Chưa có biến thể nào
                      </p>
                      <Button
                        onClick={() => add({ price: 0, stock: 0 })}
                        style={{ color: "#1890ff" }}
                      >
                        + Tạo biến thể đầu tiên
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Form.List>
          }
        </Form>
      </Modal>
    </div>
  );
};

export default ProductAdmin;
