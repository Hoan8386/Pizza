import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Divider,
  notification,
} from "antd";
import { getAllFaqs, updateFaqAnswer } from "../../services/api.service";
import { toast } from "react-toastify";

const { Title } = Typography;

const FaqAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchFaqs = async (showToast = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllFaqs();
      console.log("Full API response:", response);

      let faqData = [];
      if (Array.isArray(response.data)) {
        faqData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        faqData = response.data.data;
      } else if (response.data?.success && response.data?.data) {
        faqData = response.data.data;
      } else if (Array.isArray(response)) {
        faqData = response;
      }

      setFaqs(faqData);

      if (showToast) message.success(`Đã tải ${faqData.length} câu hỏi FAQ`);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setError(error.message);
      const sampleData = [
        {
          id: 1,
          name: "Nguyễn Văn A",
          email: "nguyenvana@example.com",
          question: "Giao hàng mất bao lâu?",
          answer: "Giao hàng trong 30-45 phút tùy khu vực.",
          status: "answered",
        },
        {
          id: 6,
          name: "Nguyễn Thị F",
          email: "nguyenthif@example.com",
          question: "Làm sao để đổi mật khẩu?",
          answer: null,
          status: "pending",
        },
      ];
      setFaqs(sampleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs(false);
  }, []);

  const handleReply = (faq) => {
    setSelectedFaq(faq);
    setIsModalVisible(true);
    form.setFieldsValue({ answer: faq.answer || "" });
  };

  const handleSubmit = async (values) => {
    if (!selectedFaq) return;

    setSubmitting(true);
    try {
      const response = await updateFaqAnswer(selectedFaq.id, values.answer);
      console.log("API Response check Faq:", response);

      if (response.success === true) {
        const msg = "FAQ response successfully";

        toast.success(msg);

        // ✅ Ẩn modal + reset form
        setIsModalVisible(false);
        form.resetFields();

        // ✅ Refresh danh sách
        await fetchFaqs();
      } else {
        const errMsg =
          response?.message || response?.data?.message || "Cập nhật thất bại!";
        message.error(errMsg);
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("Không thể kết nối đến máy chủ! Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Câu hỏi", dataIndex: "question", key: "question" },
    {
      title: "Trả lời",
      dataIndex: "answer",
      key: "answer",
      render: (answer) => answer || "Chưa trả lời",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "answered" ? "green" : "orange"}>
          {status === "answered" ? "Đã trả lời" : "Chờ trả lời"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "pending" ? (
          <Button type="primary" onClick={() => handleReply(record)}>
            Trả lời
          </Button>
        ) : (
          <Button onClick={() => handleReply(record)}>Chỉnh sửa</Button>
        ),
    },
  ];

  return (
    <div className="p-6">
      <Card style={{ borderRadius: "12px" }}>
        <Row gutter={[8, 8]} align="middle" className="mb-3">
          <Col xs={12} sm={6} md={3}>
            <Button onClick={() => fetchFaqs(true)} className="w-full">
              Tải lại
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />

        {error && (
          <div style={{ color: "red", marginBottom: 16 }}>
            Lỗi khi tải dữ liệu: {error}
          </div>
        )}

        <Table
          size="middle"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={faqs}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Trả lời câu hỏi"
          open={isModalVisible}
          onOk={async () => {
            const values = await form.validateFields();
            await handleSubmit(values);
          }}
          onCancel={handleCancel}
          okText="Gữi"
          cancelText="Hủy"
          confirmLoading={submitting}
          width={600}
          maskClosable={false}
        >
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>Người hỏi:</strong> {selectedFaq?.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedFaq?.email}
            </p>
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                Câu hỏi:
              </label>
              <Input.TextArea
                value={selectedFaq?.question}
                disabled
                rows={3}
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>
            <Form.Item
              label="Câu trả lời"
              name="answer"
              rules={[
                { required: true, message: "Vui lòng nhập câu trả lời!" },
              ]}
            >
              <Input.TextArea placeholder="Nhập câu trả lời..." rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default FaqAdmin;
