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
  message,
} from "antd";

const ProductAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
      // Chỉ chỉnh sửa thông tin cơ bản; variants quản lý riêng
    });
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
        // Update only basic fields
        const payload = {
          name: values.name,
          description: values.description,
          image_url: values.image_url,
          category_id: values.category_id || null,
        };
        await updateProductApi(editingProduct.id, payload);
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
          image_url: values.image_url,
          category_id: values.category_id || null,
          variants,
        };
        await createProductApi(payload);
        message.success("Tạo sản phẩm thành công");
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
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
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      width: 90,
      render: (url) => (
        <img
          src={url || ""}
          alt="img"
          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
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
      render: (variants) => {
        const count = variants?.length || 0;
        const minPrice = variants && variants.length
          ? Math.min(...variants.map((v) => Number(v.price || 0)))
          : 0;
        return (
          <Space size={4}>
            <Tag color="blue">{count} loại</Tag>
            <Tag color="green">từ {minPrice.toLocaleString()}₫</Tag>
          </Space>
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
    <div style={{ padding: 16 }}>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>
        Quản lý sản phẩm
      </Typography.Title>
      <Card>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}>
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
          <Button type="primary" onClick={openCreate}>
            + Thêm sản phẩm
          </Button>
        </div>
        <Divider style={{ margin: "8px 0" }} />
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
          onChange={(pg) => setPagination({ current: pg.current, pageSize: pg.pageSize })}
        />
      </Card>

      <Modal
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
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
          <Form.Item label="Ảnh (URL)" name="image_url">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Danh mục" name="category_id">
            <Select
              allowClear
              options={categoryOptions}
              placeholder="Chọn danh mục"
            />
          </Form.Item>

          {!editingProduct && (
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}>
                    <div style={{ fontWeight: 600 }}>Biến thể</div>
                    <Button onClick={() => add({ price: 0, stock: 0 })}>
                      + Thêm biến thể
                    </Button>
                  </div>

                  {fields.map((field, idx) => (
                    <div
                      key={field.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                        gap: 8,
                        marginBottom: 8,
                        alignItems: "end",
                      }}
                    >
                      <Form.Item label="Size" name={[field.name, "size_id"]}>
                        <Select allowClear options={sizeOptions} placeholder="Size" />
                      </Form.Item>
                      <Form.Item label="Đế" name={[field.name, "crust_id"]}>
                        <Select allowClear options={crustOptions} placeholder="Đế" />
                      </Form.Item>
                      <Form.Item
                        label="Giá (₫)"
                        name={[field.name, "price"]}
                        rules={[{ required: true, message: "Nhập giá" }]}
                      >
                        <Input type="number" min={0} placeholder="0" />
                      </Form.Item>
                      <Form.Item label="Kho" name={[field.name, "stock"]}>
                        <Input type="number" min={0} placeholder="0" />
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)}>
                        Xoá
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.List>
          )}
        </Form>
        {editingProduct && (
          <Tag color="gold">
            Chỉnh sửa biến thể vui lòng dùng trang quản lý biến thể.
          </Tag>
        )}
      </Modal>
    </div>
  );
};

export default ProductAdmin;


