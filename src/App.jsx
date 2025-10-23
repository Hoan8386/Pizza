import { createBrowserRouter, Outlet, RouterProvider, Link, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { HomePage } from "./pages/home.page";
import { Banner } from "./components/client/banner/banner";
import { LoginPage } from "./pages/Login.page";
import { RegisterPage } from "./pages/Register.page";
import { useContext } from "react";
import { AuthContext } from "./components/context/auth.context";
import LayoutApp from "./components/share/Layout.app";
import { Spin } from "antd";
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

import emblem from "./assets/Pizza-Hut-Emblem.png";
import adminBg from "./assets/PizzaHut.jpg";

import NewsPage from "./pages/News.page";


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
  const pathname = location.pathname;
  const active = (href) => (pathname.startsWith(href) || (href === "/admin" && pathname === "/admin"));
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
        <div
          style={{
            backgroundImage: `url(${adminBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
          }}
        >
          <div style={{ backdropFilter: "blur(2px)", background: "rgba(255,255,255,0.85)" }}>
            <div style={{ maxWidth: 1170, margin: "0 auto", width: "100%", padding: "12px 12px 16px 12px" }}>
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
                  <img src={emblem} alt="Admin" style={{ height: 36 }} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>Pizza Admin</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>Quản trị hệ thống bán hàng</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                  <Link to="/" style={{ color: "#fff" }}>Trang chủ</Link>
                  <span style={{ opacity: 0.7 }}>/</span>
                  <Link to="/admin" style={{ color: "#fff" }}>Admin</Link>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12 }}>
                <aside style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                }}>
                  <div style={{
                    background: "linear-gradient(90deg,#fff1f0,#ffffff)",
                    border: "1px solid #ffd3cf",
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 10,
                    color: "#d93025",
                    fontWeight: 1000,
                  }}>Danh Mục Quản Lý</div>
                  <nav>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin") ? "#d93025" : "#333", background: active("/admin") ? "#fff7f5" : "transparent", border: active("/admin") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin">Tổng quan</Link></li>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin/categories") ? "#d93025" : "#333", background: active("/admin/categories") ? "#fff7f5" : "transparent", border: active("/admin/categories") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin/categories">Danh mục sản phẩm</Link></li>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin/products") ? "#d93025" : "#333", background: active("/admin/products") ? "#fff7f5" : "transparent", border: active("/admin/products") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin/products">Sản phẩm</Link></li>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin/orders") ? "#d93025" : "#333", background: active("/admin/orders") ? "#fff7f5" : "transparent", border: active("/admin/orders") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin/orders">Đơn hàng</Link></li>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin/customers") ? "#d93025" : "#333", background: active("/admin/customers") ? "#fff7f5" : "transparent", border: active("/admin/customers") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin/customers">Khách hàng</Link></li>
                      <li><Link style={{ display: "block", padding: "10px 12px", borderRadius: 8, fontWeight: 600, color: active("/admin/content") ? "#d93025" : "#333", background: active("/admin/content") ? "#fff7f5" : "transparent", border: active("/admin/content") ? "1px solid #ffd3cf" : "1px solid transparent" }} to="/admin/content">Nội dung</Link></li>
                    </ul>
                  </nav>
                </aside>
                <main style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                  minHeight: 480,
                }}>
                  <Outlet />
                </main>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
