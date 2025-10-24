import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import {
  getOrdersApi,
  updateOrderStatusApi,
  cancelOrderApi,
} from "../../services/api.service";
import { useToast } from "../../hooks/useToast";

const statusOptions = [
  { label: "Chờ xác nhận", value: "pending", color: "default" },
  { label: "Đã xác nhận", value: "confirmed", color: "blue" },
  { label: "Đang giao", value: "shipped", color: "orange" },
  { label: "Đã giao", value: "delivered", color: "green" },
  { label: "Đã huỷ", value: "cancelled", color: "red" },
];

const mapStatus = (value) =>
  statusOptions.find((s) => s.value === value) || statusOptions[0];

const OrderAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [status, setStatus] = useState();
  const [userId, setUserId] = useState();
  const [dateRange, setDateRange] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState(null);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (userId) params.user_id = userId;
      const res = await getOrdersApi(params);
      const list = res.data || res || [];
      const filtered = keyword
        ? list.filter(
            (o) =>
              String(o?.user?.full_name || o?.user?.email || "")
                .toLowerCase()
                .includes(keyword.toLowerCase()) ||
              String(o?.id).includes(keyword)
          )
        : list;
      setOrders(filtered);
    } catch (e) {
      error("Tải đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, userId]);

  const nextStatusOptions = (cur) => {
    switch (cur) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["shipped", "cancelled"];
      case "shipped":
        return ["delivered"];
      default:
        return [];
    }
  };

  const setStatusAction = async (order, newStatus) => {
    try {
      await updateOrderStatusApi(order.id, newStatus);
      success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (e) {
      error("Cập nhật trạng thái thất bại");
    }
  };

  const cancelOrder = async (order) => {
    try {
      await cancelOrderApi(order.id);
      success("Đã huỷ đơn hàng");
      fetchOrders();
    } catch (e) {
      error("Huỷ đơn thất bại");
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
      title: "Mã",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (v) => dayjs(v).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Khách hàng",
      render: (_, r) =>
        r?.user?.full_name || r?.user?.email || `User#${r.user_id}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (v) => Number(v || 0).toLocaleString() + "₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) => {
        const s = mapStatus(v);
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "Chi tiết",
      render: (_, r) => (
        <Button size="small" onClick={() => setDetail(r)}>
          Xem
        </Button>
      ),
      width: 100,
    },
    {
      title: "Cập nhật trạng thái",
      render: (_, r) => {
        const nexts = nextStatusOptions(r.status);
        return (
          <Select
            size="small"
            placeholder="Chọn trạng thái"
            style={{ width: 150 }}
            options={nexts.map((ns) => ({
              label: mapStatus(ns).label,
              value: ns,
            }))}
            onChange={(newStatus) => setStatusAction(r, newStatus)}
          />
        );
      },
      width: 180,
    },
  ];

  return (
    <div className="p-6">
      <Card style={{ borderRadius: "12px" }}>
        <Row gutter={[8, 8]} align="middle" className="mb-3">
          <Col xs={24} sm={24} md={10}>
            <Input.Search
              placeholder="Tìm theo mã đơn/khách hàng"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={fetchOrders}
              className="w-full"
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button onClick={fetchOrders} className="w-full">
              Tải lại
            </Button>
          </Col>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={orders}
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: false,
            showTotal: (t) => `${t} đơn hàng`,
          }}
          onChange={(pg) =>
            setPagination({ current: pg.current, pageSize: pg.pageSize })
          }
        />
      </Card>

      <Modal
        title={`Đơn hàng #${detail?.id || ""}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>Đóng</Button>}
        width={Math.min(900, window.innerWidth - 40)}
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header - Thông tin chính */}
            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  Khách hàng
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {detail?.user?.full_name || detail?.user?.email || "-"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  Trạng thái
                </div>
                <Tag
                  color={mapStatus(detail.status).color}
                  style={{ fontSize: 12 }}
                >
                  {mapStatus(detail.status).label}
                </Tag>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                  Thời gian tạo
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {dayjs(detail.created_at).format("HH:mm DD/MM/YYYY")}
                </div>
              </div>
            </div>

            {/* Thông tin giao hàng */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                📍 Thông tin giao hàng
              </h3>
              <div
                style={{
                  background: "#fafafa",
                  padding: 12,
                  borderRadius: 8,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    Tên người nhận
                  </div>
                  <div>{detail?.shipping_name || "-"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    Số điện thoại
                  </div>
                  <div>{detail?.shipping_phone || "-"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    Địa chỉ
                  </div>
                  <div>{detail?.shipping_address || "-"}</div>
                </div>
                {detail?.note && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      Ghi chú
                    </div>
                    <div style={{ fontStyle: "italic", color: "#666" }}>
                      {detail.note}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                🛒 Danh sách sản phẩm ({detail.items?.length || 0})
              </h3>
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#fafafa",
                    padding: "12px 16px",
                    display: "grid",
                    gridTemplateColumns: "80px 2fr 1fr 1fr 1fr",
                    gap: 16,
                    fontWeight: 600,
                    fontSize: 12,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>Ảnh</div>
                  <div>Sản phẩm</div>
                  <div style={{ textAlign: "center" }}>Số lượng</div>
                  <div style={{ textAlign: "right" }}>Giá</div>
                  <div style={{ textAlign: "right" }}>Tổng</div>
                </div>
                {(detail.items || []).map((it, idx) => {
                  const imageUrl =
                    it.product_variant?.product?.image_url ||
                    it.combo?.image_url;
                  return (
                    <div
                      key={it.id}
                      style={{
                        padding: "12px 16px",
                        display: "grid",
                        gridTemplateColumns: "80px 2fr 1fr 1fr 1fr",
                        gap: 16,
                        borderBottom:
                          idx < (detail.items?.length || 0) - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          overflow: "hidden",
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <img
                          src={`http://localhost:8000/images${imageUrl || ""}`}
                          alt="product"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23f0f0f0' width='80' height='80'/%3E%3Ctext x='40' y='40' text-anchor='middle' dy='.3em' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {it.product_variant_id
                            ? it.product_variant?.product?.name || "Sản phẩm"
                            : it.combo?.name || "Combo"}
                        </div>
                        {it.product_variant && (
                          <div style={{ fontSize: 12, color: "#999" }}>
                            {it.product_variant?.size?.name &&
                              `Size: ${it.product_variant.size.name}`}
                            {it.product_variant?.size?.name &&
                              it.product_variant?.crust?.name &&
                              " • "}
                            {it.product_variant?.crust?.name &&
                              `Crust: ${it.product_variant.crust.name}`}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "center" }}>x{it.quantity}</div>
                      <div style={{ textAlign: "right" }}>
                        {Number(it.price || 0).toLocaleString()}₫
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#d93025",
                        }}
                      >
                        {(Number(it.price || 0) * it.quantity).toLocaleString()}
                        ₫
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tóm tắt thanh toán */}
            <div
              style={{
                background: "#fafafa",
                padding: 16,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                borderLeft: "4px solid #d93025",
              }}
            >
              {detail?.coupon && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Mã giảm giá ({detail.coupon.code}):</span>
                  <span style={{ color: "green" }}>
                    -{Number(detail.discount || 0).toLocaleString()}₫
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 16,
                  fontWeight: 600,
                  paddingTop: detail?.coupon ? 8 : 0,
                  borderTop: detail?.coupon ? "1px solid #e0e0e0" : "none",
                }}
              >
                <span>Tổng cộng:</span>
                <span style={{ color: "#d93025" }}>
                  {Number(detail.total_amount || 0).toLocaleString()}₫
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderAdmin;
