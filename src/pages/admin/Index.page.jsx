import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Typography, Table, Tag, Space, Select, message, Statistic, Progress, Divider } from "antd";
import { Link } from "react-router-dom";
import { getDashboardStatsApi, getMonthlyRevenueApi, getOrdersApi } from "../../services/api.service";
import { 
  BarChartOutlined, 
  ShoppingCartOutlined, 
  TeamOutlined, 
  ProfileOutlined, 
  ArrowRightOutlined, 
  AppstoreOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import "./index.page.css";

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, m, o] = await Promise.all([
        getDashboardStatsApi(),
        getMonthlyRevenueApi({ year }),
        getOrdersApi(),
      ]);
      setStats(s.data?.data || s.data || null);
      setMonthly(m.data?.data || m.data || []);
      const allOrders = o?.data || o || [];
      const normalizedOrders = Array.isArray(allOrders) ? allOrders : [];
      setOrders(normalizedOrders);
      setRecentOrders(normalizedOrders.slice(0, 6));
      
      // Debug: Check created_at field
      if (normalizedOrders.length > 0) {
        console.log("First order created_at:", normalizedOrders[0]?.created_at);
        console.log("All order fields:", Object.keys(normalizedOrders[0] || {}));
      }
    } catch (e) {
      message.error("Tải dashboard thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
      }),
    []
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const formatCurrency = (value) => `${currencyFormatter.format(Math.round(Number(value) || 0))}₫`;
  const formatNumber = (value) => numberFormatter.format(Math.round(Number(value) || 0));

  const computedOverview = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];
    const activeOrders = orderList.filter((order) => order?.status !== "cancelled");
    const derivedOrders = activeOrders.length;
    const derivedRevenue = activeOrders.reduce((sum, order) => sum + Number(order?.total_amount || 0), 0);
    const derivedCustomers = activeOrders.reduce((set, order) => {
      const id = order?.user_id ?? order?.user?.id ?? null;
      if (id !== null && id !== undefined) {
        set.add(id);
      }
      return set;
    }, new Set()).size;

    const fallbackOrders = Number(stats?.overview?.total_orders ?? stats?.total_orders ?? 0);
    const fallbackRevenue = Number(stats?.overview?.total_revenue ?? stats?.total_revenue ?? 0);
    const fallbackCustomers = Number(stats?.overview?.unique_customers ?? stats?.unique_customers ?? 0);

    const ordersTotal = derivedOrders || fallbackOrders;
    const revenueTotal = derivedRevenue || fallbackRevenue;
    const customerTotal = derivedCustomers || fallbackCustomers;
    const avgOrderValue = ordersTotal > 0 ? revenueTotal / ordersTotal : 0;

    return {
      revenue: revenueTotal,
      orders: ordersTotal,
      uniqueCustomers: customerTotal,
      avgOrderValue,
    };
  }, [orders, stats]);

  const statusData = useMemo(() => {
    const arr = stats?.order_status || [];
    const map = {
      pending: { label: "Chờ xác nhận", color: "default" },
      confirmed: { label: "Đã xác nhận", color: "blue" },
      shipped: { label: "Đang giao", color: "orange" },
      delivered: { label: "Đã giao", color: "green" },
      cancelled: { label: "Đã huỷ", color: "red" },
    };
    return arr.map((i) => ({ ...i, ...map[i.status] }));
  }, [stats]);

  const columns = [
    { title: "Trạng thái", dataIndex: "label", render: (v, r) => <Tag color={r.color}>{v}</Tag> },
    { title: "Số đơn", dataIndex: "count", render: (v) => formatNumber(v) },
    { title: "Tổng tiền", dataIndex: "total_amount", render: (v) => formatCurrency(v) },
  ];

  const maxRevenue = useMemo(() => {
    return monthly.reduce((m, x) => Math.max(m, Number(x.total_revenue || 0)), 0) || 1;
  }, [monthly]);

  // Tính toán thống kê chi tiết
  const detailedStats = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Đơn hàng hôm nay
    const todayOrders = orderList.filter(order => {
      if (!order.created_at) return false;
      try {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === today.toDateString();
      } catch (e) {
        return false;
      }
    });
    
    // Đơn hàng tháng này
    const thisMonthOrders = orderList.filter(order => {
      if (!order.created_at) return false;
      try {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
      } catch (e) {
        return false;
      }
    });
    
    // Doanh thu hôm nay
    const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order?.total_amount || 0), 0);
    
    // Doanh thu tháng này
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order?.total_amount || 0), 0);
    
    // Đơn hàng đã giao
    const deliveredOrders = orderList.filter(order => order?.status === 'delivered');
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order?.total_amount || 0), 0);
    
    // Tỷ lệ hoàn thành
    const completionRate = orderList.length > 0 ? (deliveredOrders.length / orderList.length) * 100 : 0;
    
    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue,
      deliveredOrders: deliveredOrders.length,
      deliveredRevenue,
      completionRate,
      totalOrders: orderList.length,
      totalRevenue: computedOverview.revenue,
      uniqueCustomers: computedOverview.uniqueCustomers,
      avgOrderValue: computedOverview.avgOrderValue
    };
  }, [orders, computedOverview]);

  const statCards = [
    {
      key: "revenue",
      label: "Tổng doanh thu",
      value: formatCurrency(detailedStats.totalRevenue),
      icon: <DollarOutlined />,
      theme: "stat-card--revenue",
      trend: detailedStats.thisMonthRevenue > 0 ? "up" : "neutral",
      subtitle: `Tháng này: ${formatCurrency(detailedStats.thisMonthRevenue)}`
    },
    {
      key: "orders",
      label: "Tổng đơn hàng",
      value: formatNumber(detailedStats.totalOrders),
      icon: <ShoppingCartOutlined />,
      theme: "stat-card--orders",
      trend: detailedStats.todayOrders > 0 ? "up" : "neutral",
      subtitle: `Hôm nay: ${detailedStats.todayOrders} đơn`
    },
    {
      key: "customers",
      label: "Khách hàng",
      value: formatNumber(detailedStats.uniqueCustomers),
      icon: <TeamOutlined />,
      theme: "stat-card--customers",
      trend: "neutral",
      subtitle: `Trung bình: ${Math.round(detailedStats.avgOrderValue).toLocaleString()}₫/đơn`
    },
    {
      key: "delivered",
      label: "Đã giao",
      value: formatNumber(detailedStats.deliveredOrders),
      icon: <TrophyOutlined />,
      theme: "stat-card--delivered",
      trend: detailedStats.completionRate > 80 ? "up" : "neutral",
      subtitle: `${Math.round(detailedStats.completionRate)}% hoàn thành`
    },
  ];

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const quickLinks = useMemo(
    () => [
      { key: "categories", to: "/admin/categories", label: "Danh mục", icon: AppstoreOutlined, color: "#1677ff" },
      { key: "products", to: "/admin/products", label: "Sản phẩm", icon: ProfileOutlined, color: "#faad14" },
      { key: "orders", to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCartOutlined, color: "#ff4d4f" },
      { key: "customers", to: "/admin/customers", label: "Khách hàng", icon: TeamOutlined, color: "#52c41a" },
      { key: "content", to: "/admin/content", label: "Nội dung", icon: BarChartOutlined, color: "#13c2c2" },
    ],
    []
  );

  return (
    <div className="dashboard">
      <div className="dashboard__inner">
        <Card bordered={false} className="dashboard-hero">
          <div className="dashboard-hero__content">
            <div className="dashboard-hero__intro">
              <Typography.Title level={3}>Tổng quan bán hàng</Typography.Title>
            </div>
            <Tag className="dashboard-hero__tag">{todayLabel}</Tag>
          </div>
        </Card>

        <Row gutter={[16, 16]} className="dashboard-stats-row">
          {statCards.map(({ key, label, value, icon, theme, trend, subtitle }) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Card 
                loading={loading} 
                bordered={false} 
                className={`dashboard-stat-card ${theme}`}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '8px',
                      fontSize: '14px',
                      opacity: 0.9
                    }}>
                      {icon}
                      <span>{label}</span>
                      {trend === "up" && <RiseOutlined style={{ color: '#52c41a' }} />}
                      {trend === "down" && <FallOutlined style={{ color: '#ff4d4f' }} />}
                    </div>
                    <Statistic
                      value={value}
                      valueStyle={{ 
                        color: 'white', 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        margin: 0
                      }}
                    />
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.8, 
                      marginTop: '4px' 
                    }}>
                      {subtitle}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]} className="dashboard-section-row">
          <Col xs={24} xl={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChartOutlined />
                  <span>Thống kê đơn hàng</span>
                </div>
              } 
              loading={loading} 
              bordered={false} 
              className="dashboard-card"
            >
              <Table
                size="small"
                rowKey={(r) => r.status}
                pagination={false}
                columns={columns}
                dataSource={statusData}
              />
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Tỷ lệ hoàn thành"
                    value={Math.round(detailedStats.completionRate)}
                    suffix="%"
                    valueStyle={{ color: detailedStats.completionRate > 80 ? '#3f8600' : '#cf1322' }}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Doanh thu đã giao"
                    value={formatCurrency(detailedStats.deliveredRevenue)}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card
              bordered={false}
              className="dashboard-card"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    📊 Doanh thu theo tháng
                  </Typography.Title>
                  <Select
                    size="small"
                    value={year}
                    onChange={setYear}
                    style={{ minWidth: 90 }}
                    options={[0, 1, 2, 3, 4].map((d) => ({
                      label: new Date().getFullYear() - d,
                      value: new Date().getFullYear() - d,
                    }))}
                  />
                </div>
              }
              loading={loading}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {monthly.map((m, index) => {
                  const value = Number(m.total_revenue || 0);
                  const percent = Math.round((value / maxRevenue) * 100);
                  const monthName = m.month_name || `Tháng ${m.month}`;
                  
                  return (
                    <div key={m.month} style={{ 
                      padding: '12px', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Typography.Text strong style={{ fontSize: '14px' }}>
                          {monthName}
                        </Typography.Text>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                            {formatCurrency(value)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {formatNumber(m.total_orders)} đơn hàng
                          </div>
                        </div>
                      </div>
                      <Progress 
                        percent={percent} 
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={8}
                        showInfo={false}
                      />
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '4px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        <span>Tiến độ: {percent}%</span>
                        <span>Trung bình: {formatCurrency(value / (m.total_orders || 1))}/đơn</span>
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[20, 20]} className="dashboard-section-row">
          <Col xs={24} xl={12}>
            <Card
              bordered={false}
              className="dashboard-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined />
                  <span>Đơn hàng gần đây</span>
                </div>
              }
              extra={
                <Link to="/admin/orders" style={{ color: '#1890ff', textDecoration: 'none' }}>
                  Xem tất cả →
                </Link>
              }
            >
              <Table
                size="small"
                rowKey={(r) => r.id}
                pagination={false}
                dataSource={recentOrders}
                columns={[
                  { 
                    title: "Mã", 
                    dataIndex: "id", 
                    width: 60,
                    render: (id) => <Tag color="blue">#{id}</Tag>
                  },
                  { 
                    title: "Khách hàng", 
                    render: (_, r) => (
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {r?.user?.full_name || r?.user?.email || `User#${r.user_id}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {(() => {
                            if (!r.created_at) return 'Không có ngày tạo';
                            try {
                              const date = new Date(r.created_at);
                              return date.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            } catch (e) {
                              return 'Ngày không hợp lệ';
                            }
                          })()}
                        </div>
                      </div>
                    )
                  },
                  { 
                    title: "Tổng tiền", 
                    dataIndex: "total_amount", 
                    width: 100, 
                    render: (v) => (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          {formatCurrency(v)}
                        </div>
                      </div>
                    )
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    width: 100,
                    render: (v) => {
                      const map = {
                        pending: ["Chờ xác nhận", "default"],
                        confirmed: ["Đã xác nhận", "blue"],
                        shipped: ["Đang giao", "orange"],
                        delivered: ["Đã giao", "green"],
                        cancelled: ["Đã huỷ", "red"],
                      };
                      const [label, color] = map[v] || [v, "default"];
                      return <Tag color={color}>{label}</Tag>;
                    },
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card 
              bordered={false} 
              className="dashboard-card" 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AppstoreOutlined />
                  <span>Quản trị nhanh</span>
                </div>
              }
            >
              <Row gutter={[12, 12]}>
                {quickLinks.map(({ key, to, label, icon: Icon, color }) => (
                  <Col xs={12} sm={8} lg={12} key={key}>
                    <Link to={to} style={{ textDecoration: 'none' }}>
                      <Card 
                        hoverable 
                        bordered={false}
                        style={{ 
                          background: `linear-gradient(135deg, ${color}15, ${color}25)`,
                          border: `1px solid ${color}30`,
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              color: color, 
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Icon />
                            </div>
                            <span style={{ 
                              fontWeight: '500',
                              color: '#333'
                            }}>
                              {label}
                            </span>
                          </div>
                          <ArrowRightOutlined style={{ 
                            color: color, 
                            fontSize: '12px',
                            opacity: 0.7
                          }} />
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default IndexPage;
