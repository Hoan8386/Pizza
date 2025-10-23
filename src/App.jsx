import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { HomePage } from "./pages/home.page";
import { LoginPage } from "./pages/Login.page";
import { RegisterPage } from "./pages/Register.page";
import { useContext } from "react";
import { useState } from "react";
import { AuthContext } from "./components/context/auth.context";
import LayoutApp from "./components/share/Layout.app";
import { Spin, Layout, Menu } from "antd";
import { InfoPage } from "./pages/Info.page";
import { CartPage } from "./pages/Cart.page";
import { CheckOut } from "./components/client/checkout/CheckOut";
import ForgotPassword from "./components/client/forgot/ForgotPassword";
import { DetailCombo } from "./components/client/combos/Detail.page";
import { OrderPage } from "./pages/Order.page";
import IndexPage from "./pages/admin/Index.page";
import ProductAdmin from "./pages/admin/ProductAdmin";
import OrderAdmin from "./pages/admin/OrderAdmin";
import CatalogAdmin from "./pages/admin/CatalogAdmin";
import CustomerAdmin from "./pages/admin/CustomerAdmin";
import ContentAdmin from "./pages/admin/ContentAdmin";
import ProtectedRoute from "./share/ProtectedRoute";
import NewsPage from "./pages/News.page";
import "./styles/admin.css";

import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

const LayoutClient = () => {
  const { isAppLoading } = useContext(AuthContext);
  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50% , -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div className="w-[1170px]  mx-auto">
            <Header />
            <Outlet />
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

const LayoutAdmin = () => {
  const { isAppLoading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: "Danh mục",
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng",
    },
    {
      key: "/admin/customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
    },
    {
      key: "/admin/content",
      icon: <FileTextOutlined />,
      label: "Nội dung",
    },
  ];

  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname === "/admin") return "/admin";

    // Sort by length descending to match longest path first
    const sortedItems = [...menuItems].sort(
      (a, b) => b.key.length - a.key.length
    );
    const found = sortedItems.find(
      (item) => pathname === item.key || pathname.startsWith(item.key + "/")
    );
    return found ? found.key : "/admin";
  };

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path.includes("categories")) return "Danh mục";
    if (path.includes("products")) return "Sản phẩm";
    if (path.includes("orders")) return "Đơn hàng";
    if (path.includes("customers")) return "Khách hàng";
    if (path.includes("content")) return "Nội dung";
    return "Admin";
  };

  if (isAppLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #fef5f6 0%, #fff 100%)",
        overflowY: scroll,
      }}
    >
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          background:
            "linear-gradient(180deg, #c8102e 0%, #a00d26 50%, #8b0d1f 100%)",
          boxShadow: "4px 0 20px rgba(200,16,46,0.4)",
          borderRadius: "0 20px 20px 0",
          overflow: "hidden",
        }}
        trigger={null}
      >
        {/* Logo */}
        <div
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0 20px" : "0 28px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            borderBottom: "2px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(10px)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {!collapsed && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "bold",
                  lineHeight: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  letterSpacing: "0.5px",
                }}
              >
                🍕 Pizza Admin
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 13,
                  marginTop: 6,
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                Quản lý hệ thống
              </div>
            </div>
          )}
          {collapsed && (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: 28,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              🍕
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            color: "#fff",
            background: "rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
          }}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 18, color: "#fff" }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 18, color: "#fff" }} />
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: "transparent",
            border: "none",
            marginTop: 20,
            padding: "0 8px",
          }}
          className="admin-menu"
        />

        {/* Bottom Links */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: collapsed ? "20px" : "20px 28px",
              color: "#fff",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <HomeOutlined style={{ fontSize: 18 }} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Trang chủ</span>}
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: collapsed ? "20px" : "20px 28px",
              color: "#fff",
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <LogoutOutlined style={{ fontSize: 18 }} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Đăng xuất</span>}
          </div>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Top Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #fff 0%, #fef5f6 50%, #fff 100%)",
            padding: "24px 40px",
            boxShadow: "0 4px 20px rgba(200,16,46,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid rgba(200,16,46,0.1)",
            backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: "#c8102e",
                textShadow: "0 1px 2px rgba(200,16,46,0.1)",
                letterSpacing: "0.5px",
              }}
            >
              {getPageTitle()}
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 16,
                color: "#666",
                fontWeight: 400,
              }}
            >
              Quản lý và thống kê hệ thống
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #c8102e 0%, #e65100 100%)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "25px",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(200,16,46,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>📅</span>
              <span>{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            background: "linear-gradient(135deg, #fef5f6 0%, #fff 100%)",
            overflowY: "auto",
            overflowX: "hidden",
            flex: 1,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      //errorElement: <ErrorPage />,
      children: [
        // { index: true, element: <HomePage /> },
        { index: true, element: <HomePage></HomePage> },
        { path: "info", element: <InfoPage /> },
        { path: "cart", element: <CartPage /> },
        { path: "checkout", element: <CheckOut /> },
        { path: "combos/:id", element: <DetailCombo /> },
        { path: "order", element: <OrderPage /> },
        { path: "news", element: <NewsPage /> },
      ],
    },

    // { path: "/thanks", element: <ThanksPage /> },

    // // Auth Pages
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/forgot", element: <ForgotPassword /> },

    {
      path: "/admin",
      element: (
        <LayoutApp>
          <ProtectedRoute allowedRoles={["admin"]}>
            <LayoutAdmin />
          </ProtectedRoute>
        </LayoutApp>
      ),
      children: [
        { index: true, element: <IndexPage /> },
        { path: "categories", element: <CatalogAdmin /> },
        { path: "products", element: <ProductAdmin /> },
        { path: "orders", element: <OrderAdmin /> },
        { path: "customers", element: <CustomerAdmin /> },
        { path: "content", element: <ContentAdmin /> },
        { path: "catalogs", element: <CatalogAdmin /> },

        // { path: "dish", element: <TableDish /> },
        // { path: "info", element: <InfoPageAdmin /> },
        // { path: "order", element: <OrderPageAdmin /> },
        // { path: "user", element: <UserPageAdmin /> },
      ],
    },
    // { path: "/unauthorized", element: <Unauthorized /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
