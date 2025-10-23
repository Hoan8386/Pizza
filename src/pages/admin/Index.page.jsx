import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Table, Tag, Select, Spin, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import { getDashboardStatsApi, getOrdersApi } from "../../services/api.service";
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        getDashboardStatsApi(),
        getOrdersApi(),
      ]);
      setStats(s.data?.data || s.data || null);
      const allOrders = o?.data || o || [];
      setRecentOrders(Array.isArray(allOrders) ? allOrders.slice(0, 6) : []);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const statusData = useMemo(() => {
    const arr = stats?.order_status || [];
    const map = {
      pending: { label: "Chờ xác nhận", color: "warning" },
      confirmed: { label: "Đã xác nhận", color: "processing" },
      shipped: { label: "Đang giao", color: "blue" },
      delivered: { label: "Đã giao", color: "success" },
      cancelled: { label: "Đã huỷ", color: "error" },
    };
    return arr.map((i) => ({ ...i, ...map[i.status] }));
  }, [stats]);

  const columns = [
    {
      title: "ID Đơn",
      dataIndex: "id",
      render: (v) => `#${v}`,
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "full_name"],
      render: (v) => v || "N/A",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      render: (v) => (
        <span className="font-bold" style={{ color: "#c8102e" }}>
          {Number(v || 0).toLocaleString()}₫
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const statusMap = {
          pending: { label: "Chờ xác nhận", color: "warning" },
          confirmed: { label: "Đã xác nhận", color: "processing" },
          shipped: { label: "Đang giao", color: "blue" },
          delivered: { label: "Đã giao", color: "success" },
          cancelled: { label: "Đã huỷ", color: "error" },
        };
        const s = statusMap[status] || { label: status, color: "default" };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "N/A"),
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
          {trend && (
            <div
              className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(trend)}% so với tháng trước
            </div>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl`}
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon style={{ color }} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1.5 h-10 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #c8102e, #e65100)",
              }}
            ></div>
            <h1
              className="text-4xl font-black m-0"
              style={{ color: "#c8102e" }}
            >
              Dashboard Quản Lý
            </h1>
          </div>
          <p className="text-gray-600 ml-5">
            Tổng quan và thống kê hoạt động của cửa hàng Pizza
          </p>
        </div>

        {/* Year Filter */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarOutlined style={{ color: "#c8102e" }} />
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 150 }}
              options={[
                { label: "2024", value: 2024 },
                { label: "2025", value: 2025 },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Link to="/admin">
              <Button
                type="primary"
                style={{ background: "#c8102e", borderColor: "#c8102e" }}
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <Spin spinning={loading}>
          <Row gutter={[20, 20]} className="mb-10">
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Doanh thu"
                value={`${Number(
                  stats?.overview?.total_revenue || 0
                ).toLocaleString()}₫`}
                icon={DollarOutlined}
                color="#c8102e"
                trend={12}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Tổng đơn hàng"
                value={Number(stats?.overview?.total_orders || 0)}
                icon={ShoppingCartOutlined}
                color="#e65100"
                trend={8}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Khách hàng"
                value={Number(stats?.overview?.unique_customers || 0)}
                icon={TeamOutlined}
                color="#d84315"
                trend={5}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Sản phẩm"
                value={Number(stats?.overview?.total_products || 0)}
                icon={BarChartOutlined}
                color="#bf360c"
              />
            </Col>
          </Row>

          {/* Order Status Table */}
          <Card className="rounded-2xl border border-gray-100 shadow-sm mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Trạng thái đơn hàng
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Phân bố đơn hàng theo trạng thái
              </p>
            </div>
            <Table
              dataSource={statusData}
              columns={[
                {
                  title: "Trạng thái",
                  dataIndex: "label",
                  render: (v, r) => <Tag color={r.color}>{v}</Tag>,
                },
                { title: "Số đơn", dataIndex: "count" },
                {
                  title: "Tổng tiền",
                  dataIndex: "total_amount",
                  render: (v) => (
                    <span
                      className="font-semibold"
                      style={{ color: "#c8102e" }}
                    >
                      {Number(v || 0).toLocaleString()}₫
                    </span>
                  ),
                },
              ]}
              pagination={false}
              loading={loading}
              bordered={false}
            />
          </Card>

          {/* Recent Orders */}
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 m-0">
                    Đơn hàng gần đây
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    6 đơn hàng mới nhất trong hệ thống
                  </p>
                </div>
                <Link to="/admin/order">
                  <Button
                    type="text"
                    style={{ color: "#c8102e" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#a00d26")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#c8102e")
                    }
                  >
                    Xem tất cả →
                  </Button>
                </Link>
              </div>
            </div>
            {recentOrders.length > 0 ? (
              <Table
                dataSource={recentOrders}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={loading}
                bordered={false}
                size="middle"
              />
            ) : (
              <Empty
                description="Chưa có đơn hàng nào"
                style={{ marginTop: 48, marginBottom: 48 }}
              />
            )}
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default IndexPage;
