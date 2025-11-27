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
  createProductVariantApi,
  updateProductVariantApi,
  deleteProductVariantApi,
} from "../../services/api.service";
import { PlusOutlined } from "@ant-design/icons";
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
  Tag,
  Upload,
  Tabs,
} from "antd";
import { useToast } from "../../hooks/useToast";

const ProductAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVariantSubmitting, setIsVariantSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingVariantId, setDeletingVariantId] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const { success, error } = useToast();

  // Variant modal state
  const [variantModal, setVariantModal] = useState({
    open: false,
    mode: null,
    variant: null,
    productId: null,
  });
  const [variantForm] = Form.useForm();

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
    } catch {
      // Ignore silently but keep UI usable
    }
  };

  const fetchProducts = async (q = "") => {
    setLoading(true);
    try {
      const res = await (q ? searchProduct(q) : getAllProducts());
      const data = res.data || res || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      error("Tải sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setDeletingId(id);
      await deleteProductApi(id);
      success("Đã xoá sản phẩm");
      await fetchProducts(keyword);
    } catch {
      error("Xoá sản phẩm thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const openVariantModal = (mode, productId, variant = null) => {
    setVariantModal({ open: true, mode, variant, productId });
    if (mode === "edit" && variant) {
      variantForm.setFieldsValue({
        size_id: variant.size?.id || variant.size_id || null,
        crust_id: variant.crust?.id || variant.crust_id || null,
        price: variant.price,
        stock: variant.stock,
      });
    } else {
      variantForm.setFieldsValue({
        size_id: null,
        crust_id: null,
        price: 0,
        stock: 0,
      });
    }
  };

  const handleVariantSubmit = async () => {
    try {
      setIsVariantSubmitting(true);
      const values = await variantForm.validateFields();
      const payload = {
        size_id: values.size_id || null,
        crust_id: values.crust_id || null,
        price: Number(values.price),
        stock: Number(values.stock || 0),
      };

      if (variantModal.mode === "create") {
        await createProductVariantApi({
          ...payload,
          product_id: variantModal.productId,
        });
        success("Thêm biến thể thành công");
      } else if (variantModal.mode === "edit") {
        await updateProductVariantApi(variantModal.variant.id, payload);
        success("Cập nhật biến thể thành công");
      }

      setVariantModal({
        open: false,
        mode: null,
        variant: null,
        productId: null,
      });

      // Đóng modal cha sau khi thêm/sửa biến thể xong
      setIsModalOpen(false);

      variantForm.resetFields();
      await fetchProducts(keyword);
    } catch (err) {
      if (err && err.errorFields) return;
      error("Lưu biến thể thất bại");
    } finally {
      setIsVariantSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      setDeletingVariantId(variantId);
      await deleteProductVariantApi(variantId);
      success("Đã xoá biến thể");

      // ĐÓNG TẤT CẢ MODAL SAU KHI XÓA BIẾN THỂ
      setIsModalOpen(false);
      setVariantModal({
        open: false,
        mode: null,
        variant: null,
        productId: null,
      });

      await fetchProducts(keyword);
    } catch {
      error("Xoá biến thể thất bại");
    } finally {
      setDeletingVariantId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      if (editingProduct) {
        const basePayload = {
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          category_id: values.category_id || null,
        };
        if (imageFileName) {
          basePayload.fileName = imageFileName;
          basePayload.image_url = imageFileName;
        }
        await updateProductApi(editingProduct.id, basePayload);
        success("Cập nhật sản phẩm thành công");
      } else {
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
        await createProductApi(payload);
        success("Tạo sản phẩm thành công");
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
      setImagePreview(null);
      setImageFileName(null);
      await fetchProducts(keyword);
    } catch (err) {
      if (err && err.errorFields) return;
      error("Lưu sản phẩm thất bại");
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

  const productsByCategory = useMemo(() => {
    const grouped = {};
    (products || []).forEach((product) => {
      const categoryId = product.category_id || "uncategorized";
      const categoryName = product.category?.name || "Chưa phân loại";

      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          id: categoryId,
          name: categoryName,
          products: [],
        };
      }
      grouped[categoryId].products.push(product);
    });
    return Object.values(grouped);
  }, [products]);

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
            <Button size="small" danger loading={deletingId === record.id}>
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
          <Col xs={24} sm={24} md={10}>
            <Input.Search
              placeholder="Tìm theo tên/mô tả"
              allowClear
              value={keyword}
              loading={loading}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={(v) => fetchProducts(v)}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button
              onClick={() => fetchProducts(keyword)}
              className="w-full"
              loading={loading}
            >
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
              + Thêm sản phẩm
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />

        <Tabs defaultActiveKey="all" type="card">
          <Tabs.TabPane tab="Tất cả sản phẩm" key="all">
            <Table
              size="middle"
              rowKey={(r) => r.id}
              loading={loading}
              columns={columns}
              dataSource={products}
              scroll={{ x: 800 }}
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
          </Tabs.TabPane>

          {productsByCategory.map((category) => (
            <Tabs.TabPane
              tab={`${category.name} (${category.products.length})`}
              key={category.id}
            >
              <Table
                size="middle"
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={category.products}
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (t) => `${t} sản phẩm`,
                }}
              />
            </Tabs.TabPane>
          ))}
        </Tabs>
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
        width={Math.min(800, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
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

          {editingProduct && editingProduct.product_variants?.length > 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
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
                  📦 Biến thể hiện tại
                </h3>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {editingProduct.product_variants.map((variant) => (
                  <Card
                    key={variant.id}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 8px 0", fontWeight: 500 }}>
                          Size: {variant.size?.name || "-"} | Đế:{" "}
                          {variant.crust?.name || "-"}
                        </p>
                        <p style={{ margin: "0 0 4px 0", color: "#666" }}>
                          Giá: {Number(variant.price).toLocaleString()}₫
                        </p>
                        <p style={{ margin: 0, color: "#666" }}>
                          Kho: {variant.stock} cái
                        </p>
                      </div>
                      <Space>
                        <Button
                          size="small"
                          onClick={() =>
                            openVariantModal("edit", editingProduct.id, variant)
                          }
                        >
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xoá biến thể"
                          description="Bạn chắc muốn xoá?"
                          okText="Xoá"
                          cancelText="Huỷ"
                          onConfirm={() => handleDeleteVariant(variant.id)}
                        >
                          <Button
                            size="small"
                            danger
                            loading={deletingVariantId === variant.id}
                          >
                            Xoá
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={() => openVariantModal("create", editingProduct.id)}
                style={{ width: "100%", marginTop: 12 }}
              >
                + Thêm biến thể mới
              </Button>
            </div>
          )}

          {!editingProduct && (
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
          )}
        </Form>
      </Modal>

      <Modal
        title={
          variantModal.mode === "create" ? "Thêm biến thể" : "Sửa biến thể"
        }
        open={variantModal.open}
        confirmLoading={isVariantSubmitting}
        onCancel={() => {
          setVariantModal({
            open: false,
            mode: null,
            variant: null,
            productId: null,
          });
          variantForm.resetFields();
        }}
        onOk={handleVariantSubmit}
        okText={variantModal.mode === "create" ? "Tạo mới" : "Lưu"}
        cancelText="Huỷ"
      >
        <Form form={variantForm} layout="vertical">
          <Form.Item label="Size (tùy chọn)" name="size_id">
            <Select allowClear options={sizeOptions} placeholder="Chọn size" />
          </Form.Item>
          <Form.Item label="Đế (tùy chọn)" name="crust_id">
            <Select allowClear options={crustOptions} placeholder="Chọn đế" />
          </Form.Item>
          <Form.Item
            label="Giá (₫)"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <Input type="number" min={0} placeholder="0" />
          </Form.Item>
          <Form.Item
            label="Kho (số lượng)"
            name="stock"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input type="number" min={0} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductAdmin;
