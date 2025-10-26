import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Col, Row, Table, Tag, Select, Spin, Empty, Button } from "antd";
import { Link } from "react-router-dom";
import {
  getDashboardStatsApi,
  getOrdersApi,
  getMonthlyRevenueApi,
  getTopProductsApi,
  getTopCustomersApi,
  getCouponsApi,
} from "../../services/api.service";
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
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1); // Tháng hiện tại (1-12)
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o, t, c, cp] = await Promise.all([
        getDashboardStatsApi(),
        getOrdersApi(),
        getTopProductsApi(),
        getTopCustomersApi(),
        getCouponsApi(),
      ]);
      setStats(s.data?.data || s.data || null);
      const allOrders = o?.data || o || [];
      setRecentOrders(Array.isArray(allOrders) ? allOrders.slice(0, 6) : []);
      setTopProducts(t.data?.data || t.data || []);
      setTopCustomers(c.data?.data || c.data || []);
      setCoupons(cp.data?.data || cp.data || []);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyData = useCallback(async () => {
    try {
      const m = await getMonthlyRevenueApi({
        year: monthlyYear,
        month: monthlyMonth,
      });
      setMonthlyRevenue(m.data?.data || m.data || null);
    } catch (e) {
      console.error("Monthly revenue error:", e);
    }
  }, [monthlyYear, monthlyMonth]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

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
  ];

  const StatCard = (
    { title, value, icon: Icon, color, trend } // eslint-disable-line
  ) => (
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
    <div
      className="p-6"
      style={
        {
          // marginTop: "70px",
        }
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <Spin spinning={loading}>
          <Row gutter={[20, 20]} className="mb-10 mt-5">
            <Col xs={24} sm={12} lg={8}>
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
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Tổng đơn hàng"
                value={Number(stats?.overview?.total_orders || 0)}
                icon={ShoppingCartOutlined}
                color="#e65100"
                trend={8}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Khách hàng"
                value={Number(stats?.overview?.unique_customers || 0)}
                icon={TeamOutlined}
                color="#d84315"
                trend={5}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Giá trị trung bình đơn"
                value={`${Number(
                  stats?.overview?.avg_order_value || 0
                ).toLocaleString()}₫`}
                icon={BarChartOutlined}
                color="#4caf50"
                trend={-2}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Đơn hàng cao nhất"
                value={`${Number(
                  stats?.overview?.highest_order || 0
                ).toLocaleString()}₫`}
                icon={ArrowUpOutlined}
                color="#ff9800"
                trend={15}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="Đơn hàng thấp nhất"
                value={`${Number(
                  stats?.overview?.lowest_order || 0
                ).toLocaleString()}₫`}
                icon={ArrowDownOutlined}
                color="#9c27b0"
                trend={-10}
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
          <Card
            style={{
              marginTop: "24px",
            }}
            className="rounded-2xl border border-gray-100 shadow-sm"
          >
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
                <Link to="/admin/orders">
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

        {/* Monthly Revenue */}
        <Card
          style={{
            marginTop: "24px",
          }}
          className="rounded-2xl border border-gray-100 shadow-sm mt-5"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Doanh thu theo tháng
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Thống kê doanh thu cho tháng {monthlyMonth}/{monthlyYear}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={monthlyYear}
                  onChange={setMonthlyYear}
                  style={{ width: 100 }}
                  options={[
                    { label: "2024", value: 2024 },
                    { label: "2025", value: 2025 },
                    { label: "2026", value: 2026 },
                  ]}
                />
                <Select
                  value={monthlyMonth}
                  onChange={setMonthlyMonth}
                  style={{ width: 100 }}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    label: `Tháng ${i + 1}`,
                    value: i + 1,
                  }))}
                />
              </div>
            </div>
          </div>
          {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm font-medium">Tháng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyRevenue[0].month_name}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-500 text-sm font-medium">
                    Tổng doanh thu
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#c8102e" }}
                  >
                    {Number(monthlyRevenue[0].total_revenue).toLocaleString()}₫
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-500 text-sm font-medium">
                    Tổng đơn hàng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyRevenue[0].total_orders}
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-500 text-sm font-medium">
                    Giá trị trung bình đơn
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Number(monthlyRevenue[0].avg_order_value).toLocaleString()}
                    ₫
                  </p>
                </div>
              </Col>
            </Row>
          ) : (
            <Empty
              description="Không có dữ liệu doanh thu cho tháng này"
              style={{ marginTop: 48, marginBottom: 48 }}
            />
          )}
        </Card>

        {/* Top Seller Products */}
        <Card
          style={{
            marginTop: "24px",
          }}
          className="rounded-2xl border border-gray-100 shadow-sm mt-5"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 m-0">
              Top sản phẩm bán chạy
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Danh sách các sản phẩm bán chạy nhất
            </p>
          </div>
          {topProducts.length > 0 ? (
            <Table
              dataSource={topProducts}
              columns={[
                {
                  title: "Tên sản phẩm",
                  dataIndex: "product_name",
                  render: (v) => <span className="font-medium">{v}</span>,
                },
                {
                  title: "Size",
                  dataIndex: "size_name",
                },
                {
                  title: "Đế",
                  dataIndex: "crust_name",
                },
                {
                  title: "Đã bán",
                  dataIndex: "total_sold",
                  render: (v) => <span className="font-semibold">{v}</span>,
                },
                {
                  title: "Tổng doanh thu",
                  dataIndex: "total_revenue",
                  render: (v) => (
                    <span
                      className="font-semibold"
                      style={{ color: "#c8102e" }}
                    >
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
                {
                  title: "Giá trung bình",
                  dataIndex: "avg_price",
                  render: (v) => (
                    <span className="font-semibold">
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
              ]}
              rowKey={(record, index) => index}
              pagination={false}
              loading={loading}
              bordered={false}
              size="middle"
            />
          ) : (
            <Empty
              description="Không có dữ liệu sản phẩm bán chạy"
              style={{ marginTop: 48, marginBottom: 48 }}
            />
          )}
        </Card>

        {/* Top Customers */}
        <Card
          style={{
            marginTop: "24px",
          }}
          className="rounded-2xl border border-gray-100 shadow-sm mt-5"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 m-0">
              Top khách hàng
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Danh sách các khách hàng chi tiêu nhiều nhất
            </p>
          </div>
          {topCustomers.length > 0 ? (
            <Table
              dataSource={topCustomers}
              columns={[
                {
                  title: "Tên khách hàng",
                  dataIndex: "full_name",
                  render: (v) => <span className="font-medium">{v}</span>,
                },
                {
                  title: "Email",
                  dataIndex: "email",
                },
                {
                  title: "Số điện thoại",
                  dataIndex: "phone",
                },
                {
                  title: "Tổng đơn hàng",
                  dataIndex: "total_orders",
                  render: (v) => <span className="font-semibold">{v}</span>,
                },
                {
                  title: "Tổng chi tiêu",
                  dataIndex: "total_spent",
                  render: (v) => (
                    <span
                      className="font-semibold"
                      style={{ color: "#c8102e" }}
                    >
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
                {
                  title: "Giá trị trung bình",
                  dataIndex: "avg_order_value",
                  render: (v) => (
                    <span className="font-semibold">
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
                {
                  title: "Đơn hàng cuối",
                  dataIndex: "last_order_date",
                },
              ]}
              rowKey={(record, index) => index}
              pagination={false}
              loading={loading}
              bordered={false}
              size="middle"
            />
          ) : (
            <Empty
              description="Không có dữ liệu khách hàng"
              style={{ marginTop: 48, marginBottom: 48 }}
            />
          )}
        </Card>

        {/* Coupons */}
        <Card
          style={{
            marginTop: "24px",
          }}
          className="rounded-2xl border border-gray-100 shadow-sm mt-5"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 m-0">
              Thống kê mã giảm giá
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Hiệu suất của các mã giảm giá
            </p>
          </div>
          {coupons.length > 0 ? (
            <Table
              dataSource={coupons}
              columns={[
                {
                  title: "Mã giảm giá",
                  dataIndex: "coupon_code",
                  render: (v) => <span className="font-medium">{v}</span>,
                },
                {
                  title: "Giảm %",
                  dataIndex: "discount_percentage",
                  render: (v) => (v ? `${v}%` : "-"),
                },
                {
                  title: "Giảm tiền",
                  dataIndex: "discount_amount",
                  render: (v) => (v ? `${Number(v).toLocaleString()}₫` : "-"),
                },
                {
                  title: "Số lần sử dụng",
                  dataIndex: "usage_count",
                  render: (v) => <span className="font-semibold">{v}</span>,
                },
                {
                  title: "Doanh thu sau giảm",
                  dataIndex: "total_revenue_after_discount",
                  render: (v) => (
                    <span
                      className="font-semibold"
                      style={{ color: "#c8102e" }}
                    >
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
                {
                  title: "Tổng giảm giá",
                  dataIndex: "total_discount_given",
                  render: (v) => (
                    <span className="font-semibold text-green-600">
                      {Number(v).toLocaleString()}₫
                    </span>
                  ),
                },
              ]}
              rowKey={(record, index) => index}
              pagination={false}
              loading={loading}
              bordered={false}
              size="middle"
            />
          ) : (
            <Empty
              description="Không có dữ liệu mã giảm giá"
              style={{ marginTop: 48, marginBottom: 48 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default IndexPage;
