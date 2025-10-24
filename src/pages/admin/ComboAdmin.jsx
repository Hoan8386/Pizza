import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Card,
  Row,
  Col,
  Divider,
  InputNumber,
  DatePicker,
  Switch,
  Select,
  Tag,
  Image,
  Empty,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllCombosApi,
  createComboApi,
  updateComboApi,
  deleteComboApi,
  getAllProducts,
  getAllSizes,
  getAllCrusts,
} from "../../services/api.service";
import { useToast } from "../../hooks/useToast";

const ComboAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailCombo, setDetailCombo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState(null);
  const [formUpdate, setFormUpdate] = useState(0); // Force re-render
  const [form] = Form.useForm();
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllCombosApi();
      const data = res.data?.data || res.data || [];
      setCombos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching combos:", error);
      error("Lỗi khi lấy dữ liệu combo");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const [productsRes, sizesRes, crustsRes] = await Promise.all([
        getAllProducts(),
        getAllSizes(),
        getAllCrusts(),
      ]);

      const productsData = productsRes.data?.data || productsRes.data || [];
      const sizesData = sizesRes.data?.data || sizesRes.data || [];
      const crustsData = crustsRes.data?.data || crustsRes.data || [];

      setProducts(Array.isArray(productsData) ? productsData : []);
      setSizes(Array.isArray(sizesData) ? sizesData : []);
      setCrusts(Array.isArray(crustsData) ? crustsData : []);
    } catch (error) {
      console.error("Error fetching products/sizes/crusts:", error);
    }
  };

  const handleSubmit = async (values) => {
    console.log("🔵 handleSubmit called with values:", values);
    setIsSubmitting(true);
    try {
      if (!values.items || values.items.length === 0) {
        console.log("❌ No items");
        error("Vui lòng thêm ít nhất 1 sản phẩm vào combo");
        setIsSubmitting(false);
        return;
      }

      if (!editing && !values.image_url) {
        console.log("❌ No image");
        error("Vui lòng chọn hình ảnh combo");
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        name: values.name,
        description: values.description,
        price: values.price,
        image_url: values.image_url || imageFileName,
        start_date: values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        is_active: values.is_active ? 1 : 0,
      };

      // Chỉ thêm items khi tạo mới, không khi update
      if (!editing) {
        submitData.items = values.items.map((item) => {
          // Tìm product_variant_id từ product_id, size_id, crust_id
          const product = products.find((p) => p.id === item.product_id);
          const variant = product?.product_variants?.find(
            (v) => v.size_id === item.size_id && v.crust_id === item.crust_id
          );

          return {
            product_variant_id: variant?.id || null,
            quantity: item.quantity || 1,
          };
        });
      }

      console.log("📤 Submitting data:", submitData);

      if (editing) {
        console.log("✏️ Updating combo...");
        await updateComboApi(editing.id, submitData);
        fetchData();
        success("Cập nhật combo thành công");
      } else {
        console.log("➕ Creating new combo...");
        await createComboApi(submitData);
        console.log("✅ Combo created successfully");
        fetchData();
        success("Tạo combo thành công");
      }
      setIsModalOpen(false);
      form.resetFields();
      setImagePreview(null);
      setImageFileName(null);
    } catch (error) {
      console.error("❌ Error:", error);
      error(editing ? "Cập nhật thất bại" : "Tạo combo thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build product options (pizza only, no variants yet)
  const buildProductOptions = () => {
    return products.map((product) => ({
      id: product.id,
      value: product.id,
      label: product.name,
      name: product.name,
      image_url: product.image_url,
    }));
  };

  // Get variants of a product
  const getProductVariants = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.product_variants || [];
  };

  // Calculate price based on selected product, size, crust
  const calculateVariantPrice = (productId, sizeId, crustId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;

    const variant = product.product_variants?.find(
      (v) => v.size_id === sizeId && v.crust_id === crustId
    );
    return variant ? Number(variant.price) || 0 : 0;
  };

  const handleDelete = async (id) => {
    try {
      await deleteComboApi(id);
      fetchData();
      success("Xóa combo thành công");
    } catch (error) {
      console.error("Error:", error);
      error("Xóa thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Hình Ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 100,
      render: (image_url) => (
        <Image
          src={`http://localhost:8000/images${image_url || ""}`}
          alt="combo"
          width={60}
          height={60}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6ZAAABRklEQVR4Xu3SMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII="
          preview={false}
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      title: "Tên Combo",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "vi"),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-semibold text-red-600">
          {Number(price).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      title: "Sản Phẩm",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <span className="text-blue-600 font-semibold">
          {items?.length || 0} SP
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Hoạt động" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailCombo(record);
              setIsDetailModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa combo"
            description="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: Number(record.price),
      image_url: record.image_url,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      is_active: record.is_active === 1,
      items:
        record.items?.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })) || [],
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setImagePreview(null);
    setImageFileName(null);
    setIsModalOpen(true);
  };

  const filteredCombos = combos.filter(
    (combo) =>
      combo.name.toLowerCase().includes(keyword.toLowerCase()) ||
      combo.description.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card style={{ borderRadius: "12px" }}>
        <Row gutter={[8, 8]} align="middle" className="mb-3">
          <Col xs={24} sm={24} md={10}>
            <Input.Search
              placeholder="Tìm kiếm combo..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPagination({ ...pagination, current: 1 });
              }}
              allowClear
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button onClick={() => fetchData()} className="w-full">
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
              + Thêm combo
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          columns={columns}
          dataSource={filteredCombos}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredCombos.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Combo"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setDetailCombo(null);
        }}
        footer={null}
        width={800}
      >
        {detailCombo && (
          <div>
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12}>
                <p>
                  <strong>Tên:</strong> {detailCombo.name}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Giá:</strong>{" "}
                  <span className="text-red-600 font-semibold">
                    {Number(detailCombo.price).toLocaleString("vi-VN")} ₫
                  </span>
                </p>
              </Col>
              <Col xs={24}>
                <p>
                  <strong>Mô tả:</strong> {detailCombo.description}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Từ ngày:</strong>{" "}
                  {dayjs(detailCombo.start_date).format("DD/MM/YYYY")}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Đến ngày:</strong>{" "}
                  {dayjs(detailCombo.end_date).format("DD/MM/YYYY")}
                </p>
              </Col>
              <Col xs={24}>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={detailCombo.is_active ? "green" : "red"}>
                    {detailCombo.is_active ? "Hoạt động" : "Tắt"}
                  </Tag>
                </p>
              </Col>
            </Row>

            <Divider>Sản phẩm trong combo</Divider>

            <Table
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: ["product_variant", "product", "image_url"],
                  key: "image",
                  width: 80,
                  render: (image_url) => (
                    <Image
                      src={`http://localhost:8000/images${image_url || ""}`}
                      alt="product"
                      width={60}
                      height={60}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6ZAAABRklEQVR4Xu3SMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII="
                      preview={false}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ),
                },
                {
                  title: "Sản phẩm",
                  dataIndex: ["product_variant", "product", "name"],
                  key: "name",
                },
                {
                  title: "Kích cỡ",
                  dataIndex: ["product_variant", "size", "name"],
                  key: "size",
                  render: (size) => size || "N/A",
                },
                {
                  title: "Đế",
                  dataIndex: ["product_variant", "crust", "name"],
                  key: "crust",
                  render: (crust) => crust || "N/A",
                },
                {
                  title: "Giá",
                  dataIndex: ["product_variant", "price"],
                  key: "price",
                  render: (price) => (
                    <span>{Number(price).toLocaleString("vi-VN")} ₫</span>
                  ),
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  render: (qty) => <strong>{qty}</strong>,
                },
              ]}
              dataSource={detailCombo.items || []}
              rowKey="id"
              pagination={false}
            />
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? "Sửa Combo" : "Thêm Combo"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setImagePreview(null);
          setImageFileName(null);
        }}
        footer={null}
        width={Math.min(700, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={(errorInfo) => {
            console.log("❌ Form validation failed:", errorInfo);
          }}
          onValuesChange={(changedValues) => {
            // Only trigger re-render when product_id, size_id, or crust_id changes
            if (changedValues.items) {
              setFormUpdate((prev) => prev + 1);
            }
          }}
          className="mt-6"
          validateTrigger={["onSubmit"]}
        >
          <Form.Item
            label="Tên Combo"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên combo" }]}
          >
            <Input placeholder="VD: Combo Cặp Đôi" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả combo..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá Combo"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="250000"
                  min={0}
                  step={10000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => parseFloat(value?.replace(/,/g, "") || 0)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Hình Ảnh Combo"
                name="image_url"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!editing && !value && !imageFileName) {
                        return Promise.reject(
                          new Error("Vui lòng chọn hình ảnh")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Upload
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
                      const filePath = `/combos/${file.name}`;
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
                {editing &&
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Từ Ngày"
                name="start_date"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đến Ngày"
                name="end_date"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  placeholder="Chọn ngày kết thúc"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Hoạt Động"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          {!editing && (
            <>
              <Divider>Sản phẩm trong combo</Divider>
              {formUpdate >= 0 && (
                <Form.List name="items">
                  {(fields, { add, remove }) => (
                    <div>
                      {fields.map((field) => {
                        const productId = form.getFieldValue([
                          "items",
                          field.name,
                          "product_id",
                        ]);
                        const sizeId = form.getFieldValue([
                          "items",
                          field.name,
                          "size_id",
                        ]);
                        const crustId = form.getFieldValue([
                          "items",
                          field.name,
                          "crust_id",
                        ]);
                        const calculatedPrice = calculateVariantPrice(
                          productId,
                          sizeId,
                          crustId
                        );

                        const variants = getProductVariants(productId);
                        const availableSizes = [
                          ...new Set(
                            variants
                              .filter((v) => v.size_id !== null)
                              .map((v) => v.size_id)
                          ),
                        ];
                        const availableCrusts = [
                          ...new Set(
                            variants
                              .filter((v) => v.crust_id !== null)
                              .map((v) => v.crust_id)
                          ),
                        ];

                        return (
                          <div
                            key={field.key}
                            className="mb-4 p-4"
                            style={{
                              background: "#f9f9f9",
                              borderRadius: "8px",
                            }}
                          >
                            <Row gutter={16} className="mb-3">
                              <Col xs={24} sm={8}>
                                <Form.Item
                                  label="Pizza"
                                  fieldKey={[field.fieldKey, "product_id"]}
                                  name={[field.name, "product_id"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Chọn pizza",
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Chọn pizza..."
                                    onChange={() => {
                                      // Reset size and crust when product changes
                                      form.setFieldValue(
                                        ["items", field.name, "size_id"],
                                        null
                                      );
                                      form.setFieldValue(
                                        ["items", field.name, "crust_id"],
                                        null
                                      );
                                      // Trigger re-render for price update
                                      setFormUpdate((prev) => prev + 1);
                                    }}
                                  >
                                    {buildProductOptions().map((product) => (
                                      <Select.Option
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={8}>
                                <Form.Item
                                  label="Kích cỡ"
                                  fieldKey={[field.fieldKey, "size_id"]}
                                  name={[field.name, "size_id"]}
                                  rules={
                                    availableSizes.length > 0
                                      ? [
                                          {
                                            required: true,
                                            message: "Chọn kích cỡ",
                                          },
                                        ]
                                      : []
                                  }
                                >
                                  <Select
                                    placeholder="Chọn kích cỡ..."
                                    disabled={availableSizes.length === 0}
                                    onChange={() => {
                                      // Trigger re-render for price update
                                      setFormUpdate((prev) => prev + 1);
                                    }}
                                  >
                                    {availableSizes.map((sizeId) => {
                                      const size = sizes.find(
                                        (s) => s.id === sizeId
                                      );
                                      return (
                                        <Select.Option
                                          key={sizeId}
                                          value={sizeId}
                                        >
                                          {size?.name}
                                        </Select.Option>
                                      );
                                    })}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={8}>
                                <Form.Item
                                  label="Đế"
                                  fieldKey={[field.fieldKey, "crust_id"]}
                                  name={[field.name, "crust_id"]}
                                  rules={
                                    availableCrusts.length > 0
                                      ? [
                                          {
                                            required: true,
                                            message: "Chọn đế",
                                          },
                                        ]
                                      : []
                                  }
                                >
                                  <Select
                                    placeholder="Chọn đế..."
                                    disabled={availableCrusts.length === 0}
                                    onChange={() => {
                                      // Trigger re-render for price update
                                      setFormUpdate((prev) => prev + 1);
                                    }}
                                  >
                                    {availableCrusts.map((crustId) => {
                                      const crust = crusts.find(
                                        (c) => c.id === crustId
                                      );
                                      return (
                                        <Select.Option
                                          key={crustId}
                                          value={crustId}
                                        >
                                          {crust?.name}
                                        </Select.Option>
                                      );
                                    })}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16} align="middle">
                              <Col xs={12} sm={6}>
                                <Form.Item
                                  label="Số lượng"
                                  fieldKey={[field.fieldKey, "quantity"]}
                                  name={[field.name, "quantity"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Số lượng",
                                    },
                                  ]}
                                >
                                  <InputNumber min={1} className="w-full" />
                                </Form.Item>
                              </Col>
                              <Col xs={12} sm={6}>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#d9534f",
                                    padding: "8px",
                                    background: "#fff",
                                    borderRadius: "4px",
                                    textAlign: "center",
                                  }}
                                >
                                  {calculatedPrice > 0
                                    ? `${calculatedPrice.toLocaleString(
                                        "vi-VN"
                                      )} ₫`
                                    : "Chọn đầy đủ"}
                                </div>
                              </Col>
                              <Col xs={24} sm={12}>
                                <Button
                                  danger
                                  block
                                  onClick={() => remove(field.name)}
                                >
                                  Xóa
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        );
                      })}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        className="mb-4"
                      >
                        + Thêm sản phẩm
                      </Button>
                    </div>
                  )}
                </Form.List>
              )}
            </>
          )}

          <Row gutter={16} style={{ marginTop: "24px" }}>
            <Col xs={12}>
              <Button
                block
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Col>
            <Col xs={12}>
              <Button
                type="primary"
                block
                htmlType="submit"
                loading={isSubmitting}
              >
                {editing ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ComboAdmin;
