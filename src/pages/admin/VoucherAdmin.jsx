import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Card,
  Select,
  InputNumber,
  Row,
  Col,
  Switch,
  DatePicker,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllVouchersApi,
  createVoucherApi,
  updateVoucherApi,
  deleteVoucherApi,
} from "../../services/api.service";
import { useToast } from "../../hooks/useToast";

const VoucherAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllVouchersApi();
      setVouchers(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      error("Không thể tải dữ liệu voucher");
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.code.toLowerCase().includes(keyword.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Convert form data to API format
      let submitData = {
        code: values.code,
        discount_percentage: values.discount_percentage || null,
        discount_amount: values.discount_amount || null,
        min_order_amount: values.min_order_amount || 0,
        max_discount_amount: values.max_discount_amount || null,
        expiry_date: values.expiry_date
          ? values.expiry_date.format("YYYY-MM-DD")
          : null,
        is_active: values.is_active ? true : false,
      };

      if (editing) {
        // Khi edit, chỉ gửi những field có giá trị thay đổi
        const updateData = {};

        Object.keys(submitData).forEach((key) => {
          if (
            submitData[key] !== null &&
            submitData[key] !== undefined &&
            submitData[key] !== ""
          ) {
            updateData[key] = submitData[key];
          }
        });

        await updateVoucherApi(editing.id, updateData);
        fetchData();
        success("Cập nhật voucher thành công");
      } else {
        await createVoucherApi(submitData);
        fetchData();
        success("Tạo voucher thành công");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error:", error);
      error(editing ? "Cập nhật thất bại" : "Tạo voucher thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVoucherApi(id);
      fetchData();
      success("Xóa voucher thành công");
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
      title: "Mã Voucher",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Loại Giảm Giá",
      key: "discount_type",
      width: 150,
      render: (_, record) => {
        if (record.discount_percentage) {
          return (
            <Tag color="cyan">
              {Number(record.discount_percentage).toFixed(2)}% giảm
            </Tag>
          );
        } else if (record.discount_amount) {
          return (
            <Tag color="green">
              -{Number(record.discount_amount).toLocaleString("vi-VN")} ₫
            </Tag>
          );
        }
        return <Tag>Không</Tag>;
      },
    },
    {
      title: "Đơn Tối Thiểu",
      key: "min_order",
      width: 130,
      render: (_, record) => (
        <span>{Number(record.min_order_amount).toLocaleString("vi-VN")} ₫</span>
      ),
    },
    {
      title: "Giảm Tối Đa",
      key: "max_discount",
      width: 130,
      render: (_, record) =>
        record.max_discount_amount ? (
          <span>
            {Number(record.max_discount_amount).toLocaleString("vi-VN")} ₫
          </span>
        ) : (
          <span className="text-gray-400">Không giới hạn</span>
        ),
    },
    {
      title: "Hạn Sử Dụng",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 110,
      render: (date) => {
        const expiryDate = dayjs(date);
        const isExpired = expiryDate.isBefore(dayjs());
        return (
          <span className={isExpired ? "text-red-600" : "text-green-600"}>
            {expiryDate.format("DD/MM/YYYY")}
          </span>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 90,
      align: "center",
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckOutlined />} color="success">
            Hoạt động
          </Tag>
        ) : (
          <Tag icon={<CloseOutlined />} color="error">
            Vô hiệu
          </Tag>
        ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Xóa voucher"
            description="Bạn có chắc chắn muốn xóa voucher này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
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
              placeholder="Tìm kiếm mã voucher..."
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
              + Thêm voucher
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(pag) => setPagination(pag)}
          scroll={{ x: 1000 }}
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editing ? "Sửa Voucher" : "Thêm Voucher"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={Math.min(600, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
          validateTrigger={["onSubmit"]}
        >
          <Form.Item
            label="Mã Voucher"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã voucher" },
              {
                pattern: /^[A-Z0-9_]+$/,
                message: "Mã voucher chỉ có chữ hoa, số và dấu gạch dưới",
              },
            ]}
          >
            <Input placeholder="VD: PIZZA10, SUMMER20" disabled={!!editing} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giảm Giá (%)"
                name="discount_percentage"
                rules={[
                  !editing && {
                    required: true,
                    message: "Vui lòng nhập phần trăm giảm giá",
                  },
                ].filter(Boolean)}
              >
                <InputNumber
                  placeholder="VD: 20"
                  className="w-full"
                  step={0.01}
                  min={0}
                  max={100}
                  formatter={(value) => (value ? `${value}%` : "")}
                  parser={(value) => parseFloat(value?.replace("%", "") || 0)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giảm Giá (Tiền)"
                name="discount_amount"
                rules={[]}
              >
                <InputNumber
                  placeholder="VD: 50000"
                  className="w-full"
                  step={1000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => parseFloat(value?.replace(/,/g, "") || 0)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đơn Hàng Tối Thiểu"
                name="min_order_amount"
                rules={[
                  !editing && {
                    required: true,
                    message: "Vui lòng nhập đơn tối thiểu",
                  },
                ].filter(Boolean)}
              >
                <InputNumber
                  placeholder="VD: 200000"
                  className="w-full"
                  step={10000}
                  min={0}
                  formatter={(value) =>
                    value
                      ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                  }
                  parser={(value) => parseFloat(value?.replace(/,/g, "") || 0)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giảm Giá Tối Đa"
                name="max_discount_amount"
                rules={[]}
              >
                <InputNumber
                  placeholder="Để trống = không giới hạn"
                  className="w-full"
                  step={10000}
                  min={0}
                  formatter={(value) =>
                    value
                      ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                  }
                  parser={(value) => parseFloat(value?.replace(/,/g, "") || 0)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label="Hạn Sử Dụng"
                name="expiry_date"
                rules={[
                  !editing && {
                    required: true,
                    message: "Vui lòng chọn hạn sử dụng",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const today = dayjs().startOf("day");
                      const selectedDate = value.startOf("day");
                      if (selectedDate.isAfter(today, "day")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Ngày hết hạn phải từ ngày mai trở đi")
                      );
                    },
                  },
                ].filter(Boolean)}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày hết hạn"
                  disabledDate={(current) => {
                    // Vô hiệu hóa các ngày hôm nay trở về trước
                    return current && current.isBefore(dayjs(), "day");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Trạng Thái"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Vô hiệu"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
            <p className="text-sm text-gray-700 m-0">
              ℹ️ <strong>Lưu ý:</strong>
              <br />
              • Chỉ nhập một trong hai loại giảm giá (% hoặc Tiền)
              <br />
              • Giảm giá tối đa: để trống nếu không giới hạn
              <br />• Nếu cả % và tiền có giá trị, hệ thống sẽ ưu tiên %
            </p>
          </div>

          <Form.Item>
            <Space className="w-full">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="flex-1"
              >
                {editing ? "Cập Nhật" : "Tạo Mới"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
                className="flex-1"
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherAdmin;
