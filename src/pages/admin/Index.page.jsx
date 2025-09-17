import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Table, Tag, Space, Select, Menu, message } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getDashboardStatsApi, getMonthlyRevenueApi } from "../../services/api.service";

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        getDashboardStatsApi(),
        getMonthlyRevenueApi({ year }),
      ]);
      setStats(s.data?.data || s.data || null);
      setMonthly(m.data?.data || m.data || []);
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
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>
        Bảng điều khiển
      </Typography.Title>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Card title="Danh mục" bodyStyle={{ padding: 0 }}>
            <Menu
              mode="inline"
              selectable={false}
              items={[
                { key: "dashboard", label: <Link to="/admin">Tổng quan</Link> },
                { key: "products", label: <Link to="/admin/products">Sản phẩm</Link> },
                { key: "orders", label: <Link to="/admin/orders">Đơn hàng</Link> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Card loading={loading}>
                <Statistic title="Doanh thu" value={(Number(stats?.overview?.total_revenue||0)).toLocaleString()} suffix="₫" />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading}>
                <Statistic title="Tổng đơn" value={Number(stats?.overview?.total_orders||0)} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading}>
                <Statistic title="Khách hàng" value={Number(stats?.overview?.unique_customers||0)} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card loading={loading}>
                <Statistic title="Giá trị TB" value={(Number(stats?.overview?.avg_order_value||0)).toLocaleString()} suffix="₫" />
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
            <Col xs={24}>
              <Card title="Danh mục quản trị nhanh">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                  <Link to="/admin/products"><Card hoverable bodyStyle={{ padding: 12 }}>Sản phẩm</Card></Link>
                  <Link to="/admin/catalogs"><Card hoverable bodyStyle={{ padding: 12 }}>Danh mục</Card></Link>
                  <Link to="/admin/orders"><Card hoverable bodyStyle={{ padding: 12 }}>Đơn hàng</Card></Link>
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
