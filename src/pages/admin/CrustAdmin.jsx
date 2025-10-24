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
} from "antd";
import { AdminPageHeader } from "../../components/admin/PageHeader";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getAllCrusts,
  createCrustApi,
  updateCrustApi,
  deleteCrustApi,
} from "../../services/api.service";
import { useToast } from "../../hooks/useToast";

const CrustAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [crusts, setCrusts] = useState([]);
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
      const res = await getAllCrusts();
      const data = res.data?.data || res.data || [];
      setCrusts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching crusts:", error);
      error("Lỗi khi lấy dữ liệu đế bánh");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        name: values.name,
        description: values.description,
      };

      if (editing) {
        await updateCrustApi(editing.id, submitData);
        fetchData();
        success("Cập nhật đế bánh thành công");
      } else {
        await createCrustApi(submitData);
        fetchData();
        success("Tạo đế bánh thành công");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error:", error);
      error(editing ? "Cập nhật thất bại" : "Tạo đế bánh thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCrustApi(id);
      fetchData();
      success("Xóa đế bánh thành công");
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
      title: "Tên Đế",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "vi"),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa đế bánh"
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
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const filteredCrusts = crusts.filter(
    (crust) =>
      crust.name.toLowerCase().includes(keyword.toLowerCase()) ||
      crust.description.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <AdminPageHeader title="Quản Lý Đế Bánh" />

      <Card className="shadow-sm" style={{ marginTop: "20px" }}>
        {/* Search & Filter */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm tên đế..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPagination({ ...pagination, current: 1 });
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              size="large"
            >
              Thêm Đế Bánh
            </Button>
          </Col>
        </Row>

        <Divider className="my-2" />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredCrusts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredCrusts.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editing ? "Sửa Đế Bánh" : "Thêm Đế Bánh"}
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
            label="Tên Đế"
            name="name"
            rules={[
              !editing && { required: true, message: "Vui lòng nhập tên đế" },
            ].filter(Boolean)}
          >
            <Input placeholder="VD: Đế Mỏng, Đế Dày..." />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[
              !editing && { required: true, message: "Vui lòng nhập mô tả" },
            ].filter(Boolean)}
          >
            <Input.TextArea
              rows={3}
              placeholder="VD: Giòn rụm, nướng vàng đều..."
            />
          </Form.Item>

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

export default CrustAdmin;
