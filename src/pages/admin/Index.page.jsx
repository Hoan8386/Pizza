import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Table, Tag, Space, Select, Menu, message } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getDashboardStatsApi, getMonthlyRevenueApi, getOrdersApi } from "../../services/api.service";
import { BarChartOutlined, ShoppingCartOutlined, TeamOutlined, ProfileOutlined, ArrowRightOutlined, AppstoreOutlined } from "@ant-design/icons";

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
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
      setRecentOrders(Array.isArray(allOrders) ? allOrders.slice(0, 6) : []);
    } catch (e) {
      message.error("Tải dashboard thất bại");
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
    { title: "Số đơn", dataIndex: "count" },
    { title: "Tổng tiền", dataIndex: "total_amount", render: (v) => Number(v||0).toLocaleString()+"₫" },
  ];

  const maxRevenue = useMemo(() => {
    return monthly.reduce((m, x) => Math.max(m, Number(x.total_revenue || 0)), 0) || 1;
  }, [monthly]);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 12, color: "#d93025" }}>
        Admin Dashboard
      </Typography.Title>

      <Row gutter={[12, 12]}>
       
        <Col xs={24} md={18}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Card loading={loading} style={{ background: "linear-gradient(135deg,#e6f7ff,#ffffff)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888" }}>Doanh thu</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{(Number(stats?.overview?.total_revenue||0)).toLocaleString()}₫</div>
                  </div>
                  <div style={{ lineHeight: 0, display: "flex", alignItems: "center" }}>
                    <BarChartOutlined style={{ fontSize: 28, color: "#1677ff" }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading} style={{ background: "linear-gradient(135deg,#fff1f0,#ffffff)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888" }}>Tổng đơn</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{Number(stats?.overview?.total_orders||0)}</div>
                  </div>
                  <div style={{ lineHeight: 0, display: "flex", alignItems: "center" }}>
                    <ShoppingCartOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading} style={{ background: "linear-gradient(135deg,#f6ffed,#ffffff)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888" }}>Khách hàng</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{Number(stats?.overview?.unique_customers||0)}</div>
                  </div>
                  <div style={{ lineHeight: 0, display: "flex", alignItems: "center" }}>
                    <TeamOutlined style={{ fontSize: 28, color: "#52c41a" }} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading} style={{ background: "linear-gradient(135deg,#fffbe6,#ffffff)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#888" }}>Giá trị TB</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{(Number(stats?.overview?.avg_order_value||0)).toLocaleString()}₫</div>
                  </div>
                  <div style={{ lineHeight: 0, display: "flex", alignItems: "center" }}>
                    <ProfileOutlined style={{ fontSize: 28, color: "#faad14" }} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
            <Col xs={24} md={12}>
              <Card title="Đơn theo trạng thái" loading={loading}>
                <Table
                  size="small"
                  rowKey={(r) => r.status}
                  pagination={false}
                  columns={columns}
                  dataSource={statusData}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    Doanh thu theo tháng
                    <Select
                      size="small"
                      value={year}
                      onChange={setYear}
                      options={[0,1,2,3,4].map((d)=>({
                        label: new Date().getFullYear()-d,
                        value: new Date().getFullYear()-d,
                      }))}
                    />
                  </Space>
                }
                loading={loading}
              >
                <div>
                  {monthly.map((m) => {
                    const value = Number(m.total_revenue || 0);
                    const percent = Math.round((value / maxRevenue) * 100);
                    return (
                      <div key={m.month} style={{ padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div>{m.month_name || `${m.month}/${m.year}`}</div>
                          <div>{value.toLocaleString()}₫ ({m.total_orders} đơn)</div>
                        </div>
                        <div style={{ background: "#f0f2f5", height: 8, borderRadius: 6, overflow: "hidden" }}>
                          <div style={{ width: `${percent}%`, height: "100%", background: "#1677ff" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
            <Col xs={24} md={12}>
              <Card title="Đơn hàng gần đây" extra={<Link to="/admin/orders">Xem tất cả</Link>}>
                <Table
                  size="small"
                  rowKey={(r)=>r.id}
                  pagination={false}
                  dataSource={recentOrders}
                  columns={[
                    { title: "Mã", dataIndex: "id", width: 80 },
                    { title: "Khách", render: (_, r) => r?.user?.full_name || r?.user?.email || `User#${r.user_id}` },
                    { title: "Tổng", dataIndex: "total_amount", width: 120, render: (v)=>Number(v||0).toLocaleString()+"₫" },
                    { title: "TT", dataIndex: "status", width: 120, render: (v)=>{
                      const map = { pending: ["Chờ", "default"], confirmed: ["Xác nhận", "blue"], shipped:["Đang giao","orange"], delivered:["Đã giao","green"], cancelled:["Huỷ","red"] };
                      const [label,color] = map[v] || [v, "default"]; return <Tag color={color}>{label}</Tag>;
                    }},
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Danh mục quản trị nhanh">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <Link to="/admin/categories"><Card hoverable bodyStyle={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Space><AppstoreOutlined /> Danh mục</Space>
                    <ArrowRightOutlined />
                  </Card></Link>
                  <Link to="/admin/products"><Card hoverable bodyStyle={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Space><ProfileOutlined /> Sản phẩm</Space>
                    <ArrowRightOutlined />
                  </Card></Link>
                  <Link to="/admin/orders"><Card hoverable bodyStyle={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Space><ShoppingCartOutlined /> Đơn hàng</Space>
                    <ArrowRightOutlined />
                  </Card></Link>
                  <Link to="/admin/customers"><Card hoverable bodyStyle={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Space><TeamOutlined /> Khách hàng</Space>
                    <ArrowRightOutlined />
                  </Card></Link>
                  <Link to="/admin/content"><Card hoverable bodyStyle={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Space><BarChartOutlined /> Nội dung</Space>
                    <ArrowRightOutlined />
                  </Card></Link>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default IndexPage;
