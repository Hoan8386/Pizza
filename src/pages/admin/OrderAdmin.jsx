import { useEffect, useMemo, useState } from "react";
import { Button, Card, DatePicker, Divider, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import { Link } from "react-router-dom";
import emblem from "../../assets/Pizza-Hut-Emblem.png";

import dayjs from "dayjs";
import {
  getOrdersApi,
  updateOrderStatusApi,
  cancelOrderApi,
} from "../../services/api.service";

const statusOptions = [
  { label: "Chờ xác nhận", value: "pending", color: "default" },
  { label: "Đã xác nhận", value: "confirmed", color: "blue" },
  { label: "Đang giao", value: "shipped", color: "orange" },
  { label: "Đã giao", value: "delivered", color: "green" },
  { label: "Đã huỷ", value: "cancelled", color: "red" },
];

const mapStatus = (value) => statusOptions.find((s) => s.value === value) || statusOptions[0];
const { RangePicker } = DatePicker;

const OrderAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [status, setStatus] = useState();
  const [userId, setUserId] = useState();
  const [dateRange, setDateRange] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (userId) params.user_id = userId;
      const res = await getOrdersApi(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];
      
      
      setOrders(list);
      setPagination((prev) => ({ ...prev, current: 1 }));
    } catch (e) {
      message.error("Tải đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, userId]);

  const filteredOrders = useMemo(() => {
    let data = Array.isArray(orders) ? [...orders] : [];

    if (keyword) {
      const normalizedKeyword = keyword.toLowerCase();
      data = data.filter(
        (o) =>
          String(o?.user?.full_name || o?.user?.email || "")
            .toLowerCase()
            .includes(normalizedKeyword) || String(o?.id).includes(keyword)
      );
    }

    const [start, end] = dateRange || [];
    if (start || end) {
      data = data.filter((order) => {
        if (!order?.created_at) return false;
        const createdAt = dayjs(order.created_at);
        if (!createdAt.isValid()) return false;
        if (start && createdAt.isBefore(start.startOf("day"))) return false;
        if (end && createdAt.isAfter(end.endOf("day"))) return false;
        return true;
      });
    }

    return data;
  }, [orders, keyword, dateRange]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [keyword, dateRange]);

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
      message.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (e) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const cancelOrder = async (order) => {
    try {
      await cancelOrderApi(order.id);
      message.success("Đã huỷ đơn hàng");
      fetchOrders();
    } catch (e) {
      message.error("Huỷ đơn thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mã",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 140,
      render: (v) => {
        if (!v) return "-";
        const date = dayjs(v);
        return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : "-";
      }
    },


    {
      title: "Khách hàng",
      render: (_, r) => r?.user?.full_name || r?.user?.email || `User#${r.user_id}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (v) => (Number(v || 0)).toLocaleString() + "₫",
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
      title: "Thao tác",
      render: (_, r) => {
        const nexts = nextStatusOptions(r.status);
        return (
          <Space>
            <Button size="small" onClick={() => setDetail(r)}>Chi tiết</Button>
            {nexts.map((ns) => (
              <Button key={ns} size="small" onClick={() => setStatusAction(r, ns)}>
                {mapStatus(ns).label}
              </Button>
            ))}
            {r.status !== "cancelled" && r.status !== "delivered" && (
              <Button size="small" danger onClick={() => cancelOrder(r)}>
                Huỷ
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div>
      <div style={{
        background: "linear-gradient(90deg, rgba(217,48,37,0.95) 0%, rgba(217,48,37,0.85) 60%, rgba(217,48,37,0.75) 100%)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
      }}>
           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={emblem} alt="Admin" style={{ height: 28 }} />
          <div style={{ fontWeight: 700 }}>Quản lý đơn hàng</div>
        </div>
        <Link to="/admin" style={{ color: "#fff" }}>Dashboard</Link>
      </div>
      <Card>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}>
          <Input.Search
            placeholder="Tìm theo mã đơn/khách hàng"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={fetchOrders}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="Lọc trạng thái"
            style={{ width: 200 }}
            options={statusOptions.map((s) => ({ label: s.label, value: s.value }))}
            value={status}
            onChange={setStatus}
          />
          <RangePicker
            value={dateRange}
            format="DD/MM/YYYY"
            allowClear
            onChange={(values) => setDateRange(values && values.length ? values : null)}
          />
          <div style={{ flex: 1 }} />
          <Button onClick={fetchOrders} type="primary" style={{ background: "#d93025" }}>Tải lại</Button>
        </div>
        <Divider style={{ margin: "8px 0" }} />
        <Table
          size="middle"
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={filteredOrders}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: false,
            showTotal: (t) => `${t} đơn hàng`,
            total: filteredOrders.length,
          }}
          onChange={(pg) => setPagination({ current: pg.current, pageSize: pg.pageSize })}
        />
      </Card>

      <Modal
        title={`Đơn hàng #${detail?.id || ""}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>Đóng</Button>}
        width={800}
      >
        {detail && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div><b>Khách hàng:</b> {detail?.user?.full_name || detail?.user?.email}</div>
              <div><b>Trạng thái:</b> {mapStatus(detail.status).label}</div>
              <div><b>Tổng tiền:</b> {(Number(detail.total_amount||0)).toLocaleString()}₫</div>
              <div><b>Thời gian:</b> {detail.created_at ? dayjs(detail.created_at).format("DD/MM/YYYY HH:mm") : "-"}</div>
            </div>
            <div>
              <div><b>Mã giảm giá:</b> {detail?.coupon?.code || "-"}</div>
              <div><b>Ghi chú:</b> {detail?.note || "-"}</div>
            </div>
            <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
              <b>Danh sách sản phẩm</b>
              <div style={{ marginTop: 8 }}>
                {(detail.items || []).map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                      {it.product_variant_id
                        ? `${it.product_variant?.product?.name || "Sản phẩm"}`
                        : `${it.combo?.name || "Combo"}`}
                    </div>
                    <div>x{it.quantity}</div>
                    <div>{Number(it.price||0).toLocaleString()}₫</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
};

export default OrderAdmin;
